.PHONY: up clean DEPLOY

up:
	docker-compose -f $(PATH_COMPOSE) build --no-cache
	docker-compose up

%.build:
	@printf "$(BOLD)$(UNDERLINE)$(MAGENTA)\nBUILDING CONTAINER:"
	@printf	"$(RESET) $(basename $@)\n"
	docker build --no-cache -t 9ziggy9.$(basename $@) ./$(basename $@)

clean:
	docker container prune -f
	docker system prune -f
	docker stop $$(docker ps -a -q)
	docker rm $$(docker ps -a -q)

DEPLOY:
	zrok share reserved 9ziggy9
