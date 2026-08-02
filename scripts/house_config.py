"""Shared configuration loading and validation for the house model."""

from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Any


class HouseConfigError(ValueError):
    """Raised when the declarative house model is invalid."""


def load_config(path: str | Path) -> dict[str, Any]:
    config_path = Path(path)
    with config_path.open("r", encoding="utf-8") as handle:
        config = json.load(handle)

    errors = validate_config(config)
    if errors:
        raise HouseConfigError("\n".join(f"- {error}" for error in errors))
    return config


def wall_length(wall: dict[str, Any]) -> float:
    start_x, start_y = wall["start"]
    end_x, end_y = wall["end"]
    return math.hypot(end_x - start_x, end_y - start_y)


def validate_config(config: dict[str, Any]) -> list[str]:
    errors: list[str] = []

    lot = config.get("lot", {})
    lot_width = lot.get("width", 0)
    lot_depth = lot.get("depth", 0)
    if lot_width <= 0 or lot_depth <= 0:
        errors.append("lot width and depth must be positive")

    defaults = config.get("defaults", {})
    if defaults.get("wall_height", 0) <= 0:
        errors.append("defaults.wall_height must be positive")

    spaces = config.get("spaces", [])
    walls = config.get("walls", [])
    openings = config.get("openings", [])
    furniture = config.get("furniture", [])

    _check_unique_ids(spaces, "space", errors)
    _check_unique_ids(walls, "wall", errors)
    _check_unique_ids(openings, "opening", errors)
    _check_unique_ids(furniture, "furniture", errors)

    space_ids = {space.get("id") for space in spaces}
    wall_by_id = {wall.get("id"): wall for wall in walls}

    for space in spaces:
        space_id = space.get("id", "<unknown>")
        x = space.get("x", -1)
        y = space.get("y", -1)
        width = space.get("width", 0)
        depth = space.get("depth", 0)
        if width <= 0 or depth <= 0:
            errors.append(f"space {space_id} must have positive width and depth")
            continue
        if x < 0 or y < 0 or x + width > lot_width or y + depth > lot_depth:
            errors.append(f"space {space_id} extends outside the lot")

    for wall in walls:
        wall_id = wall.get("id", "<unknown>")
        start = wall.get("start")
        end = wall.get("end")
        if not _valid_point(start) or not _valid_point(end):
            errors.append(f"wall {wall_id} must have numeric start and end points")
            continue
        if wall_length(wall) <= 0:
            errors.append(f"wall {wall_id} has zero length")
        for point_name, point in (("start", start), ("end", end)):
            if point[0] < 0 or point[1] < 0 or point[0] > lot_width or point[1] > lot_depth:
                errors.append(f"wall {wall_id} {point_name} point is outside the lot")

    wall_height = defaults.get("wall_height", 0)
    openings_by_wall: dict[str, list[dict[str, Any]]] = {}
    for opening in openings:
        opening_id = opening.get("id", "<unknown>")
        wall_id = opening.get("wall_id")
        wall = wall_by_id.get(wall_id)
        if wall is None:
            errors.append(f"opening {opening_id} references unknown wall {wall_id}")
            continue

        offset = opening.get("offset", -1)
        width = opening.get("width", 0)
        height = opening.get("height", 0)
        sill = opening.get("sill", 0)
        if offset < 0 or width <= 0 or height <= 0 or sill < 0:
            errors.append(f"opening {opening_id} has invalid dimensions")
            continue
        if offset + width > wall_length(wall):
            errors.append(f"opening {opening_id} extends beyond wall {wall_id}")
        if sill + height > wall_height:
            errors.append(f"opening {opening_id} is taller than the wall")
        openings_by_wall.setdefault(wall_id, []).append(opening)

    for wall_id, wall_openings in openings_by_wall.items():
        sorted_openings = sorted(wall_openings, key=lambda item: item["offset"])
        for first, second in zip(sorted_openings, sorted_openings[1:]):
            if first["offset"] + first["width"] > second["offset"]:
                errors.append(
                    f"openings {first['id']} and {second['id']} overlap on wall {wall_id}"
                )

    for item in furniture:
        item_id = item.get("id", "<unknown>")
        if item.get("space_id") not in space_ids:
            errors.append(f"furniture {item_id} references an unknown space")
        x = item.get("x", -1)
        y = item.get("y", -1)
        width = item.get("width", 0)
        depth = item.get("depth", 0)
        height = item.get("height", 0)
        if width <= 0 or depth <= 0 or height <= 0:
            errors.append(f"furniture {item_id} must have positive dimensions")
            continue
        if x < 0 or y < 0 or x + width > lot_width or y + depth > lot_depth:
            errors.append(f"furniture {item_id} extends outside the lot")

    return errors


def _check_unique_ids(items: list[dict[str, Any]], label: str, errors: list[str]) -> None:
    seen: set[str] = set()
    for item in items:
        item_id = item.get("id")
        if not item_id:
            errors.append(f"{label} is missing an id")
        elif item_id in seen:
            errors.append(f"duplicate {label} id: {item_id}")
        else:
            seen.add(item_id)


def _valid_point(value: Any) -> bool:
    return (
        isinstance(value, list)
        and len(value) == 2
        and all(isinstance(coordinate, (int, float)) for coordinate in value)
    )
