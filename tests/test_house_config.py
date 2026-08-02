from __future__ import annotations

import json
import sys
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
SCRIPTS_DIR = REPO_ROOT / "scripts"
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from house_config import validate_config  # noqa: E402


class HouseConfigTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        with (REPO_ROOT / "house.json").open("r", encoding="utf-8") as handle:
            cls.config = json.load(handle)

    def test_configuration_is_valid(self) -> None:
        self.assertEqual(validate_config(self.config), [])

    def test_lot_is_six_by_ten_metres(self) -> None:
        self.assertEqual(self.config["lot"], {"width": 6000, "depth": 10000})

    def test_bedroom_wing_is_on_the_right(self) -> None:
        spaces = {space["id"]: space for space in self.config["spaces"]}
        for space_id in ("bedroom_1", "bedroom_2", "bathroom", "corridor"):
            self.assertGreaterEqual(spaces[space_id]["x"], 3000)

    def test_social_and_vehicle_spaces_are_on_the_left(self) -> None:
        spaces = {space["id"]: space for space in self.config["spaces"]}
        for space_id in ("family_room", "carport", "front_terrace", "rear_yard"):
            self.assertLessEqual(
                spaces[space_id]["x"] + spaces[space_id]["width"],
                3000,
            )

    def test_bathroom_matches_current_estimate(self) -> None:
        bathroom = next(
            space for space in self.config["spaces"] if space["id"] == "bathroom"
        )
        self.assertEqual((bathroom["width"], bathroom["depth"]), (1300, 1500))


if __name__ == "__main__":
    unittest.main()
