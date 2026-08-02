---
name: freecad-house-model
description: Modify, validate, inspect, compare, and generate this repository's declarative FreeCAD house model. Use when changing house.json rooms, walls, openings, furniture, dimensions, orientation, clearances, or CAD outputs, or when running housectl.
---

# FreeCAD house model

## Source of truth

Read `AGENTS.md` before acting. Treat `house.json` as the canonical model. Use
millimetres and the repository coordinate system:

- `x`: left to right when viewed from the street
- `y`: street toward the rear
- `z`: upward

Keep the right wing (`front_garden`, bedrooms, bathroom, and corridor) on the
right half of the 6000 mm lot. Keep the carport, terrace, family room, and rear
yard on the left half. Every space, wall, opening, and furniture item needs a
stable unique `id`.

## Workflow

1. Run `./housectl summary` and `./housectl inspect <affected-id>` before editing.
2. Make the smallest declarative change in `house.json`. Change `scripts/` only
   when the model behavior, not just its dimensions, needs to change.
3. Use `./housectl diff main` to understand the geometric delta when the Git
   reference exists.
4. Run `make check` after every model change. Use
   `./housectl check --no-freecad` when FreeCAD is unavailable and report that
   limitation.
5. Run `make build` (or `./housectl build`) when `FreeCADCmd` is installed.
   The generator must receive `house.json` and write only to `build/`.
6. Report changed ids, old/new dimensions, check results, generated paths, and
   assumptions that still require physical measurement.

Use `scripts/verify_environment.sh` to check the local CLI and FreeCAD
availability before a build.

## Safety rules

- Never edit `build/house.FCStd`, `build/house.step`, or other generated files.
- Keep wall endpoints on the lot and openings within their parent wall.
- Measure opening offsets from the parent wall's start point.
- Do not silently move unrelated rooms, walls, openings, or furniture.
- Preserve the bedroom wing orientation unless the user explicitly changes it.
- Do not modify the legacy React/Vite viewer for a model task.
- Flag wall thickness, floor elevation, opening, clearance, or site-measurement
  assumptions that are not confirmed in `house.json`.

## References

Read these only when the task needs the detail:

- [coordinate-system.md](references/coordinate-system.md) for axes, lot halves,
  and orientation checks.
- [house-schema.md](references/house-schema.md) for the JSON collections and
  dimension fields.
- [modeling-conventions.md](references/modeling-conventions.md) for source,
  validation, build, and generated-artifact rules.
