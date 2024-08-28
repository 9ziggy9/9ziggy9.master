module github.com/9ziggy9/9ziggy9.db

go 1.23.0

require (
	github.com/9ziggy9/core v0.0.0
	github.com/lib/pq v1.10.9
	golang.org/x/crypto v0.26.0
)

require github.com/dgrijalva/jwt-go v3.2.0+incompatible

replace github.com/9ziggy9/core v0.0.0 => ./core
