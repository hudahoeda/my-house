# Modeling conventions

`house.json` is the only canonical geometry input. The Python scripts validate
and generate from it; `build/house.FCStd` and `build/house.step` are generated
outputs and must not be edited manually or committed as routine artifacts.

Use this sequence for a model change:

1. Inspect affected ids.
2. Edit the smallest declarative set of fields.
3. Run `make check`.
4. Run `make build` when FreeCAD is available.
5. Inspect the resulting FCStd in FreeCAD and use STEP for interchange.

Keep wall endpoints on the lot. Keep each opening within its parent wall and
avoid overlap with other openings on that wall. Add or update tests when a
dimensional assumption changes. Summarize assumptions that require an on-site
measurement rather than presenting estimates as confirmed facts.
