FREECADCMD ?= FreeCADCmd
HOUSE_CONFIG ?= house.json
BUILD_DIR ?= build

.PHONY: validate test check build clean

validate:
	./housectl validate --config "$(HOUSE_CONFIG)"

test:
	./housectl test

check:
	FREECADCMD="$(FREECADCMD)" ./housectl check --config "$(HOUSE_CONFIG)" --build-dir "$(BUILD_DIR)"

build:
	FREECADCMD="$(FREECADCMD)" ./housectl build --config "$(HOUSE_CONFIG)" --build-dir "$(BUILD_DIR)"

clean:
	./housectl clean --build-dir "$(BUILD_DIR)"
