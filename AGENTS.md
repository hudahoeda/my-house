# Codex instructions

## Source of truth

- `house.json` is the canonical description of the house.
- All dimensions are millimetres.
- Coordinates use `x` from left to right when viewed from the street, `y` from the street toward the rear, and `z` upward.
- The bedrooms, bathroom, corridor, and front garden belong on the right half of the 6 m lot.
- The family room, terrace, carport, and rear yard belong on the left half.
- Files under `build/` are generated artifacts and must not be edited manually.
- The existing React/Vite application is a legacy visual reference. Do not modify it unless a task explicitly asks for the web viewer.

## Required workflow

1. Edit `house.json` and, only when necessary, the scripts in `scripts/`.
2. Run `make check` after every model change.
3. Run `make build` when FreeCAD is installed.
4. Inspect `build/house.FCStd` in FreeCAD and use `build/house.step` for interchange.
5. Keep generated artifacts out of Git unless a task explicitly requests a checked-in snapshot.

## Modeling conventions

- Prefer parameter changes over hard-coded geometry changes.
- Every space, wall, opening, and furniture item must have a stable unique `id`.
- Openings are measured from the wall start point.
- Keep wall endpoints on the lot and keep every opening within its parent wall.
- Add or update tests when changing a dimensional assumption.
- Use conventional commit messages.
