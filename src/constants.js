// House measurements & color palette (all in meters, centered at origin)
// Based on docs/technical-measurement.md: 6m wide × 10m deep lot

export const WALL_HEIGHT = 2.8
export const WALL_THICKNESS = 0.12
export const FLOOR_Y = 0
export const HALF_W = 3    // half width (x: -3 to 3)
export const HALF_D = 5    // half depth (z: -5 to 5)

// The source geometry was originally authored with the bedroom wing on the left.
// Mirror the complete model on the X axis so the current real-world layout has
// Bedroom 1, Bedroom 2, the bathroom, and the front garden on the right.
// Set to 1 only when viewing the original, unmirrored source orientation.
export const LAYOUT_X_SCALE = -1
export const BEDROOM_WING_SIDE = LAYOUT_X_SCALE < 0 ? 'right' : 'left'

// Room z-boundaries (back = -5, front = 5).
// These are source-coordinate boundaries before LAYOUT_X_SCALE is applied.
// Bedroom wing source side (x: -3 to 0; displayed on the right when mirrored)
export const BR2_BACK = -5
export const BR2_FRONT = -2.5
export const BATH_BACK = -2.5
export const BATH_FRONT = -1.0
export const BR1_BACK = -1.0
export const BR1_FRONT = 1.5
export const GARDEN_BACK = 1.5
export const GARDEN_FRONT = 5.0

// Living/service wing source side (x: 0 to 3; displayed on the left when mirrored)
export const REAR_BACK = -5
export const REAR_FRONT = -2.5
export const FAMILY_BACK = -2.5
export const FAMILY_FRONT = 0.65
export const TERRACE_BACK = 0.65
export const TERRACE_FRONT = 1.5
export const CARPORT_BACK = 1.5
export const CARPORT_FRONT = 4.93

// Bathroom width (not full 3m, only ~1.3m along the exterior side)
export const BATH_WIDTH = 1.3

// Warm cozy color palette
export const C = {
  wall:         '#F5E6D3',
  wallInner:    '#EDE0D0',
  wallExterior: '#E8D4BE',
  floor:        '#C9A87C',
  floorLight:   '#D4B896',
  tile:         '#E0D5C8',
  bathTile:     '#D5E0E8',
  wood:         '#A0723A',
  woodDark:     '#6B4226',
  woodLight:    '#C4A06A',
  woodWarm:     '#B8863A',
  fabric:       '#E8DCD0',
  fabricDark:   '#B8A090',
  bedsheet:     '#F0EBE3',
  pillow:       '#D4C5B2',
  pillowAccent: '#C5907A',
  blanket:      '#A08070',
  sofa:         '#7B8B6F',
  sofaCushion:  '#8FA080',
  cushionGold:  '#C9A96E',
  metal:        '#9A9A9A',
  metalDark:    '#6A6A6A',
  glass:        '#B8D4E3',
  plant:        '#4A7C4B',
  plantDark:    '#2D5A2E',
  plantLight:   '#6DA06E',
  pot:          '#C67B5C',
  potDark:      '#A05A3C',
  grass:        '#5A8C3C',
  grassDark:    '#3D6B28',
  concrete:     '#B8B0A8',
  concreteDark: '#A09890',
  car:          '#2C3E50',
  carWindow:    '#5A7A8A',
  tv:           '#111111',
  tvScreen:     '#1A2A3A',
  book1:        '#8B4513',
  book2:        '#2F4F4F',
  book3:        '#8B2020',
  book4:        '#2A4A6B',
  book5:        '#6B4A6B',
  rug:          '#B87333',
  rugDark:      '#8B5A28',
  rugBedroom:   '#9A7B5A',
  curtain:      '#E8E0D5',
  towel:        '#F0F0F0',
  mirror:       '#C8D8E8',
  doorFrame:    '#8B6B4A',
  ground:       '#968B7B',
  sky:          '#87CEEB',
}

// Material presets
export const M = {
  wall:    { roughness: 0.95, metalness: 0.0 },
  wood:    { roughness: 0.7,  metalness: 0.0 },
  fabric:  { roughness: 0.95, metalness: 0.0 },
  metal:   { roughness: 0.3,  metalness: 0.8 },
  tile:    { roughness: 0.5,  metalness: 0.05 },
  glass:   { roughness: 0.1,  metalness: 0.2, transparent: true, opacity: 0.3 },
  plant:   { roughness: 0.8,  metalness: 0.0 },
  concrete:{ roughness: 0.9,  metalness: 0.0 },
  glossy:  { roughness: 0.2,  metalness: 0.1 },
}
