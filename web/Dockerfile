FROM golang:1.23.0 AS go-builder

WORKDIR /app

COPY core/ ./core
COPY web/ .

RUN go mod download

RUN go build -o main .

FROM node:18 AS ts-builder

WORKDIR /app

COPY web/public/package.json web/public/package-lock.json ./
RUN npm install

COPY web/public/ .
COPY .env ./

RUN npm run build

FROM debian:bookworm-slim

COPY --from=go-builder /app/main /app/main

COPY --from=ts-builder /app/dist /app/public/dist

WORKDIR /app
COPY .env ./

EXPOSE 9002

CMD ["/app/main"]
