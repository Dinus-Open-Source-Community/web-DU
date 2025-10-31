package middleware

import (
	"backend/internal/model"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte(os.Getenv("JWT_SECRET_KEY"))

type errorMsg struct {
	Msg string
}

func (e *errorMsg) Error() string {
	return e.Msg
}

func GenerateJWT(name, email string, expiresAt time.Time) (string, error) {
	claims := model.Claims{
		Name:  name,
		Email: email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   "user_auth",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func ParseToken(tokenStr string) (*model.Claims, error) {
	claims := &model.Claims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (any, error) {
		// Ensure token's signing method is HMAC
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, &errorMsg{Msg: "Unexpected signing method"}
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, &errorMsg{Msg: "Invalid token"}
	}

	// Check expiry explicitly if needed (jwt lib usually does it), but we'll do an extra check
	if claims.ExpiresAt == nil || time.Now().After(claims.ExpiresAt.Time) {
		return nil, &errorMsg{Msg: "Token is expired"}
	}

	return claims, nil
}
