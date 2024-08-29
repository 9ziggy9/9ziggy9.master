package main

import (
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"time"
	"github.com/9ziggy9/core"
	"github.com/9ziggy9/ws/client"
)

func tcpConnect() net.Listener {
	defer core.Log(core.SUCCESS, "successfully opened TCP connection");
	tcp_in, err := net.Listen("tcp", ":"+os.Getenv("PORT_WS"))
	if err != nil {
		core.Log(core.ERROR, "failed to open TCP connection\n  -> %v", err)
	}
	return tcp_in
}

func routesMain(ws_rooms *client.WsRoomProvider) *http.ServeMux {
	mux   := http.NewServeMux()
	mux.Handle("/", core.JwtMiddleware(client.RoutesWS(ws_rooms), []string{
		"/ping",
	}))
	return mux
}

func init() {
	log.SetFlags(log.Ldate | log.Ltime | log.LUTC)
	if err := core.LoadEnv(core.ENV_FILE); err != nil {
		core.Log(core.ERROR, "failed to load environment variables:\n  -> %v", err)
	}
}

func main() {
	tcp_in := tcpConnect()
	defer tcp_in.Close()

	ws_rooms := &client.WsRoomProvider { Rooms: make(map[uint64] *client.WsRoom) }

	server := &http.Server{
		Handler:      routesMain(ws_rooms),
		ReadTimeout:  time.Second * 10,
		WriteTimeout: time.Second * 10,
	}

	err_ch := make(chan error, 1)
	sig_ch := make(chan os.Signal, 1)
	signal.Notify(sig_ch, os.Interrupt)

	go func() { err_ch <- server.Serve(tcp_in) }()
	go client.KeepAlive(ws_rooms)

	select {
	case err := <- err_ch: core.Log(core.ERROR, "failed to serve:\n  -> %v", err)
	case <- sig_ch: core.Log(core.SUCCESS, "received interrupt signal, goodbye")
	}
}
