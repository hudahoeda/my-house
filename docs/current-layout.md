# Current house layout and measurements

## Orientation

The current house layout is **6.00 m wide × 10.00 m deep**.

The plan is divided into two 3.00 m-wide wings:

- **Right wing:** Bedroom 2, bathroom/corridor, Bedroom 1, and front garden.
- **Left wing:** rear open yard, family room, front terrace, and carport.

The street and front entrance are at the **front** of the 10 m depth. The rear yard and Bedroom 2 are at the **back**.

> `docs/layout.jpg` and `docs/technical-measurement.md` describe the earlier left-bedroom source orientation. The current React Three Fiber model mirrors that source layout horizontally through `LAYOUT_X_SCALE = -1` in `src/constants.js`.

## Overall dimensions

| Item | Width | Depth | Area |
| --- | ---: | ---: | ---: |
| Lot / full plan | 6.00 m | 10.00 m | 60.00 m² |
| Right wing | 3.00 m | 10.00 m | 30.00 m² |
| Left wing | 3.00 m | 10.00 m | 30.00 m² |

## Right wing: bedrooms and bathroom

Measured from the back toward the street:

| Space | Width | Depth | Approx. area |
| --- | ---: | ---: | ---: |
| Bedroom 2 | 3.00 m | 2.50 m | 7.50 m² |
| Bathroom and corridor zone | 3.00 m | 1.50 m | 4.50 m² |
| Bedroom 1 | 3.00 m | 2.50 m | 7.50 m² |
| Front garden | 3.00 m | 3.50 m | 10.50 m² |

The bathroom itself is approximately **1.30 × 1.50 m**. The remaining width is used as the corridor connecting the bedrooms to the family room.

Depth check:

```text
2.50 + 1.50 + 2.50 + 3.50 = 10.00 m
```

## Left wing: family room and exterior spaces

Measured from the back toward the street:

| Space | Width | Depth | Approx. area |
| --- | ---: | ---: | ---: |
| Rear open yard | 3.00 m | 2.50 m | 7.50 m² |
| Family room | 3.00 m | 3.15 m | 9.45 m² |
| Front terrace | 3.00 m | 0.85 m | 2.55 m² |
| Carport | 3.00 m | 3.43 m | 10.29 m² |

The measurement chain totals approximately 9.93 m because of drawing rounding and wall thickness. The 3D model retains those original dimensions.

## Sims 4 conversion

Use:

```text
1 metre = 2 Sims tiles
1 Sims tile = 0.5 metre
```

The complete lot becomes **12 × 20 tiles**.

### Right wing

From the street toward the back:

- Front garden: 6 × 7 tiles
- Bedroom 1: 6 × 5 tiles
- Bathroom/corridor zone: 6 × 3 tiles
- Bedroom 2: 6 × 5 tiles

Split the bathroom/corridor zone into approximately:

- Bathroom: 3 × 3 tiles
- Corridor: 3 × 3 tiles

### Left wing

From the street toward the back:

- Carport: 6 × 7 tiles
- Front terrace: 6 × 2 tiles
- Family room: 6 × 6 tiles
- Rear yard: 6 × 5 tiles

## 3D implementation

The original detailed geometry and furniture were authored with the bedroom wing on negative X coordinates. The scene applies a single horizontal transform:

```js
export const LAYOUT_X_SCALE = -1
```

`src/components/Scene.jsx` applies that value to both `<House />` and `<Rooms />`. It also places the default isometric camera on the opposite side so the dollhouse interior remains visible.

Set `LAYOUT_X_SCALE` to `1` only when comparing against the old left-bedroom source orientation.

## On-site verification before renovation

The model is suitable for layout and furniture planning, but verify these measurements before construction:

- clear internal width and depth of every room
- wall and column thicknesses
- exact door position, width, and swing direction
- window position, width, height, and sill height
- bathroom drain, toilet centreline, and floor slope
- carport gate width, vehicle clearance, slope, and drainage
- rear-yard drainage and roof overhang
