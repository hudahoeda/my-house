"""Generate the house model with FreeCAD in GUI or headless mode.

Usage:
    FreeCADCmd scripts/build_house.py -- house.json build

On some Linux distributions the executable is named ``freecadcmd``.
"""

from __future__ import annotations

import math
import sys
from pathlib import Path
from typing import Any

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from house_config import load_config, wall_length  # noqa: E402

try:
    import FreeCAD as App
    import Part
except ImportError as exc:  # pragma: no cover - only available inside FreeCAD
    raise SystemExit(
        "This script must run with FreeCADCmd/freecadcmd, not plain Python."
    ) from exc


SPACE_COLORS = {
    "interior": (0.76, 0.64, 0.47),
    "wet": (0.70, 0.82, 0.88),
    "exterior": (0.65, 0.65, 0.62),
    "garden": (0.35, 0.55, 0.25),
}

FURNITURE_COLORS = {
    "bed": (0.78, 0.70, 0.62),
    "sofa": (0.40, 0.50, 0.35),
    "table": (0.55, 0.35, 0.18),
}


def parse_args() -> tuple[Path, Path]:
    args = [arg for arg in sys.argv[1:] if arg != "--"]
    config_path = Path(args[0]).resolve() if args else REPO_ROOT / "house.json"
    output_dir = Path(args[1]).resolve() if len(args) > 1 else REPO_ROOT / "build"
    return config_path, output_dir


def add_metadata(obj: Any, object_id: str, category: str) -> None:
    obj.addProperty("App::PropertyString", "SourceId", "House Model")
    obj.SourceId = object_id
    obj.addProperty("App::PropertyString", "Category", "House Model")
    obj.Category = category


def set_color(obj: Any, color: tuple[float, float, float]) -> None:
    if hasattr(obj, "ViewObject"):
        obj.ViewObject.ShapeColor = color


def create_space_floor(doc: Any, space: dict[str, Any], thickness: float) -> Any:
    level = float(space.get("level", 0))
    shape = Part.makeBox(
        float(space["width"]),
        float(space["depth"]),
        thickness,
        App.Vector(float(space["x"]), float(space["y"]), level - thickness),
    )
    obj = doc.addObject("Part::Feature", f"Space_{space['id']}")
    obj.Label = space["id"].replace("_", " ").title()
    obj.Shape = shape
    add_metadata(obj, space["id"], f"space:{space['kind']}")
    set_color(obj, SPACE_COLORS.get(space["kind"], (0.75, 0.75, 0.75)))
    return obj


def create_wall(
    doc: Any,
    wall: dict[str, Any],
    wall_openings: list[dict[str, Any]],
    defaults: dict[str, Any],
) -> Any:
    start_x, start_y = map(float, wall["start"])
    end_x, end_y = map(float, wall["end"])
    length = wall_length(wall)
    height = float(wall.get("height", defaults["wall_height"]))
    thickness_key = (
        "exterior_wall_thickness"
        if wall["kind"] == "exterior"
        else "interior_wall_thickness"
    )
    thickness = float(wall.get("thickness", defaults[thickness_key]))

    shape = Part.makeBox(length, thickness, height, App.Vector(0, -thickness / 2, 0))
    for opening in wall_openings:
        opening_void = Part.makeBox(
            float(opening["width"]),
            thickness + 200,
            float(opening["height"]),
            App.Vector(
                float(opening["offset"]),
                -thickness / 2 - 100,
                float(opening.get("sill", 0)),
            ),
        )
        shape = shape.cut(opening_void)

    angle_degrees = math.degrees(math.atan2(end_y - start_y, end_x - start_x))
    shape.rotate(App.Vector(0, 0, 0), App.Vector(0, 0, 1), angle_degrees)
    shape.translate(App.Vector(start_x, start_y, 0))

    obj = doc.addObject("Part::Feature", f"Wall_{wall['id']}")
    obj.Label = wall["id"].replace("_", " ").title()
    obj.Shape = shape
    add_metadata(obj, wall["id"], f"wall:{wall['kind']}")
    set_color(
        obj,
        (0.90, 0.84, 0.75)
        if wall["kind"] == "exterior"
        else (0.93, 0.89, 0.84),
    )
    return obj


