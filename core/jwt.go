package core

import (
	"context"
	"net/http"
	"github.com/dgrijalva/jwt-go"
)

var JwtKey = []byte("SUPER_SECRET");

type JwtClaims struct {
	Name string `json:"name"`;
	ID   uint64 `json:"id"`;
	jwt.StandardClaims;
}

type contextKey string
const (
	NameKey contextKey = "name"
	IdKey   contextKey = "name"
	RoleKey contextKey = "role"
)

func JwtMiddleware(next http.Handler, unprotected []string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		for _, path := range unprotected {
			if r.URL.Path == path { next.ServeHTTP(w, r); return; }
		}

		tkn_cookie, err := r.Cookie("token");
		if err != nil {
			Log(ERROR, "missing jwt in request");
			http.Error(w, "missing token", http.StatusUnauthorized);
			return;
		}

		tkn_str  := tkn_cookie.Value;
		claims   := &JwtClaims{};
		tkn, err := jwt.ParseWithClaims(
			tkn_str, claims,
			func(tkn *jwt.Token) (interface{}, error) {
				return JwtKey, nil
			},
		);

		if err != nil || !tkn.Valid {
			Log(ERROR, "invalid jwt in request");
			http.Error(w, "invalid token", http.StatusUnauthorized);
			return;
		}

		ctx := context.WithValue(r.Context(), NameKey, claims.Name);
		ctx  = context.WithValue(ctx, IdKey, claims.ID);
		ctx  = context.WithValue(ctx, RoleKey, "standard");

		next.ServeHTTP(w, r.WithContext(ctx));
	});
}

func ValidateJWT(tokenString string) (*JwtClaims, error) {
    claims := &JwtClaims{}
		token, err := jwt.ParseWithClaims(
			tokenString, claims,
			func(token *jwt.Token) (interface{}, error) {
					return JwtKey, nil
			})
    if err != nil || !token.Valid {
        return nil, err
    }
    return claims, nil
}
