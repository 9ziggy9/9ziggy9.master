DIR_ROOT     = $(HOME)/9ziggy9
PATH_COMPOSE = $(DIR_ROOT)/docker-compose.yml
DIR_PROXY    = $(DIR_ROOT)/proxy
PATH_ENV     = $(DIR_ROOT)/.env

ifneq (,$(wildcard ./.env))
    include .env
    export
endif
