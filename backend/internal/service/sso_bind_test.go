package service

import (
	"crypto/rand"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"math/big"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func TestVerifySSOBindReceipt(t *testing.T) {
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatal(err)
	}

	jwks := map[string]any{
		"keys": []map[string]any{{
			"kty": "RSA",
			"use": "sig",
			"alg": "RS256",
			"kid": "test-key",
			"n":   base64.RawURLEncoding.EncodeToString(key.N.Bytes()),
			"e":   base64.RawURLEncoding.EncodeToString(big.NewInt(int64(key.E)).Bytes()),
		}},
	}
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(jwks)
	}))
	defer server.Close()

	t.Setenv("SSO_BASE_URL", server.URL)
	t.Setenv("SSO_CLIENT_ID", "test-client")

	// sso-auth menandatangani receipt tanpa header kid; verifier harus fallback
	// ke satu-satunya key di JWKS.
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, jwt.MapClaims{
		"iss":   server.URL,
		"sub":   "1",
		"aud":   "test-client",
		"event": "account.bind",
		"email": "User@Example.com",
		"iat":   time.Now().Unix(),
		"exp":   time.Now().Add(time.Minute).Unix(),
	})
	signed, err := token.SignedString(key)
	if err != nil {
		t.Fatal(err)
	}

	email, err := verifySSOBindReceipt(t.Context(), signed)
	if err != nil {
		t.Fatalf("verifySSOBindReceipt() error = %v", err)
	}
	if email != "user@example.com" {
		t.Fatalf("email = %q, want user@example.com", email)
	}
}

func TestVerifySSOBindReceiptRejectsWrongEvent(t *testing.T) {
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatal(err)
	}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		_ = json.NewEncoder(w).Encode(map[string]any{
			"keys": []map[string]any{{
				"kty": "RSA",
				"kid": "test-key",
				"n":   base64.RawURLEncoding.EncodeToString(key.N.Bytes()),
				"e":   base64.RawURLEncoding.EncodeToString(big.NewInt(int64(key.E)).Bytes()),
			}},
		})
	}))
	defer server.Close()

	t.Setenv("SSO_BASE_URL", server.URL)
	t.Setenv("SSO_CLIENT_ID", "test-client")

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, jwt.MapClaims{
		"iss":   server.URL,
		"aud":   "test-client",
		"event": "account.login",
		"email": "user@example.com",
		"exp":   time.Now().Add(time.Minute).Unix(),
	})
	signed, err := token.SignedString(key)
	if err != nil {
		t.Fatal(err)
	}

	if _, err := verifySSOBindReceipt(t.Context(), signed); err == nil {
		t.Fatal("verifySSOBindReceipt() error = nil, want error")
	}
}