def create_opening_marker(doc: Any, opening: dict[str, Any], wall: dict[str, Any]) -> Any:
    start_x, start_y = map(float, wall["start"])
    end_x, end_y = map(float, wall["end"])
    length = wall_length(wall)
    direction_x = (end_x - start_x) / length
    direction_y = (end_y - start_y) / length
    center_offset = float(opening["offset"]) + float(opening["width"]) / 2

    obj = doc.addObject("App::FeaturePython", f"Opening_{opening['id']}")
    obj.Label = opening["id"].replace("_", " ").title()
    obj.addProperty("App::PropertyString", "OpeningType", "House Model")
    obj.OpeningType = opening["kind"]
    obj.addProperty("App::PropertyString", "WallId", "House Model")
    obj.WallId = opening["wall_id"]
    obj.addProperty("App::PropertyLength", "Width", "House Model")
    obj.Width = float(opening["width"])
    obj.addProperty("App::PropertyLength", "Height", "House Model")
    obj.Height = float(opening["height"])
    obj.addProperty("App::PropertyLength", "SillHeight", "House Model")
    obj.SillHeight = float(opening.get("sill", 0))
    obj.addProperty("App::PropertyVector", "Center", "House Model")
    obj.Center = App.Vector(
        start_x + direction_x * center_offset,
        start_y + direction_y * center_offset,
        float(opening.get("sill", 0)) + float(opening["height"]) / 2,
    )
    add_metadata(obj, opening["id"], f"opening:{opening['kind']}")
    return obj


def create_furniture(doc: Any, item: dict[str, Any]) -> Any:
    width = float(item["width"])
    depth = float(item["depth"])
    height = float(item["height"])
    origin = App.Vector(float(item["x"]), float(item["y"]), 0)
    shape = Part.makeBox(width, depth, height, origin)
    rotation = float(item.get("rotation", 0))
    if rotation:
        shape.rotate(origin, App.Vector(0, 0, 1), rotation)

    obj = doc.addObject("Part::Feature", f"Furniture_{item['id']}")
    obj.Label = item["id"].replace("_", " ").title()
    obj.Shape = shape
    obj.addProperty("App::PropertyString", "SpaceId", "House Model")
    obj.SpaceId = item["space_id"]
    add_metadata(obj, item["id"], f"furniture:{item['kind']}")
    set_color(obj, FURNITURE_COLORS.get(item["kind"], (0.55, 0.45, 0.35)))
    return obj


def create_lot_outline(doc: Any, lot: dict[str, Any]) -> Any:
    points = [
        App.Vector(0, 0, 0),
        App.Vector(float(lot["width"]), 0, 0),
        App.Vector(float(lot["width"]), float(lot["depth"]), 0),
        App.Vector(0, float(lot["depth"]), 0),
        App.Vector(0, 0, 0),
    ]
    obj = doc.addObject("Part::Feature", "LotOutline")
    obj.Label = "Lot Outline"
    obj.Shape = Part.makePolygon(points)
    add_metadata(obj, "lot", "site")
    if hasattr(obj, "ViewObject"):
        obj.ViewObject.LineColor = (0.20, 0.20, 0.20)
        obj.ViewObject.LineWidth = 3.0
    return obj


def build_document(config: dict[str, Any]) -> tuple[Any, list[Any]]:
    document_name = config["project"]["name"]
    if document_name in App.listDocuments():
        App.closeDocument(document_name)

    doc = App.newDocument(document_name)
    defaults = config["defaults"]

    site_group = doc.addObject("App::DocumentObjectGroup", "Site")
    space_group = doc.addObject("App::DocumentObjectGroup", "Spaces")
    wall_group = doc.addObject("App::DocumentObjectGroup", "Walls")
    opening_group = doc.addObject("App::DocumentObjectGroup", "Openings")
    furniture_group = doc.addObject("App::DocumentObjectGroup", "Furniture")

    site_group.addObject(create_lot_outline(doc, config["lot"]))

    exportable: list[Any] = []
    for space in config["spaces"]:
        obj = create_space_floor(doc, space, float(defaults["floor_thickness"]))
        space_group.addObject(obj)
        exportable.append(obj)

    openings_by_wall: dict[str, list[dict[str, Any]]] = {}
    for opening in config["openings"]:
        openings_by_wall.setdefault(opening["wall_id"], []).append(opening)

    walls_by_id = {wall["id"]: wall for wall in config["walls"]}
    for wall in config["walls"]:
        obj = create_wall(doc, wall, openings_by_wall.get(wall["id"], []), defaults)
        wall_group.addObject(obj)
        exportable.append(obj)

    for opening in config["openings"]:
        marker = create_opening_marker(doc, opening, walls_by_id[opening["wall_id"]])
        opening_group.addObject(marker)

    for item in config.get("furniture", []):
        obj = create_furniture(doc, item)
        furniture_group.addObject(obj)
        exportable.append(obj)

    doc.recompute()
    return doc, exportable


def main() -> int:
    config_path, output_dir = parse_args()
    config = load_config(config_path)
    output_dir.mkdir(parents=True, exist_ok=True)

    doc, exportable = build_document(config)
    fcstd_path = output_dir / "house.FCStd"
    step_path = output_dir / "house.step"

    doc.saveAs(str(fcstd_path))
    Part.export(exportable, str(step_path))

    print(f"Generated {fcstd_path}")
    print(f"Generated {step_path}")
    print(
        f"Model contains {len(config['spaces'])} spaces, "
        f"{len(config['walls'])} walls, {len(config['openings'])} openings, "
        f"and {len(config.get('furniture', []))} furniture placeholders."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
