package service

import (
	"bytes"
	"context"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"math/big"
	"net/http"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"

	"backend/internal/database"
	"backend/internal/handler/middleware"
	"backend/internal/model/entity"
	"backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// Bind akun lokal ke akun DOSCOM lewat sso-auth. Alur:
//  1. user klik tombol di Settings → backend cek status + minta URL form bind.
//  2. browser membuka form sso-auth (isi data / konfirmasi + OTP).
//  3. sso-auth redirect balik ke callback backend dengan bind_token (RS256).
//  4. callback verifikasi receipt lewat JWKS, lalu redirect ke Settings frontend.

const ssoBindReceiptEvent = "account.bind"

// SSOBindStartHandler memulai alur bind untuk user yang sedang login.
// Response: {bound:true} bila sudah terhubung, atau {bound:false,url} untuk
// membuka halaman form sso-auth.
func SSOBindStartHandler(c *gin.Context) {
	user, ok := currentSSOBindUser(c)
	if !ok {
		return
	}
	if ssoBaseURL() == "" || ssoClientID() == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"success": false,
			"message": "Integrasi DOSCOM belum dikonfigurasi di server",
			"data":    nil,
			"error":   "SSO_BASE_URL atau SSO_CLIENT_ID kosong",
		})
		return
	}

	name := strings.TrimSpace(utils.DecryptOrSelf(user.Name))
	email := strings.ToLower(strings.TrimSpace(utils.DecryptOrSelf(user.Email)))

	bound, err := ssoBindingStatus(c.Request.Context(), email)
	if err != nil {
		log.Printf("[SSO] cek status bind gagal: %v", err)
		c.JSON(http.StatusBadGateway, gin.H{
			"success": false,
			"message": "Gagal memeriksa status akun DOSCOM. Silakan coba lagi.",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}
	if bound {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Akun sudah terhubung ke DOSCOM",
			"data":    gin.H{"bound": true},
			"error":   nil,
		})
		return
	}

	bindURL, err := ssoCreateBindRequest(c.Request.Context(), name, email)
	if err != nil {
		log.Printf("[SSO] buat permintaan bind gagal: %v", err)
		c.JSON(http.StatusBadGateway, gin.H{
			"success": false,
			"message": "Gagal menghubungkan akun DOSCOM. Silakan coba lagi.",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Halaman verifikasi DOSCOM siap",
		"data":    gin.H{"bound": false, "url": bindURL},
		"error":   nil,
	})
}

// SSOBindStatusHandler cek status bind akun lokal ke client DOSCOM ini.
func SSOBindStatusHandler(c *gin.Context) {
	user, ok := currentSSOBindUser(c)
	if !ok {
		return
	}
	if ssoBaseURL() == "" || ssoClientID() == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"success": false,
			"message": "Integrasi DOSCOM belum dikonfigurasi di server",
			"data":    nil,
			"error":   "SSO_BASE_URL atau SSO_CLIENT_ID kosong",
		})
		return
	}

	email := strings.ToLower(strings.TrimSpace(utils.DecryptOrSelf(user.Email)))
	bound, err := ssoBindingStatus(c.Request.Context(), email)
	if err != nil {
		log.Printf("[SSO] cek status bind gagal: %v", err)
		c.JSON(http.StatusBadGateway, gin.H{
			"success": false,
			"message": "Gagal memeriksa status akun DOSCOM. Silakan coba lagi.",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Status bind DOSCOM",
		"data":    gin.H{"bound": bound},
		"error":   nil,
	})
}

// SSOBindCallbackHandler menerima redirect dari sso-auth setelah bind selesai.
// bind_token adalah receipt RS256; verifikasi lewat JWKS sebelum redirect
// ke frontend supaya status sukses tidak bisa dipalsukan.
func SSOBindCallbackHandler(c *gin.Context) {
	token := strings.TrimSpace(c.Query("bind_token"))
	if token == "" {
		ssoRedirectBindResult(c, false)
		return
	}

	if _, err := verifySSOBindReceipt(c.Request.Context(), token); err != nil {
		log.Printf("[SSO] verifikasi bind_token gagal: %v", err)
		ssoRedirectBindResult(c, false)
		return
	}

	ssoRedirectBindResult(c, true)
}

