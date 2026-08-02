# Coordinate system

Use millimetres throughout the model.

- `x` increases from the left side of the lot to the right side when viewed
  from the street.
- `y` increases from the street/front (`y=0`) toward the rear.
- `z` increases upward.
- The lot is 6000 mm wide by 10000 mm deep; its lower-left plan corner is
  `(0, 0)`.

The right half is `x >= 3000` and contains `front_garden`, `bedroom_1`,
`bathroom`, `corridor`, and `bedroom_2`. The left half is `x + width <= 3000`
for `carport`, `front_terrace`, `family_room`, and `rear_yard`.

Wall `start` and `end` are plan coordinates. An opening's `offset` is measured
along its parent wall from that wall's `start` point, not from the lot origin.
