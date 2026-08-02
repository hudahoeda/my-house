#!/usr/bin/env python3
"""Domain CLI for the declarative house model."""

from __future__ import annotations

import argparse
import json
import math
import os
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any, Iterable

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
DEFAULT_CONFIG_PATH = REPO_ROOT / "house.json"
DEFAULT_BUILD_DIR = REPO_ROOT / "build"

if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from house_config import HouseConfigError, load_config, wall_length  # noqa: E402


MIN_RECOMMENDED_CLEARANCE_MM = 760
RIGHT_SPACE_IDS = {"front_garden", "bedroom_1", "bathroom", "corridor", "bedroom_2"}
LEFT_SPACE_IDS = {"carport", "front_terrace", "family_room", "rear_yard"}
COLLECTIONS = (
    ("spaces", "Spaces"),
    ("walls", "Walls"),
    ("openings", "Openings"),
    ("furniture", "Furniture"),
)
DIMENSION_FIELDS = {
    "width",
    "depth",
    "height",
    "sill",
    "offset",
    "level",
    "wall_height",
    "exterior_wall_thickness",
    "interior_wall_thickness",
    "floor_thickness",
    "door_height",
}


class CliError(RuntimeError):
    """Raised for a user-facing CLI error."""


def number(value: Any) -> str:
    """Format a numeric model value without unnecessary decimal places."""

    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    if isinstance(value, (int, float)):
        return f"{value:g}"
    return str(value)


def mm(value: Any) -> str:
    return f"{number(value)} mm"


def point(value: Iterable[Any]) -> str:
    coordinates = list(value)
    return f"({number(coordinates[0])}, {number(coordinates[1])})"


def title_for(item_id: str) -> str:
    return item_id.replace("_", " ").title()


def resolve_config_path(value: str | None) -> Path:
    return Path(value).expanduser().resolve() if value else DEFAULT_CONFIG_PATH


def resolve_build_dir(value: str | None) -> Path:
    return Path(value).expanduser().resolve() if value else DEFAULT_BUILD_DIR


def config_counts(config: dict[str, Any]) -> str:
    return (
        f"{len(config.get('spaces', []))} spaces, "
        f"{len(config.get('walls', []))} walls, "
        f"{len(config.get('openings', []))} openings, "
        f"{len(config.get('furniture', []))} furniture items"
    )


def read_config(path: Path) -> dict[str, Any]:
    try:
        return load_config(path)
    except (OSError, json.JSONDecodeError, HouseConfigError, ValueError) as exc:
        raise CliError(f"House model is invalid:\n{exc}") from exc


def run_tests() -> int:
    command = [
        sys.executable,
        "-m",
        "unittest",
        "discover",
        "-s",
        str(REPO_ROOT / "tests"),
        "-v",
    ]
    return subprocess.run(command, cwd=REPO_ROOT).returncode


def freecad_executable(requested: str | None) -> str | None:
    configured = requested or os.environ.get("FREECADCMD")
    names = [configured] if configured else ["FreeCADCmd", "freecadcmd"]
    for name in names:
        resolved = shutil.which(name)
        if resolved:
            return resolved
        candidate = Path(name).expanduser()
        if candidate.is_file() and os.access(candidate, os.X_OK):
            return str(candidate.resolve())
    return None


def run_freecad_build(
    config_path: Path,
    build_dir: Path,
    requested_executable: str | None,
    *,
    required: bool,
) -> int:
    executable = freecad_executable(requested_executable)
    if executable is None:
        message = (
            "FreeCADCmd was not found; generation was skipped. "
            "Install FreeCAD or set FREECADCMD to an executable path."
        )
        print(message, file=sys.stderr if required else sys.stdout)
        return 1 if required else 0

    command = [
        executable,
        str(SCRIPT_DIR / "build_house.py"),
        "--",
        str(config_path),
        str(build_dir),
    ]
    print(f"FreeCAD generation: {' '.join(command)}")
    return subprocess.run(command, cwd=REPO_ROOT).returncode