func currentSSOBindUser(c *gin.Context) (*entity.User, bool) {
	raw, exists := c.Get(middleware.UIDCK)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
			"data":    nil,
			"error":   "user_id not found in context",
		})
		return nil, false
	}
	uid, ok := raw.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Unauthorized",
			"data":    nil,
			"error":   "invalid user id",
		})
		return nil, false
	}

	var user entity.User
	if err := database.DB.Select("uid", "name", "email").First(&user, uid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "Pengguna tidak ditemukan",
			"data":    nil,
			"error":   err.Error(),
		})
		return nil, false
	}
	return &user, true
}

func ssoBindingStatus(ctx context.Context, email string) (bool, error) {
	query := url.Values{}
	query.Set("email", email)
	query.Set("client_id", ssoClientID())

	req, err := http.NewRequestWithContext(ctx, http.MethodGet,
		ssoBaseURL()+"/api/auth/binding/status?"+query.Encode(), nil)
	if err != nil {
		return false, err
	}

	resp, err := ssoHTTPClient.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(io.LimitReader(resp.Body, 8192))
	if err != nil {
		return false, err
	}
	// Akun belum ada di SSO = belum terbind, bukan error.
	if resp.StatusCode == http.StatusNotFound {
		return false, nil
	}
	if resp.StatusCode != http.StatusOK {
		return false, fmt.Errorf("sso: binding/status -> %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}

	var out struct {
		Data struct {
			Bound bool `json:"bound"`
		} `json:"data"`
	}
	if err := json.Unmarshal(body, &out); err != nil {
		return false, err
	}
	return out.Data.Bound, nil
}

func ssoCreateBindRequest(ctx context.Context, name, email string) (string, error) {
	payload, err := json.Marshal(map[string]string{
		"name":       name,
		"email":      email,
		"client_id":  ssoClientID(),
		"return_url": ssoBindRedirectURL(),
	})
	if err != nil {
		return "", err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost,
		ssoBaseURL()+"/api/auth/bind", bytes.NewReader(payload))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := ssoHTTPClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(io.LimitReader(resp.Body, 8192))
	if err != nil {
		return "", err
	}
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("sso: /api/auth/bind -> %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}

	var out struct {
		Data struct {
			URL string `json:"url"`
		} `json:"data"`
	}
	if err := json.Unmarshal(body, &out); err != nil {
		return "", err
	}
	if out.Data.URL == "" {
		return "", errors.New("sso: respons bind tanpa url")
	}
	return out.Data.URL, nil
}

// ssoBindRedirectURL adalah callback backend yang menerima bind_token.
// Bisa di-override lewat SSO_BIND_REDIRECT_URI; default diturunkan dari
// SSO_REDIRECT_URI agar prefix proxy produksi ikut terbawa.
func ssoBindRedirectURL() string {
	if v := strings.TrimSpace(os.Getenv("SSO_BIND_REDIRECT_URI")); v != "" {
		return v
	}
	if v := strings.TrimSpace(os.Getenv("SSO_REDIRECT_URI")); strings.Contains(v, "/auth/sso/callback") {
		return strings.Replace(v, "/auth/sso/callback", "/auth/sso/bind/callback", 1)
	}
	return "http://localhost:8080/auth/sso/bind/callback"
}

func ssoRedirectBindResult(c *gin.Context, success bool) {
	target := "/settings?bind=error"
	if success {
		target = "/settings?bind=success"
	}
	c.Redirect(http.StatusSeeOther, ssoResolveFrontendTarget(target))
}

// verifySSOBindReceipt validasi signature RS256 lewat JWKS, issuer, audience,
// expiry, dan event bind. Return email dari receipt.
func verifySSOBindReceipt(ctx context.Context, tokenString string) (string, error) {
	keys, err := ssoFetchJWKS(ctx)
	if err != nil {
		return "", err
	}

	claims := jwt.MapClaims{}
	parsed, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (any, error) {
		if t.Method.Alg() != jwt.SigningMethodRS256.Alg() {
			return nil, fmt.Errorf("alg tidak didukung: %s", t.Method.Alg())
		}
		kid, _ := t.Header["kid"].(string)
		key := keys[kid]
		if key == nil {
			// sso-auth menandatangani receipt tanpa header kid; JWKS hanya
			// punya satu key, jadi fallback ke key pertama.
			key = keys[""]
		}
		if key == nil {
			return nil, errors.New("key JWKS tidak ditemukan")
		}
		return key, nil
	},
		jwt.WithIssuer(ssoBaseURL()),
		jwt.WithAudience(ssoClientID()),
		jwt.WithValidMethods([]string{jwt.SigningMethodRS256.Alg()}),
		jwt.WithExpirationRequired(),
	)
	if err != nil {
		return "", err
	}
	if !parsed.Valid {
		return "", errors.New("token tidak valid")
	}

	event, _ := claims["event"].(string)
	if event != ssoBindReceiptEvent {
		return "", fmt.Errorf("event tidak dikenal: %q", event)
	}
	email, _ := claims["email"].(string)
	email = strings.ToLower(strings.TrimSpace(email))
	if email == "" {
		return "", errors.New("claim email kosong")
	}
	return email, nil
}

type cachedSSOJWKS struct {
	keys      map[string]*rsa.PublicKey
	fetchedAt time.Time
}

var (
	ssoJWKSMu    sync.Mutex
	ssoJWKSCache = map[string]cachedSSOJWKS{}
)

const ssoJWKSCacheTTL = 5 * time.Minute

func ssoFetchJWKS(ctx context.Context) (map[string]*rsa.PublicKey, error) {
	baseURL := ssoBaseURL()
	ssoJWKSMu.Lock()
	if cached, ok := ssoJWKSCache[baseURL]; ok && time.Since(cached.fetchedAt) < ssoJWKSCacheTTL {
		ssoJWKSMu.Unlock()
		return cached.keys, nil
	}
	ssoJWKSMu.Unlock()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet,
		baseURL+"/.well-known/jwks.json", nil)
	if err != nil {
		return nil, err
	}

	resp, err := ssoHTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(io.LimitReader(resp.Body, 64*1024))
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("sso: jwks -> %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}

	var out struct {
		Keys []struct {
			Kty string `json:"kty"`
			Kid string `json:"kid"`
			N   string `json:"n"`
			E   string `json:"e"`
		} `json:"keys"`
	}
	if err := json.Unmarshal(body, &out); err != nil {
		return nil, err
	}

	keys := make(map[string]*rsa.PublicKey)
	for _, k := range out.Keys {
		if k.Kty != "RSA" {
			continue
		}
		nBytes, err := base64.RawURLEncoding.DecodeString(k.N)
		if err != nil {
			continue
		}
		eBytes, err := base64.RawURLEncoding.DecodeString(k.E)
		if err != nil {
			continue
		}
		e := 0
		for _, b := range eBytes {
			e = e<<8 | int(b)
		}
		keys[k.Kid] = &rsa.PublicKey{N: new(big.Int).SetBytes(nBytes), E: e}
	}
	if len(keys) == 0 {
		return nil, errors.New("sso: JWKS tanpa key RSA")
	}
	if _, ok := keys[""]; !ok {
		for _, key := range keys {
			keys[""] = key
			break
		}
	}

	ssoJWKSMu.Lock()
	ssoJWKSCache[baseURL] = cachedSSOJWKS{keys: keys, fetchedAt: time.Now()}
	ssoJWKSMu.Unlock()
	return keys, nil
}
