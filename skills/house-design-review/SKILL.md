---
name: house-design-review
description: Perform a read-only design and geometry review of this repository's house model. Use when asked to assess room boundaries, doors and windows, furniture collisions, walking clearances, orientation, lot bounds, missing measurements, or changes relative to a Git ref without editing files.
---

# House design review

Review the current declarative model without modifying it. Read `AGENTS.md` and
`house.json`; treat generated CAD files and the React/Vite viewer as supporting
artifacts, not sources of truth.

## Review workflow

1. Run `./housectl summary` to establish the lot, wings, object counts, and
   defaults.
2. Run `./housectl check --no-freecad` so the review works without FreeCAD.
3. Run `./housectl diff main` when the requested Git reference exists. Report
   additions, removals, dimensional changes, and clearance reductions.
4. Run `./housectl inspect <id>` for affected rooms, walls, openings, and
   furniture. Follow related ids instead of guessing relationships.
5. Report findings by severity: `Error` for invalid geometry or collisions,
   `Warning` for reduced recommended clearances or unconfirmed assumptions, and
   `Observation` for design trade-offs.

## Checklist

- Keep every space, wall endpoint, opening, and furniture bounding box inside
  the 6000 × 10000 mm lot.
- Keep bedrooms, bathroom, corridor, and front garden on the right half; keep
  carport, terrace, family room, and rear yard on the left.
- Check that every opening references an existing wall, fits within its wall,
  does not overlap another opening, and uses an offset from the wall start.
- Check furniture containment, furniture collisions, and the reported minimum
  clearances. Treat the 760 mm value as a recommended review threshold, not a
  substitute for a confirmed local code or site requirement.
- Identify missing physical measurements such as wall thickness, sill height,
  floor level, door swing, or required accessibility clearance.
- Compare against the requested Git reference and call out unrelated changes.

Do not run `housectl build`, `make build`, `housectl clean`, or any command that
edits the model during a read-only review. End with a concise evidence summary
and explicitly state that no files were changed.
