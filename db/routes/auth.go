package routes

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/9ziggy9/core"
	"github.com/dgrijalva/jwt-go"
	"github.com/9ziggy9/9ziggy9.db/schema"
)

func Status(w http.ResponseWriter, r *http.Request) {
    tkn_cookie, err := r.Cookie("token");
    if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized);
			core.Log(core.ERROR, "couldn't find tkn_cookie");
			return;
    }

    tkn_str := tkn_cookie.Value
    claims := &core.JwtClaims{}
    tkn, err := jwt.ParseWithClaims(
			tkn_str, claims,
			func(tkn *jwt.Token) (interface{}, error) { return core.JwtKey, nil },
    )

    if err != nil || !tkn.Valid {
			http.Error(w, "Unauthorized", http.StatusUnauthorized);
			core.Log(core.ERROR, "unauthorized access");
			return;
    }

    response := map[string]string{
			"status": "authenticated",
			"name":   claims.Name,
			"id":     fmt.Sprintf("%d", claims.ID),
    }
    w.Header().Set("Content-Type", "application/json");
    w.WriteHeader(http.StatusOK);
    json.NewEncoder(w).Encode(response);
}

func Login(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		name := r.FormValue("name");
		pwd  := r.FormValue("pwd");
		reg  := r.FormValue("reg");

		isRegistering := false;
		if reg != "" {
			var err error;
			isRegistering, err = strconv.ParseBool(reg)
			if err != nil {
				http.Error(w, "boolean value error", http.StatusInternalServerError);
				core.Log(core.ERROR, "invalid bool value: %v\n", err);
				return;
			}
			if isRegistering == true {
				maybe_already_user := schema.GetUser(db, name);
				if maybe_already_user.Err == nil {
					http.Error(w, "user already exists", http.StatusUnauthorized);
					core.Log(core.ERROR, "user already exists " + name);
					return;
				}
				maybe_user := schema.CreateUser(name, pwd);
				if maybe_user.Err != nil {
					http.Error(w, maybe_user.Err.Error(), http.StatusInternalServerError);
					core.Log(core.ERROR, "failed to create user " + name);
					return;
				}
				maybe_data := maybe_user.Data.Commit(db);
				if maybe_data.Err != nil {
					http.Error(w, maybe_user.Err.Error(), http.StatusInternalServerError);
					core.Log(core.ERROR, "failed to commit user " + name);
					return;
				}
				core.Log(core.SUCCESS, "successfully created user " + name);
			}
		}

		maybe_user := schema.GetUser(db, name);
		if maybe_user.Err != nil {
			http.Error(w, maybe_user.Err.Error(), http.StatusInternalServerError);
			core.Log(core.ERROR, "failed to find user " + name);
			return;
		}

		user := maybe_user.Data;
		if user.PwdOK(pwd) == true {
			tkn := jwt.NewWithClaims(jwt.SigningMethodHS256, &core.JwtClaims{
				Name: user.Name,
				ID: user.ID,
				StandardClaims: jwt.StandardClaims{
					ExpiresAt: time.Now().Add(30 * time.Minute).Unix(),
				},
			});

			tkn_str, err := tkn.SignedString(core.JwtKey);
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError);
				return;
			}

			core.Log(core.INFO, "here is token string: %v\n", tkn_str)

			http.SetCookie(w, &http.Cookie{
				Name		 : "token",
				HttpOnly : true,
				Value		 : tkn_str,
				Path		 : "/",
				SameSite : http.SameSiteNoneMode,
				Secure:   true, // Ensures the cookie is sent over HTTPS
			})

			w.Header().Set("Content-Type", "application/json");
			if err := json.NewEncoder(w).Encode(user); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError);
				return;
			}
			core.Log(core.SUCCESS, "user " + user.Name + " logged in");
		} else {
			http.Error(w, "invalid password", http.StatusUnauthorized);
		}
	}
}

func Logout() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		http.SetCookie(w, &http.Cookie{
			Name:     "token",
			Value:    "",
			Path:     "/",
			HttpOnly: true,
			Expires:  time.Unix(0, 0), // set expiration date in the past
			MaxAge:   -1,              // forces the cookie to expire immediately
		})
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("logged out successfully"))
	}
}
