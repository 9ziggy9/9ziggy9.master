package main

import (
	"fmt"
	"os"
	"time"
	"database/sql"
	"net"
	"net/http"
	_ "github.com/lib/pq"

	"github.com/9ziggy9/core"
	"github.com/9ziggy9/9ziggy9.db/schema"
	"github.com/9ziggy9/9ziggy9.db/routes"
)

func routesMain(db *sql.DB) *http.ServeMux {
	mux := http.NewServeMux();
	mux.HandleFunc("GET /status",    routes.Status);
	mux.HandleFunc("GET /users",     routes.GetUsers(db));
	mux.HandleFunc("POST /users",    routes.CreateUser(db));
	mux.HandleFunc("POST /login",    routes.Login(db));
	mux.HandleFunc("POST /register", routes.Login(db));
	mux.HandleFunc("GET /logout",    routes.Logout());
	return mux;
}

func tcpConnect() net.Listener {
	defer core.Log(core.SUCCESS, "successfully opened TCP connection");
	tcp_in, err := net.Listen("tcp", ":"+os.Getenv("PORT_DB"));
	if err != nil {
		core.Log(core.ERROR, "failed to open TCP connection\n  -> %v", err);
	}
	return tcp_in;
}

func main() {
	db_conn_str := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
    os.Getenv("DB_HOST"), os.Getenv("DB_PORT"), os.Getenv("DB_USER"),
    os.Getenv("DB_PASS"), os.Getenv("DB_NAME"));

	db, err := sql.Open("postgres", db_conn_str);
	if err != nil { core.Log(core.ERROR, "%s\n", err); }
	defer db.Close();

	if err = db.Ping(); err != nil { core.Log(core.ERROR, "%s\n", err); }

	core.Log(core.SUCCESS, "connected to database");

	if exists, _ := schema.TableExists(db, "users"); exists == false {
		schema.BootstrapTable(db, schema.SQL_USERS_BOOTSTRAP);
	}

	tcp_in := tcpConnect();

	server := &http.Server{
		Handler: core.JwtMiddleware(
			routesMain(db), []string{"/login", "/status", "/logout", "/register"},
		),
		ReadTimeout:  time.Second * 10,
		WriteTimeout: time.Second * 10,
	}

	err_ch := make(chan error, 1);

	go func() { err_ch <- server.Serve(tcp_in); }();

	select {
	case err := <- err_ch: core.Log(core.ERROR, "%v\n", err);
	}
}
