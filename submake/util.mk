hello:
	@echo "hello from util.mk!"

kill_port:
	@printf "$(RED)Killing port $(PORT)...\n"
	fuser -k -n tcp $(PORT)
