FROM golang:1.23 AS builder

WORKDIR /app

COPY core/ ./core
COPY ws/ .

RUN go mod download

RUN go build -o main .

FROM debian:bookworm-slim

COPY --from=builder /app/main /app/main
COPY .env /app/.env

WORKDIR /app

EXPOSE 9003

CMD ["/app/main"]
