FROM golang:1.23 AS builder

WORKDIR /app

COPY core/ ./core
COPY db/ .

RUN go mod download

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o main

FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

COPY --from=builder /app/main .
COPY .env .env

RUN chmod +x /root/main

EXPOSE 9004

CMD ["./main"]
