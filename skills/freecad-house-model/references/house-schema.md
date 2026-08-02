# House JSON schema

`house.json` contains these top-level sections:

- `schema_version` and `project`: model metadata, units, and coordinate system.
- `lot`: positive `width` and `depth`.
- `defaults`: wall height, wall thicknesses, floor thickness, and door height.
- `spaces`: rectangular areas with `id`, `kind`, `x`, `y`, `width`, `depth`, and
  optional `level`.
- `walls`: line segments with `id`, `kind`, `start`, and `end`.
- `openings`: `id`, `wall_id`, `kind`, `offset`, `width`, `height`, and `sill`.
- `furniture`: bounding boxes with `id`, `kind`, `space_id`, position,
  dimensions, height, and optional rotation.

IDs are the stable handles used by `housectl inspect`, geometric diffs, and the
FreeCAD object's `SourceId` metadata. Keep IDs stable when changing dimensions.
Use the existing collection and field names instead of adding hard-coded
geometry to `scripts/build_house.py`.
