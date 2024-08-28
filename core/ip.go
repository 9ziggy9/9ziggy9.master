package core

import (
	"net"
	"net/http"
	"strings"
)

func IpLogWrapper(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		forwardedFor := r.Header.Get("X-Forwarded-For")
		if forwardedFor != "" {
			ip := strings.Split(forwardedFor, ",")[0]
			Log(INFO, "request from IP: %s", ip)
		} else {
			ip := r.RemoteAddr
			host, _, err := net.SplitHostPort(ip)
			if err != nil {
				Log(ERROR, "error splitting IP address: %v", err)
				next.ServeHTTP(w, r)
				return
			}
			ipAddr := net.ParseIP(host)
			if ipAddr != nil && ipAddr.To4() != nil {
				ip = ipAddr.String()
			} else if ipAddr != nil && ipAddr.To16() != nil {
				ip = ipAddr.String()
			}
			Log(INFO, "request from IP: %s", ip)
		}
		next.ServeHTTP(w, r)
	})
}
