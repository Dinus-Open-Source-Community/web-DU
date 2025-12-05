package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/sessions"
	"github.com/google/uuid"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

/*
ini pake config
*/ 
var oauthConfigs = map[string]*oauth2.Config{
	"google": {
		ClientID:     "GOOGLE_CLIENT_ID",
		ClientSecret: "GOOGLE_CLIENT_SECRET",
		RedirectURL:  "http://localhost:8080/oauth/auth/google/callback",
		Scopes:       []string{"profile", "email"},
		Endpoint:     google.Endpoint,
	},
}

func Home(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message":       "OAuth2 Home",
		"login_example": "/oauth/auth/google",
	})
}

func SignInWithProvider(c *gin.Context) {
	provider := c.Param("provider")

	config, exists := oauthConfigs[provider]
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Provider not supported"})
		return
	}

	// random state
	stateValue := uuid.NewString()

	// simpan state ke session
	session := sessions.Default(c)
	session.Set("oauth_state", stateValue)
	if err := session.Save(); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	// redirect ke halaman login provider
	url := config.AuthCodeURL(stateValue, oauth2.AccessTypeOffline)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func CallbackHandler(c *gin.Context) {
	provider := c.Param("provider")
	config, exists := oauthConfigs[provider]
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Provider not supported"})
		return
	}

	// --- load state from session ---
	session := sessions.Default(c)
	savedState := session.Get("oauth_state")

	// --- get state + code from provider ---
	returnedState := c.Query("state")
	code := c.Query("code")

	if savedState == nil || savedState != returnedState {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid OAuth state"})
		return
	}

	token, err := config.Exchange(c, code)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token exchange failed", "detail": err.Error()})
		return
	}

	// hapus state dari session
	session.Delete("oauth_state")
	session.Save()

	c.JSON(http.StatusOK, gin.H{
		"status":       "OAuth success",
		"access_token": token.AccessToken,
	})
}

func Success(c *gin.Context) {
	provider := c.Query("provider")

	c.JSON(http.StatusOK, gin.H{
		"status":   "OAuth2 Login Success",
		"provider": provider,
		"message":  "You are authenticated!",
	})
}
