package main

import (
	"bufio"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"github.com/9ziggy9/9ziggy9.master/core"
)

func LoadEnv(filename string) error {
	core.Log(core.INFO, "loading environment variables from %s ...", filename)
	defer core.Log(core.SUCCESS, "environmental variables loaded")

	file, err := os.Open(filename); if err != nil { return err }
	defer file.Close()

	scanner := bufio.NewScanner(file)

	for scanner.Scan() {
		line := scanner.Text()
		if len(line) == 0 || strings.HasPrefix(line, "#") { continue } // comments

		kvp := strings.SplitN(line, "=", 2)
		if len(kvp) != 2 { continue }

		k := strings.TrimSpace(kvp[0])
		v := strings.TrimSpace(kvp[1])
		os.Setenv(k, v)
	}
	return scanner.Err()
}


const ENV_FILE string = "./.env";

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set(
			"Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS",
		)
		w.Header().Set(
			"Access-Control-Allow-Headers", "Content-Type, Authorization",
		)

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func ipLogWrapper(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Check the X-Forwarded-For header
		forwardedFor := r.Header.Get("X-Forwarded-For")
		if forwardedFor != "" {
			// X-Forwarded-For might contain multiple IPs, take the first one
			ip := strings.Split(forwardedFor, ",")[0]
			core.Log(core.INFO, "request from IP: %s", ip)
		} else {
			// Fallback to RemoteAddr
			ip := r.RemoteAddr
			host, _, err := net.SplitHostPort(ip)
			if err != nil {
				core.Log(core.ERROR, "error splitting IP address: %v", err)
				next.ServeHTTP(w, r)
				return
			}
			ipAddr := net.ParseIP(host)
			if ipAddr != nil && ipAddr.To4() != nil {
				ip = ipAddr.String()
			} else if ipAddr != nil && ipAddr.To16() != nil {
				ip = ipAddr.String()
			}
			core.Log(core.INFO, "request from IP: %s", ip)
		}
		next.ServeHTTP(w, r)
	})
}

func staticHandler() http.Handler {
	return ipLogWrapper(
		corsMiddleware(
			http.HandlerFunc(func (w http.ResponseWriter, r *http.Request) {
				path := strings.TrimPrefix(r.URL.Path, "/")
				if path == "" { path = "index.html"}

				absPath := filepath.Join("./public/dist", path)

				if _, err := filepath.Abs(absPath); err == nil {
					http.ServeFile(w, r, absPath)
				} else {
					http.NotFound(w, r)
				}
		}),
	))
}

func routes() {
	http.Handle("/", staticHandler())
}

func init() {
	if err := LoadEnv(ENV_FILE); err != nil {
		core.Log(core.ERROR, "failed to load environment variables:\n%v", err)
	}
}

func main() {
	server := &http.Server{
		Addr: ":" + os.Getenv("PORT_WEB"),
		Handler: nil,
	}

	var wait_group sync.WaitGroup
	wait_group.Add(1)

	core.Log(core.INFO, "initializing server on port %s ... ", server.Addr[1:])

	go func() {
		defer wait_group.Done()

		routes()

		err := server.ListenAndServe();
		if err != nil && err != http.ErrServerClosed {
			core.Log(core.ERROR, "server failure:\n%v", err)
		}
	}()

	core.Log(core.SUCCESS, "server running on port %s ...", server.Addr[1:])
	wait_group.Wait()
}
