package service

import (
	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/entity"
	"backend/internal/utils"
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// DOSCOM SSO (OAuth2 Authorization Code + PKCE).
// Dokumentasi: https://sso-docs.doscom.org/how-it-works
// Backend bertindak sebagai confidential client: secret hanya dipakai
// server-side saat tukar code di /token, tidak pernah lewat browser.
//
// Terpisah total dari Google OAuth (/oauth/google/*): route, cookie,
// dan konfigurasi berbeda sehingga tidak saling mengganggu.

const (
	ssoStateCookie    = "sso_oauth_state"   // cookie anti-CSRF, padanan "oauthstate" milik Google
	ssoVerifierCookie = "sso_pkce_verifier" // cookie PKCE verifier (S256)
	ssoNextCookie     = "sso_oauth_next"    // cookie tujuan akhir di frontend (?next=), dibawa sampai callback
	ssoCookieMaxAge   = 600                 // 10 menit, cukup untuk satu alur login
)

var ssoHTTPClient = &http.Client{Timeout: 15 * time.Second}

type ssoTokens struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
	RefreshToken string `json:"refresh_token"`
	IDToken      string `json:"id_token"`
	Scope        string `json:"scope"`
}

type ssoUserInfo struct {
	ID            int    `json:"id"`
	Name          string `json:"name"`
	Email         string `json:"email"`
	AvatarURL     string `json:"avatar_url"`
	Type          string `json:"type"`
	EmailVerified bool   `json:"email_verified"`
}

func ssoBaseURL() string {
	return strings.TrimRight(os.Getenv("SSO_BASE_URL"), "/")
}

func ssoClientID() string {
	return os.Getenv("SSO_CLIENT_ID")
}

func ssoClientSecret() string {
	return os.Getenv("SSO_CLIENT_SECRET")
}

// ssoRedirectURL adalah callback backend yang harus terdaftar persis
// di Developer Console SSO.
func ssoRedirectURL() string {
	if v := os.Getenv("SSO_REDIRECT_URI"); v != "" {
		return v
	}
	return "http://localhost:8080/auth/sso/callback"
}

// ssoDefaultFrontendTarget adalah tujuan default bila frontend tidak
// mengirim ?next= atau nilainya tidak valid.
func ssoDefaultFrontendTarget() string {
	return strings.TrimRight(os.Getenv("FRONTEND_BASE_URL"), "/") + "/auth/sso/callback"
}

// ssoAllowedOrigins mengambil daftar origin frontend yang boleh menerima
// redirect, dari FRONTEND_BASE_URL + CORS_ALLOWED_ORIGINS.
func ssoAllowedOrigins() []string {
	var origins []string
	if v := strings.TrimSpace(os.Getenv("FRONTEND_BASE_URL")); v != "" {
		origins = append(origins, v)
	}
	for _, o := range strings.Split(os.Getenv("CORS_ALLOWED_ORIGINS"), ",") {
		if o = strings.TrimSpace(o); o != "" {
			origins = append(origins, o)
		}
	}
	return origins
}

// ssoResolveFrontendTarget memvalidasi parameter ?next= dari frontend agar
// endpoint ini tidak bisa disalahgunakan sebagai open redirector.
//   - Path relatif (/dashboard) → ditempel ke FRONTEND_BASE_URL.
//   - URL penuh → dipakai hanya bila origin-nya ada di allowlist.
//   - Selain itu → fallback ke default.
func ssoResolveFrontendTarget(next string) string {
	fallback := ssoDefaultFrontendTarget()
	next = strings.TrimSpace(next)
	if next == "" {
		return fallback
	}
	if strings.HasPrefix(next, "/") && !strings.HasPrefix(next, "//") {
		return strings.TrimRight(os.Getenv("FRONTEND_BASE_URL"), "/") + next
	}
	u, err := url.Parse(next)
	if err != nil || (u.Scheme != "http" && u.Scheme != "https") || u.Host == "" {
		return fallback
	}
	for _, o := range ssoAllowedOrigins() {
		if ou, err := url.Parse(o); err == nil &&
			strings.EqualFold(ou.Scheme, u.Scheme) &&
			strings.EqualFold(ou.Host, u.Host) {
			return next
		}
	}
	return fallback
}

