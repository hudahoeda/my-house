PYTHON ?= python3
FREECADCMD ?= FreeCADCmd

.PHONY: validate test check build clean

validate:
	$(PYTHON) scripts/validate_house.py house.json

test:
	$(PYTHON) -m unittest discover -s tests -v

check: validate test

build: check
	$(FREECADCMD) scripts/build_house.py -- house.json build

clean:
	rm -rf build __pycache__ scripts/__pycache__ tests/__pycache__
