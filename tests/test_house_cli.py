from __future__ import annotations

import json
import sys
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
SCRIPTS_DIR = REPO_ROOT / "scripts"
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from house_cli import (  # noqa: E402
    geometry_and_clearance_issues,
    opening_ids_for_space,
)


class HouseCliTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        with (REPO_ROOT / "house.json").open("r", encoding="utf-8") as handle:
            cls.config = json.load(handle)

    def test_bedroom_one_openings_are_inferred_from_boundaries(self) -> None:
        self.assertEqual(
            opening_ids_for_space(self.config, "bedroom_1"),
            ["bedroom_1_garden_door", "bedroom_1_door", "bedroom_1_window"],
        )

    def test_current_furniture_has_no_collision_or_containment_error(self) -> None:
        errors, _warnings = geometry_and_clearance_issues(self.config)
        self.assertEqual(errors, [])


if __name__ == "__main__":
    unittest.main()
