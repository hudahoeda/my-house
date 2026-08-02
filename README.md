# My House — code-first FreeCAD model

This repository models a 6 m × 10 m house from declarative data. The primary workflow is now programmatic: edit `house.json`, validate it with Python, and generate an inspectable FreeCAD model with `FreeCADCmd`.

The existing React/Vite viewer remains in the repository as a legacy visual reference. It is no longer intended to be the canonical geometry source.

## Current orientation

Viewed from the street:

- **Right wing:** front garden, Bedroom 1, bathroom and corridor, Bedroom 2.
- **Left wing:** carport, front terrace, family room, rear yard.

The coordinate system is:

- `x = 0…6000`: left to right
- `y = 0…10000`: street to rear
- `z`: upward
- all dimensions are millimetres

## Files

```text
house.json                 Canonical dimensions and objects
scripts/house_config.py    Shared validation helpers
scripts/validate_house.py  Validation without FreeCAD
scripts/build_house.py     Headless FreeCAD generator
tests/                     Dimensional and orientation checks
build/                     Generated FCStd and STEP files, ignored by Git
src/                       Legacy React Three Fiber viewer
```

## Validate without FreeCAD

```bash
make check
```

This uses only the Python standard library.

## Generate the FreeCAD model

Install FreeCAD and run:

```bash
make build
```

The default executable is `FreeCADCmd`. On distributions that install the lowercase command, run:

```bash
make build FREECADCMD=freecadcmd
```

Generated outputs:

```text
build/house.FCStd
build/house.step
```

Open `build/house.FCStd` in FreeCAD for inspection and manual measurements. The STEP file is provided for interchange with other CAD and rendering tools.

## Give Codex a house change

A useful instruction is concrete and dimensional:

> Move the Bedroom 1 window 300 mm toward the rear, increase it to 1400 mm wide, run the model checks, and regenerate the FreeCAD file.

Codex should edit the declarative data, run `make check`, and run `make build` when FreeCAD is available. See `AGENTS.md` for repository-specific rules.

## Model scope

The first FreeCAD migration intentionally uses reliable solids:

- floor slabs for each named space
- wall solids generated from endpoints
- wall openings cut from door and window definitions
- simple furniture bounding boxes for clearance planning
- grouped and labeled objects inside the FreeCAD document

Later iterations can add BIM/IFC semantics, detailed door and window objects, imported furniture assets, roofs, plumbing, and rendered views without replacing the declarative model.
