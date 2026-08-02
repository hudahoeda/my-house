# FreeCAD migration workflow

## Why this repository is code-first

The house should be reproducible from source control rather than dependent on manual editor state. `house.json` describes the site, spaces, walls, openings, and furniture placeholders. `scripts/build_house.py` converts that data into FreeCAD solids.

This separation lets Codex change dimensions safely, review diffs, run validations, and regenerate the model.

## Geometry model

Walls are represented by a centre line:

```json
{
  "id": "example_wall",
  "kind": "interior",
  "start": [3000, 3500],
  "end": [3000, 6000]
}
```

The builder derives wall length and rotation from the endpoints. Thickness and height come from `defaults` unless overridden on an individual wall.

Openings reference a wall and use a distance from its start point:

```json
{
  "id": "example_door",
  "wall_id": "example_wall",
  "kind": "door",
  "offset": 700,
  "width": 800,
  "height": 2100,
  "sill": 0
}
```

The opening is subtracted from the generated wall solid. Doors and windows are also represented by metadata objects in the FreeCAD document, making them easy to locate programmatically.

## Validation boundaries

The pure-Python validator checks:

- unique IDs
- positive dimensions
- spaces, walls, and furniture remain within the lot
- openings reference existing walls
- openings fit within wall length and height
- openings on the same wall do not overlap
- furniture references existing spaces

These checks are intentionally geometric and deterministic. They do not yet prove building-code compliance or physical constructability.

## Next migration stages

1. Replace furniture bounding boxes with linked STEP/OBJ assets.
2. Add door and window frame geometry.
3. Add roof, canopy, drainage, and floor slopes.
4. Add IFC classifications using FreeCAD BIM or IfcOpenShell.
5. Add clearance checks between furniture, walls, and door swings.
6. Add a headless image-rendering stage with Blender when presentation renders are needed.