func ssoRandomToken(byteLen int) (string, error) {
	b := make([]byte, byteLen)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

// ssoPKCEChallenge menghitung challenge S256 dari verifier:
// base64url(sha256(verifier)).
func ssoPKCEChallenge(verifier string) string {
	sum := sha256.Sum256([]byte(verifier))
	return base64.RawURLEncoding.EncodeToString(sum[:])
}

// SSOLoginHandler adalah titik awal alur login SSO. Frontend mengarahkan
// browser ke sini dengan parameter ?next= opsional (path relatif seperti
// /dashboard, atau URL penuh yang origin-nya diizinkan) sebagai tujuan
// akhir setelah login. Backend tidak menerima kredensial apa pun di sini.
//
// @Summary      Login via DOSCOM SSO (Public)
// @Description  Titik awal alur OAuth2 Authorization Code + PKCE. Redirect browser ke halaman login SSO. Parameter ?next= opsional menentukan tujuan akhir di frontend.
// @Tags         Auth
// @Produce      plain
// @Param        next  query  string  false  "Tujuan akhir di frontend (path relatif atau URL penuh yang origin-nya diizinkan)"
// @Success      307  {string}  string  "Redirect ke halaman login SSO"
// @Failure      500  {object}  map[string]any  "Gagal membuat state/PKCE"
// @Router       /auth/sso/login [get]
func SSOLoginHandler(c *gin.Context) {
	state, err := ssoRandomToken(32)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to generate state",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	verifier, err := ssoRandomToken(48)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to generate PKCE verifier",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Simpan state & PKCE verifier di cookie HttpOnly untuk diverifikasi
	// saat callback. Cookie ini milik SSO saja (nama berbeda dari Google).
	c.SetCookie(ssoStateCookie, state, ssoCookieMaxAge, "/", "", false, true)
	c.SetCookie(ssoVerifierCookie, verifier, ssoCookieMaxAge, "/", "", false, true)

	// Tujuan akhir di frontend (?next=) disimpan di cookie (base64 agar aman
	// dari karakter aneh) supaya terbawa sampai callback selesai.
	target := ssoResolveFrontendTarget(c.Query("next"))
	c.SetCookie(ssoNextCookie, base64.RawURLEncoding.EncodeToString([]byte(target)), ssoCookieMaxAge, "/", "", false, true)

	params := url.Values{
		"client_id":             {ssoClientID()},
		"redirect_uri":          {ssoRedirectURL()},
		"response_type":         {"code"},
		"scope":                 {"openid profile email"},
		"state":                 {state},
		"code_challenge":        {ssoPKCEChallenge(verifier)},
		"code_challenge_method": {"S256"},
	}

	c.Redirect(http.StatusTemporaryRedirect, ssoBaseURL()+"/authorize?"+params.Encode())
}

// SSOCallbackHandler menerima redirect balik dari SSO (?code=...&state=...),
// menukar code dengan token (server-side), mengambil profil user dari
// /userinfo, melakukan upsert user lokal, lalu menerbitkan JWT lokal dan
// mengarahkan browser balik ke frontend.
//
// @Summary      Callback DOSCOM SSO (Public)
// @Description  Menerima redirect balik dari SSO, menukar code dengan token, membuat/memperbarui user lokal, menerbitkan JWT lokal 24 jam, lalu redirect ke frontend (token pada URL fragment).
// @Tags         Auth
// @Produce      plain
// @Param        code   query  string  true  "Authorization code dari SSO"
// @Param        state  query  string  true  "State anti-CSRF yang dikirim saat login"
// @Success      307  {string}  string  "Redirect ke frontend (token pada URL fragment, error pada query ?error=)"
// @Router       /auth/sso/callback [get]
func SSOCallbackHandler(c *gin.Context) {
	// Ambil tujuan frontend dari cookie yang dipasang saat /login,
	// lalu validasi ulang untuk keamanan.
	target := ssoDefaultFrontendTarget()
	if raw, err := c.Cookie(ssoNextCookie); err == nil {
		if b, err := base64.RawURLEncoding.DecodeString(raw); err == nil {
			target = ssoResolveFrontendTarget(string(b))
		}
	}
	c.SetCookie(ssoNextCookie, "", -1, "/", "", false, true)

	// SSO mengirim ?error= bila user menolak/membatalkan login
	if e := c.Query("error"); e != "" {
		ssoRedirectFrontend(c, target, url.Values{"error": {e}}, nil)
		return
	}

	// Verifikasi state untuk mencegah CSRF
	state := c.Query("state")
	stateCookie, err := c.Cookie(ssoStateCookie)
	if err != nil || state == "" || state != stateCookie {
		ssoRedirectFrontend(c, target, url.Values{"error": {"invalid_state"}}, nil)
		return
	}
	verifier, _ := c.Cookie(ssoVerifierCookie)

	// Cookie sementara sudah tidak dibutuhkan
	c.SetCookie(ssoStateCookie, "", -1, "/", "", false, true)
	c.SetCookie(ssoVerifierCookie, "", -1, "/", "", false, true)

	tokens, err := ssoExchange(c.Request.Context(), c.Query("code"), verifier)
	if err != nil {
		ssoRedirectFrontend(c, target, url.Values{"error": {"token_exchange_failed"}}, nil)
		return
	}

	info, err := ssoFetchUserinfo(c.Request.Context(), tokens.AccessToken)
	if err != nil {
		ssoRedirectFrontend(c, target, url.Values{"error": {"userinfo_failed"}}, nil)
		return
	}

	// Upsert user lokal — pola sama dengan callback Google OAuth
	email := strings.ToLower(strings.TrimSpace(info.Email))
	emailHash := utils.GenerateBlindIndex(email)
	encName, _ := utils.Encrypt(info.Name)
	encEmail, _ := utils.Encrypt(email)

	var user entity.User
	database.DB.Where("email_hash = ?", emailHash).First(&user)
	if user.Uid == uuid.Nil {
		user = entity.User{
			Name:       encName,
			Email:      encEmail,
			EmailHash:  emailHash,
			AvatarURL:  info.AvatarURL,
			IsVerified: info.EmailVerified,
			Role:       entity.StudentRole, // default role
		}
		if err := database.DB.Create(&user).Error; err != nil {
			ssoRedirectFrontend(c, target, url.Values{"error": {"failed_create_user"}}, nil)
			return
		}
	} else {
		user.Name = encName
		user.Email = encEmail
		user.AvatarURL = info.AvatarURL
		user.IsVerified = info.EmailVerified
		user.UpdatedAt = time.Now()
		if err := database.DB.Save(&user).Error; err != nil {
			ssoRedirectFrontend(c, target, url.Values{"error": {"failed_update_user"}}, nil)
			return
		}
	}

	// Terbitkan JWT lokal 24 jam — konsisten dengan POST /login yang lama.
	// Token dikirim ke frontend lewat URL fragment (#) agar tidak masuk
	// server log / referrer header.
	expiration := time.Now().Add(24 * time.Hour)
	token, err := middleware.GenerateJWT(user.EmailHash, expiration)
	if err != nil {
		ssoRedirectFrontend(c, target, url.Values{"error": {"failed_generate_token"}}, nil)
		return
	}

	ssoRedirectFrontend(c, target, nil, url.Values{
		"token":      {token},
		"expires_at": {expiration.Format(time.RFC3339)},
	})
}

// ssoRedirectFrontend mengarahkan browser balik ke tujuan frontend.
// query → parameter URL (?error=...), fragment → parameter URL (#token=...)
// agar token tidak terekam di server log.
func ssoRedirectFrontend(c *gin.Context, target string, query, fragment url.Values) {
	if len(query) > 0 {
		sep := "?"
		if strings.Contains(target, "?") {
			sep = "&"
		}
		target += sep + query.Encode()
	}
	if len(fragment) > 0 {
		target += "#" + fragment.Encode()
	}
	c.Redirect(http.StatusTemporaryRedirect, target)
}

// ssoExchange menukar authorization code dengan token via POST /token.
// Harus dipanggil server-side karena membawa client_secret.
func ssoExchange(ctx context.Context, code, verifier string) (*ssoTokens, error) {
	form := url.Values{
		"grant_type":   {"authorization_code"},
		"code":         {code},
		"redirect_uri": {ssoRedirectURL()},
		"client_id":    {ssoClientID()},
	}
	if ssoClientSecret() != "" {
		form.Set("client_secret", ssoClientSecret())
	}
	if verifier != "" {
		form.Set("code_verifier", verifier)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, ssoBaseURL()+"/token", strings.NewReader(form.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := ssoHTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var tokens ssoTokens
	if err := json.NewDecoder(resp.Body).Decode(&tokens); err != nil {
		return nil, err
	}
	if resp.StatusCode != http.StatusOK || tokens.AccessToken == "" {
		return nil, fmt.Errorf("sso: token exchange gagal (HTTP %d)", resp.StatusCode)
	}
	return &tokens, nil
}

// ssoFetchUserinfo mengambil profil user dari SSO dengan access token.
func ssoFetchUserinfo(ctx context.Context, accessToken string) (*ssoUserInfo, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, ssoBaseURL()+"/userinfo", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := ssoHTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("sso: /userinfo gagal (HTTP %d)", resp.StatusCode)
	}

	var info ssoUserInfo
	if err := json.Unmarshal(body, &info); err != nil {
		return nil, err
	}
	if info.Email == "" {
		return nil, fmt.Errorf("sso: /userinfo tidak mengembalikan email")
	}
	return &info, nil
}