def space_by_id(config: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {space["id"]: space for space in config.get("spaces", [])}


def wall_by_id(config: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {wall["id"]: wall for wall in config.get("walls", [])}


def wing_for_space(space: dict[str, Any], lot: dict[str, Any]) -> str:
    space_id = space.get("id")
    if space_id in RIGHT_SPACE_IDS:
        return "right"
    if space_id in LEFT_SPACE_IDS:
        return "left"

    midpoint = lot["width"] / 2
    left = space["x"]
    right = left + space["width"]
    if right <= midpoint:
        return "left"
    if left >= midpoint:
        return "right"
    return "crosses the centre line"


def opening_center(
    opening: dict[str, Any], wall: dict[str, Any]
) -> tuple[float, float]:
    start_x, start_y = wall["start"]
    end_x, end_y = wall["end"]
    length = wall_length(wall)
    center_offset = opening["offset"] + opening["width"] / 2
    return (
        start_x + (end_x - start_x) * center_offset / length,
        start_y + (end_y - start_y) * center_offset / length,
    )


def _interval_overlaps(first: tuple[float, float], second: tuple[float, float]) -> bool:
    return max(first[0], second[0]) <= min(first[1], second[1])


def opening_on_space_boundary(
    opening: dict[str, Any], wall: dict[str, Any], space: dict[str, Any]
) -> bool:
    """Return whether an opening lies on one of a rectangular space's walls."""

    start_x, start_y = wall["start"]
    end_x, end_y = wall["end"]
    space_left = space["x"]
    space_right = space_left + space["width"]
    space_front = space["y"]
    space_rear = space_front + space["depth"]
    center_x, center_y = opening_center(opening, wall)
    tolerance = 1e-6

    if abs(start_y - end_y) <= tolerance:
        wall_interval = tuple(sorted((start_x, end_x)))
        if abs(start_y - space_front) <= tolerance or abs(start_y - space_rear) <= tolerance:
            if _interval_overlaps(wall_interval, (space_left, space_right)):
                return space_left - tolerance <= center_x <= space_right + tolerance

    if abs(start_x - end_x) <= tolerance:
        wall_interval = tuple(sorted((start_y, end_y)))
        if abs(start_x - space_left) <= tolerance or abs(start_x - space_right) <= tolerance:
            if _interval_overlaps(wall_interval, (space_front, space_rear)):
                return space_front - tolerance <= center_y <= space_rear + tolerance

    return False


def openings_for_space(
    config: dict[str, Any], space: dict[str, Any]
) -> list[dict[str, Any]]:
    walls = wall_by_id(config)
    result = []
    for opening in config.get("openings", []):
        wall = walls.get(opening.get("wall_id"))
        if wall and opening_on_space_boundary(opening, wall, space):
            result.append(opening)
    return result


def opening_ids_for_space(config: dict[str, Any], space_id: str) -> list[str]:
    """Return opening ids inferred from a space's rectangular boundaries."""

    space = space_by_id(config).get(space_id)
    if space is None:
        return []
    return [opening["id"] for opening in openings_for_space(config, space)]


def rectangle(item: dict[str, Any]) -> tuple[float, float, float, float]:
    """Return the declared axis-aligned furniture bounding box.

    Furniture is deliberately treated as a planning bounding box. Rotation is
    retained as metadata for the FreeCAD generator, while x/y/width/depth are
    the stable clearance dimensions used by validation and review.
    """

    return (
        float(item["x"]),
        float(item["y"]),
        float(item["x"] + item["width"]),
        float(item["y"] + item["depth"]),
    )


def rectangles_overlap(
    first: tuple[float, float, float, float],
    second: tuple[float, float, float, float],
) -> bool:
    return (
        first[0] < second[2]
        and first[2] > second[0]
        and first[1] < second[3]
        and first[3] > second[1]
    )


def rectangle_distance(
    first: tuple[float, float, float, float],
    second: tuple[float, float, float, float],
) -> float:
    horizontal = max(first[0] - second[2], second[0] - first[2], 0)
    vertical = max(first[1] - second[3], second[1] - first[3], 0)
    return math.hypot(horizontal, vertical)


def edge_clearance(
    space: dict[str, Any], item: dict[str, Any]
) -> float:
    left, front, right, rear = rectangle(item)
    return min(
        left - space["x"],
        space["x"] + space["width"] - right,
        front - space["y"],
        space["y"] + space["depth"] - rear,
    )


def minimum_space_clearance(
    config: dict[str, Any], space: dict[str, Any]
) -> float | None:
    items = [
        item
        for item in config.get("furniture", [])
        if item.get("space_id") == space.get("id")
    ]
    if not items:
        return None

    minimum = min(edge_clearance(space, item) for item in items)
    for index, first in enumerate(items):
        for second in items[index + 1 :]:
            minimum = min(minimum, rectangle_distance(rectangle(first), rectangle(second)))
    return minimum


def geometry_and_clearance_issues(
    config: dict[str, Any],
) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    spaces = config.get("spaces", [])

    for index, first in enumerate(spaces):
        first_rect = (
            first["x"],
            first["y"],
            first["x"] + first["width"],
            first["y"] + first["depth"],
        )
        for second in spaces[index + 1 :]:
            second_rect = (
                second["x"],
                second["y"],
                second["x"] + second["width"],
                second["y"] + second["depth"],
            )
            if rectangles_overlap(first_rect, second_rect):
                errors.append(f"spaces {first['id']} and {second['id']} overlap")

    spaces_by_id = space_by_id(config)
    furniture_by_space: dict[str, list[dict[str, Any]]] = {}
    for item in config.get("furniture", []):
        space_id = item.get("space_id")
        space = spaces_by_id.get(space_id)
        if space is None:
            continue
        item_rect = rectangle(item)
        space_rect = (
            space["x"],
            space["y"],
            space["x"] + space["width"],
            space["y"] + space["depth"],
        )
        if not (
            item_rect[0] >= space_rect[0]
            and item_rect[1] >= space_rect[1]
            and item_rect[2] <= space_rect[2]
            and item_rect[3] <= space_rect[3]
        ):
            errors.append(f"furniture {item['id']} extends outside space {space_id}")
        furniture_by_space.setdefault(space_id, []).append(item)

    for space_id, items in furniture_by_space.items():
        space = spaces_by_id[space_id]
        for index, first in enumerate(items):
            for second in items[index + 1 :]:
                if rectangles_overlap(rectangle(first), rectangle(second)):
                    errors.append(
                        f"furniture {first['id']} and {second['id']} collide "
                        f"in space {space_id}"
                    )

        minimum = minimum_space_clearance(config, space)
        if minimum is not None and minimum < MIN_RECOMMENDED_CLEARANCE_MM:
            warnings.append(
                f"{space_id} minimum furniture clearance is {number(minimum)} mm "
                f"(recommended {MIN_RECOMMENDED_CLEARANCE_MM} mm)"
            )

    return errors, warnings


def orientation_issues(config: dict[str, Any]) -> list[str]:
    spaces = space_by_id(config)
    errors: list[str] = []
    for space_id in sorted(RIGHT_SPACE_IDS):
        space = spaces.get(space_id)
        if space is None:
            errors.append(f"required right-wing space is missing: {space_id}")
        elif space["x"] < config["lot"]["width"] / 2:
            errors.append(f"space {space_id} is not on the right half of the lot")
    for space_id in sorted(LEFT_SPACE_IDS):
        space = spaces.get(space_id)
        if space is None:
            errors.append(f"required left-wing space is missing: {space_id}")
        elif space["x"] + space["width"] > config["lot"]["width"] / 2:
            errors.append(f"space {space_id} is not on the left half of the lot")
    return errors


def print_space_inspection(config: dict[str, Any], space: dict[str, Any]) -> None:
    openings = openings_for_space(config, space)
    doors = [item["id"] for item in openings if item.get("kind") == "door"]
    windows = [item["id"] for item in openings if item.get("kind") == "window"]
    furniture = [
        item["id"]
        for item in config.get("furniture", [])
        if item.get("space_id") == space["id"]
    ]
    minimum = minimum_space_clearance(config, space)

    print(title_for(space["id"]))
    print(f"Position:       x={number(space['x'])}, y={number(space['y'])}")
    print(
        f"Dimensions:     {number(space['width'])} × {number(space['depth'])} mm"
    )
    print(f"Area:           {space['width'] * space['depth'] / 1_000_000:.2f} m²")
    print(f"Wing:           {wing_for_space(space, config['lot'])}")
    print(f"Doors:          {', '.join(doors) if doors else 'none'}")
    print(f"Windows:        {', '.join(windows) if windows else 'none'}")
    print(f"Furniture:      {', '.join(furniture) if furniture else 'none'}")
    if minimum is not None:
        print(f"Minimum clearance: {number(minimum)} mm")


def print_wall_inspection(config: dict[str, Any], wall: dict[str, Any]) -> None:
    openings = [
        opening
        for opening in config.get("openings", [])
        if opening.get("wall_id") == wall["id"]
    ]
    print(title_for(wall["id"]))
    print(f"Kind:           {wall.get('kind', 'unknown')}")
    print(f"Start:          {point(wall['start'])} mm")
    print(f"End:            {point(wall['end'])} mm")
    print(f"Length:         {mm(wall_length(wall))}")
    print(f"Openings:       {', '.join(item['id'] for item in openings) if openings else 'none'}")


def print_opening_inspection(config: dict[str, Any], opening: dict[str, Any]) -> None:
    walls = wall_by_id(config)
    wall = walls[opening["wall_id"]]
    center = opening_center(opening, wall)
    print(title_for(opening["id"]))
    print(f"Kind:           {opening['kind']}")
    print(f"Wall:           {opening['wall_id']}")
    print(f"Offset:         {mm(opening['offset'])}")
    print(f"Width:          {mm(opening['width'])}")
    print(f"Height:         {mm(opening['height'])}")
    print(f"Sill:           {mm(opening.get('sill', 0))}")
    print(f"Center:         ({number(center[0])}, {number(center[1])}) mm")


def print_furniture_inspection(item: dict[str, Any]) -> None:
    print(title_for(item["id"]))
    print(f"Kind:           {item['kind']}")
    print(f"Space:          {item['space_id']}")
    print(f"Position:       x={number(item['x'])}, y={number(item['y'])}")
    print(f"Dimensions:     {number(item['width'])} × {number(item['depth'])} × {number(item['height'])} mm")
    print(f"Rotation:       {number(item.get('rotation', 0))}°")


def inspect_object(config: dict[str, Any], object_id: str) -> int:
    matches: list[tuple[str, dict[str, Any]]] = []
    for collection, _label in COLLECTIONS:
        matches.extend(
            (collection, item)
            for item in config.get(collection, [])
            if item.get("id") == object_id
        )
    if object_id == "lot":
        print("Lot")
        print(f"Dimensions:     {mm(config['lot']['width'])} × {mm(config['lot']['depth'])}")
        print(f"Area:           {config['lot']['width'] * config['lot']['depth'] / 1_000_000:.2f} m²")
        return 0
    if not matches:
        raise CliError(f"No house object has id '{object_id}'")
    if len(matches) > 1:
        raise CliError(f"Object id '{object_id}' is not unique across model collections")

    collection, item = matches[0]
    if collection == "spaces":
        print_space_inspection(config, item)
    elif collection == "walls":
        print_wall_inspection(config, item)
    elif collection == "openings":
        print_opening_inspection(config, item)
    else:
        print_furniture_inspection(item)
    return 0


def summary(config: dict[str, Any]) -> int:
    right = [space["id"] for space in config["spaces"] if wing_for_space(space, config["lot"]) == "right"]
    left = [space["id"] for space in config["spaces"] if wing_for_space(space, config["lot"]) == "left"]
    opening_kinds: dict[str, int] = {}
    for opening in config.get("openings", []):
        kind = opening.get("kind", "unknown")
        opening_kinds[kind] = opening_kinds.get(kind, 0) + 1

    print(config["project"]["name"])
    print(f"Lot:            {mm(config['lot']['width'])} × {mm(config['lot']['depth'])}")
    print(f"Area:           {config['lot']['width'] * config['lot']['depth'] / 1_000_000:.2f} m²")
    print(f"Spaces:         {len(config.get('spaces', []))}")
    print(f"  Left wing:    {', '.join(left) if left else 'none'}")
    print(f"  Right wing:   {', '.join(right) if right else 'none'}")
    print(f"Walls:          {len(config.get('walls', []))}")
    print(
        "Openings:       "
        f"{len(config.get('openings', []))} "
        f"({', '.join(f'{kind}={count}' for kind, count in sorted(opening_kinds.items()))})"
    )
    print(f"Furniture:      {len(config.get('furniture', []))}")
    print(f"Wall height:    {mm(config['defaults']['wall_height'])}")
    return 0


def run_check(args: argparse.Namespace, config_path: Path) -> int:
    try:
        config = read_config(config_path)
    except CliError as exc:
        print(str(exc), file=sys.stderr)
        return 1

    print(f"Configuration validation: passed ({config_counts(config)})")
    orientation_errors = orientation_issues(config)
    if orientation_errors:
        print("Orientation validation: failed", file=sys.stderr)
        for error in orientation_errors:
            print(f"- {error}", file=sys.stderr)
    else:
        print("Orientation validation: passed")

    geometry_errors, warnings = geometry_and_clearance_issues(config)
    if geometry_errors:
        print("Geometry and clearance validation: failed", file=sys.stderr)
        for error in geometry_errors:
            print(f"- {error}", file=sys.stderr)
    else:
        print("Geometry and clearance validation: passed")
    for warning in warnings:
        print(f"Warning: {warning}")

    print("Python tests:")
    test_status = run_tests()
    if test_status:
        print(f"Python tests failed with exit code {test_status}", file=sys.stderr)

    freecad_status = 0
    if args.no_freecad:
        print("FreeCAD generation: skipped (--no-freecad)")
    else:
        freecad_status = run_freecad_build(
            config_path,
            resolve_build_dir(args.build_dir),
            args.freecadcmd,
            required=False,
        )

    status = 1 if (
        test_status != 0
        or freecad_status != 0
        or orientation_errors
        or geometry_errors
    ) else 0
    if status == 0:
        print("House check passed.")
    else:
        print("House check failed.", file=sys.stderr)
    return status


def git_config_at_ref(reference: str) -> dict[str, Any]:
    result = subprocess.run(
        ["git", "show", f"{reference}:house.json"],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
    )
    if result.returncode:
        detail = result.stderr.strip() or "reference does not contain house.json"
        raise CliError(f"Could not read {reference}:house.json: {detail}")
    try:
        value = json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise CliError(f"{reference}:house.json is not valid JSON: {exc}") from exc
    if not isinstance(value, dict):
        raise CliError(f"{reference}:house.json must contain a JSON object")
    return value


def diff_value(field: str, value: Any) -> str:
    if field in DIMENSION_FIELDS and isinstance(value, (int, float)):
        return mm(value)
    if field in {"start", "end"} and isinstance(value, list):
        return f"{point(value)} mm"
    if isinstance(value, list):
        return json.dumps(value, separators=(",", ":"))
    if isinstance(value, dict):
        return json.dumps(value, sort_keys=True, separators=(",", ":"))
    return str(value)


def item_changes(
    before: dict[str, Any], after: dict[str, Any]
) -> list[tuple[str, Any, Any]]:
    preferred = [
        "x",
        "y",
        "width",
        "depth",
        "height",
        "level",
        "start",
        "end",
        "wall_id",
        "offset",
        "sill",
        "space_id",
        "rotation",
        "kind",
    ]
    keys = [key for key in preferred if key in before or key in after]
    keys.extend(
        sorted(
            key
            for key in set(before) | set(after)
            if key not in keys and key != "id"
        )
    )
    return [
        (key, before.get(key), after.get(key))
        for key in keys
        if before.get(key) != after.get(key)
    ]


def print_collection_diff(
    label: str,
    before_items: list[dict[str, Any]],
    after_items: list[dict[str, Any]],
) -> bool:
    before = {item["id"]: item for item in before_items}
    after = {item["id"]: item for item in after_items}
    added = sorted(set(after) - set(before))
    removed = sorted(set(before) - set(after))
    changed = sorted(
        item_id
        for item_id in set(before) & set(after)
        if item_changes(before[item_id], after[item_id])
    )
    if not (added or removed or changed):
        return False

    print(f"{label}:")
    for item_id in added:
        print(f"  + {item_id}")
    for item_id in removed:
        print(f"  - {item_id}")
    for item_id in changed:
        print(f"  {item_id}")
        for field, old_value, new_value in item_changes(before[item_id], after[item_id]):
            print(f"    {field}: {diff_value(field, old_value)} → {diff_value(field, new_value)}")
    return True


def clearance_diff_warnings(
    before: dict[str, Any], after: dict[str, Any]
) -> list[str]:
    before_spaces = space_by_id(before)
    after_spaces = space_by_id(after)
    warnings: list[str] = []
    for space_id in sorted(set(before_spaces) & set(after_spaces)):
        old_clearance = minimum_space_clearance(before, before_spaces[space_id])
        new_clearance = minimum_space_clearance(after, after_spaces[space_id])
        if old_clearance is not None and new_clearance is not None and new_clearance < old_clearance:
            warnings.append(
                f"{space_id} minimum clearance reduced by "
                f"{number(old_clearance - new_clearance)} mm"
            )
    return warnings


def diff_model(config: dict[str, Any], reference: str) -> int:
    before = git_config_at_ref(reference)
    changed = False
    print(f"Comparing house.json to {reference}:house.json")
    for collection, label in COLLECTIONS:
        changed = print_collection_diff(
            label,
            before.get(collection, []),
            config.get(collection, []),
        ) or changed

    warnings = clearance_diff_warnings(before, config)
    if warnings:
        print("Warnings:")
        for warning in warnings:
            print(f"  {warning}")

    if not changed:
        print("No geometric changes.")
    return 0


def safe_clean_target(path: Path) -> Path:
    target = path.resolve()
    if (
        target == REPO_ROOT
        or REPO_ROOT not in target.parents
        or target.name not in {"build", ".build"}
    ):
        raise CliError(f"Refusing to clean non-build directory: {target}")
    return target


def clean(build_dir: Path) -> int:
    targets = [
        safe_clean_target(build_dir),
        REPO_ROOT / "__pycache__",
        SCRIPT_DIR / "__pycache__",
        REPO_ROOT / "tests" / "__pycache__",
    ]
    removed = []
    for target in targets:
        if target.exists():
            if target.is_dir():
                shutil.rmtree(target)
            else:
                target.unlink()
            removed.append(str(target))
    if removed:
        print("Removed:")
        for target in removed:
            print(f"- {target}")
    else:
        print("Nothing to clean.")
    return 0


def add_common_options(
    parser: argparse.ArgumentParser, *, suppress_defaults: bool = False
) -> None:
    default = argparse.SUPPRESS if suppress_defaults else None
    parser.add_argument(
        "--config", default=default, help="path to the canonical house JSON"
    )
    parser.add_argument(
        "--build-dir", default=default, help="directory for generated FreeCAD files"
    )
    parser.add_argument(
        "--freecadcmd", default=default, help="FreeCADCmd executable or path"
    )


def create_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="housectl",
        description="Validate, inspect, compare, and build the declarative house model.",
    )
    add_common_options(parser)
    commands = parser.add_subparsers(dest="command", required=True)

    for name, help_text in (
        ("validate", "validate house.json without FreeCAD"),
        ("test", "run Python tests"),
        ("summary", "print a compact model summary"),
        ("clean", "remove generated outputs and Python caches"),
    ):
        command = commands.add_parser(name, help=help_text)
        add_common_options(command, suppress_defaults=True)

    check = commands.add_parser("check", help="run the complete quality gate")
    add_common_options(check, suppress_defaults=True)
    check.add_argument(
        "--no-freecad",
        action="store_true",
        help="skip optional FreeCAD generation",
    )

    build = commands.add_parser("build", help="validate and generate FreeCAD outputs")
    add_common_options(build, suppress_defaults=True)

    inspect = commands.add_parser("inspect", help="inspect one model object by id")
    add_common_options(inspect, suppress_defaults=True)
    inspect.add_argument("object_id")

    diff = commands.add_parser("diff", help="compare the model with a Git reference")
    add_common_options(diff, suppress_defaults=True)
    diff.add_argument("reference")

    return parser


def main(argv: list[str] | None = None) -> int:
    args = create_parser().parse_args(argv)
    config_path = resolve_config_path(args.config)

    try:
        if args.command == "validate":
            config = read_config(config_path)
            print(f"House model is valid: {config_counts(config)}.")
            return 0
        if args.command == "test":
            return run_tests()
        if args.command == "summary":
            return summary(read_config(config_path))
        if args.command == "inspect":
            return inspect_object(read_config(config_path), args.object_id)
        if args.command == "diff":
            return diff_model(read_config(config_path), args.reference)
        if args.command == "check":
            return run_check(args, config_path)
        if args.command == "build":
            check_args = argparse.Namespace(
                no_freecad=True,
                build_dir=args.build_dir,
                freecadcmd=args.freecadcmd,
            )
            status = run_check(check_args, config_path)
            if status:
                return status
            return run_freecad_build(
                config_path,
                resolve_build_dir(args.build_dir),
                args.freecadcmd,
                required=True,
            )
        if args.command == "clean":
            return clean(resolve_build_dir(args.build_dir))
    except (CliError, KeyError, TypeError, ValueError) as exc:
        print(str(exc), file=sys.stderr)
        return 1

    return 2


if __name__ == "__main__":
    raise SystemExit(main())
