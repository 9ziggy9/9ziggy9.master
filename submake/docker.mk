.PHONY: up clean DEPLOY

deploy:
	docker-compose down
	docker image prune -f
	docker-compose -f $(PATH_COMPOSE) build --progress=plain --no-cache
	docker-compose up --abort-on-container-exit --remove-orphans --force-recreate

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
