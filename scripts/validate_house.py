#!/usr/bin/env python3
"""Validate the declarative house model without requiring FreeCAD."""

from __future__ import annotations

import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from house_config import HouseConfigError, load_config  # noqa: E402


def main() -> int:
    args = [arg for arg in sys.argv[1:] if arg != "--"]
    config_path = Path(args[0]) if args else SCRIPT_DIR.parent / "house.json"

    try:
        config = load_config(config_path)
    except (OSError, HouseConfigError, ValueError) as exc:
        print(f"House model is invalid:\n{exc}", file=sys.stderr)
        return 1

    print(
        "House model is valid: "
        f"{len(config['spaces'])} spaces, "
        f"{len(config['walls'])} walls, "
        f"{len(config['openings'])} openings, "
        f"{len(config['furniture'])} furniture items."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
