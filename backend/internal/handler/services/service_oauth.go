package services

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"io"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

func generateRandomString(length int) (string, error) {
	bytes := make([]byte, length)
	_, err := rand.Read(bytes)
	if err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(bytes)[:length], nil
}

func Home(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Welcome to the OAuth2 Service",
		"data":    nil,
		"error":   nil,
	})
}

func LoginOAuth(c *gin.Context) {
	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	clientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")
	googleOauthConfig := &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  "http://localhost:8080/oauth/google/callback",
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}

	oauthStateString, _ := generateRandomString(32)

	// Parameter: nama, value, maxAge (detik), path, domain, secure, httpOnly
	c.SetCookie("oauthstate", oauthStateString, 3600, "/", "", false, true)
	url := googleOauthConfig.AuthCodeURL(oauthStateString)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func CallbackHandler(c *gin.Context) {
	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	clientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")
	googleOauthConfig := &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  "http://localhost:8080/oauth/google/callback",
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}

	// Validasi state untuk mencegah CSRF
	state := c.Query("state")
	oauthStateString, err := c.Cookie("oauthstate")

	if err != nil || state != oauthStateString {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Invalid OAuth state",
			"data":    nil,
			"error":   "State cookie not found or does not match",
		})
		return
	}

	c.SetCookie("oauthstate", "", -1, "/", "", false, true)

	if state != oauthStateString {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Invalid OAuth state",
			"data":    nil,
			"error":   "State mismatch",
		})
		return
	}

	// Ambil 'code' dari URL params
	code := c.Query("code")

	// Tukar 'code' dengan 'token' (Access Token)
	token, err := googleOauthConfig.Exchange(context.Background(), code)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Code exchange failed",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Gunakan token untuk mengambil data user dari Google API
	response, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + token.AccessToken)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get user info",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}
	defer response.Body.Close()

	// Baca hasil response body
	contents, err := io.ReadAll(response.Body)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to read user info",
			"data":    nil,
			"error":   err.Error(),
		})
		return
	}

	// Tampilkan data user (JSON) ke browser
	c.Data(http.StatusOK, "application/json", contents)
}
