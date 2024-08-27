# ANSI escape code macros for text styling
RESET := \033[0m

# Text styles
BOLD			:= \033[1m
UNDERLINE := \033[4m
REVERSED	:= \033[7m
ITALIC		:= \033[3m


# Text colors
BLACK		:= \033[30m
RED			:= \033[31m
GREEN		:= \033[32m
YELLOW	:= \033[33m
BLUE		:= \033[34m
MAGENTA := \033[35m
CYAN		:= \033[36m
WHITE   := \033[37m

# Background colors
BG_BLACK		:= \033[40m
BG_RED			:= \033[41m
BG_GREEN		:= \033[42m
BG_YELLOW		:= \033[43m
BG_BLUE			:= \033[44m
BG_MAGENTA	:= \033[45m
BG_CYAN			:= \033[46m
BG_WHITE		:= \033[47m

define FWD_SUBMAKE
	@printf "$(GREEN)FORWARDING DIRECTIVE TO: $(RESET)submake/$(1).mk\n"
	@printf "$(CYAN)"
	$(MAKE) --no-print-directory -f submake/$(1).mk \
		$(filter-out $(1), $(MAKECMDGOALS))
	@printf "$(RESET)"
endef
