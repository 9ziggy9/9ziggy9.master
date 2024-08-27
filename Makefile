include submake/config.mk
include submake/macro.mk

SUBMAKES:=util docker
DUMMIES:=hello kill_port clean proxy.build up
.PHONY: SUBMAKES

# FORWARD COMMANDS TO ALL SUBMAKES
$(foreach mk, $(SUBMAKES), $(eval $(mk):; $(call FWD_SUBMAKE,$(mk))))

$(DUMMIES):
	@:
