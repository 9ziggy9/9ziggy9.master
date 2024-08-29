FROM golang:1.23 AS builder

WORKDIR /app

COPY core/ ./core
COPY db/ .

RUN go mod tidy
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o main

FROM alpine:latest

RUN apk --no-cache add ca-certificates
RUN apk --no-cache add curl

WORKDIR /root/

COPY --from=builder /app/main .

RUN chmod +x /root/main

EXPOSE 9004

CMD ["./main"]
