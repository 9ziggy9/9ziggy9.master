package main

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"github.com/9ziggy9/core"
)

func staticHandler() http.Handler {
	return http.HandlerFunc(func (w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, "/")
		if path == "" { path = "index.html"}
		absPath := filepath.Join("./public/dist", path)
		if _, err := filepath.Abs(absPath); err == nil {
			http.ServeFile(w, r, absPath)
		} else {
			http.NotFound(w, r)
		}
	})
}

func routes() {
	http.Handle("/ping", http.HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK);
			core.Log(core.SUCCESS, "PONG!");
		}));
	http.Handle("/", staticHandler());
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
