import React from 'react'
import * as THREE from 'three'
import { C, M, WALL_HEIGHT, WALL_THICKNESS as WT, HALF_W, HALF_D } from '../constants'
import { WindowFrame, DoorFrame } from './Furniture'

/* ═══════════════════════════════════════════
   HOUSE STRUCTURE
   Walls, floors, door/window openings
   Dollhouse cutaway: front + left walls removed
   Back + right walls shown (neighbor constraints)
   ═══════════════════════════════════════════ */

const H = WALL_HEIGHT
const HH = H / 2
const IH = 1.7           // Interior wall height (shorter for dollhouse view)
const IHH = IH / 2       // Interior wall half-height

function Wall({ position, size, color = C.wall, mat = M.wall }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} {...mat} />
    </mesh>
  )
}

function Floor({ position, size, color = C.floor, mat = M.wood }) {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} {...mat} />
    </mesh>
  )
}

export default function House() {
  return (
    <group>
      {/* ═══ EXTERIOR WALLS (back + right only — dollhouse cutaway) ═══ */}

      {/* Back wall (z = -5) — full width, neighbor constraint */}
      <Wall position={[0, HH, -HALF_D]} size={[HALF_W * 2 + WT, H, WT]} color={C.wallExterior} />
      {/* Wall cap for clean edge */}
      <mesh position={[0, H + 0.02, -HALF_D]} receiveShadow>
        <boxGeometry args={[HALF_W * 2 + WT + 0.04, 0.04, WT + 0.04]} />
        <meshStandardMaterial color={C.concreteDark} {...M.concrete} />
      </mesh>

      {/* Right wall (x = 3) — from back to front terrace (z: -5 to 0.65) */}
      <Wall position={[HALF_W, HH, -2.175]} size={[WT, H, 5.65]} color={C.wallExterior} />
      {/* Wall cap */}
      <mesh position={[HALF_W, H + 0.02, -2.175]} receiveShadow>
        <boxGeometry args={[WT + 0.04, 0.04, 5.65 + 0.04]} />
        <meshStandardMaterial color={C.concreteDark} {...M.concrete} />
      </mesh>
      {/* Right wall continues: terrace to carport area — low fence */}
      <Wall position={[HALF_W, 0.6, 3.215]} size={[WT, 1.2, 3.57]} color={C.concreteDark} mat={M.concrete} />

      {/* ═══ INTERIOR PARTITION WALLS ═══ */}

      {/* Center dividing wall (x = 0) — separates left and right zones */}
      {/* Segment: alongside Bedroom 2 (z: -5 to -3.1) */}
      <Wall position={[0, IHH, -4.05]} size={[WT, IH, 1.9]} color={C.wallInner} />
      {/* Door opening z: -3.1 to -2.3 */}
      <DoorFrame position={[0, 1.05, -2.7]} />
      {/* Segment: alongside Bathroom/corridor (z: -2.3 to -1.8) */}
      <Wall position={[0, IHH, -2.05]} size={[WT, IH, 0.5]} color={C.wallInner} />
      {/* Door opening z: -1.8 to -1.0 — main corridor to family room */}
      <DoorFrame position={[0, 1.05, -1.4]} />
      {/* Segment: alongside Bedroom 1 (z: -0.8 to 0.2) */}
      <Wall position={[0, IHH, -0.3]} size={[WT, IH, 1.0]} color={C.wallInner} />
      {/* Door opening z: 0.2 to 1.0 */}
      <DoorFrame position={[0, 1.05, 0.6]} />
      {/* Segment: end of center wall (z: 1.0 to 1.5) */}
      <Wall position={[0, IHH, 1.25]} size={[WT, IH, 0.5]} color={C.wallInner} />

      {/* ─── Left side cross walls ─── */}

      {/* Between Bedroom 2 and Bathroom (z = -2.5, x: -3 to 0) */}
      {/* Solid segment with door opening */}
      <Wall position={[-2.1, IHH, -2.5]} size={[1.8, IH, WT]} color={C.wallInner} />
      {/* Door gap at x: -1.2 to -0.5 */}
      <DoorFrame position={[-0.85, 1.05, -2.5]} rotation={[0, Math.PI / 2, 0]} width={0.7} />
      <Wall position={[-0.15, IHH, -2.5]} size={[0.3, IH, WT]} color={C.wallInner} />

      {/* Between Bathroom and Bedroom 1 (z = -1.0, x: -3 to 0) */}
      <Wall position={[-2.1, IHH, -1.0]} size={[1.8, IH, WT]} color={C.wallInner} />
      <DoorFrame position={[-0.85, 1.05, -1.0]} rotation={[0, Math.PI / 2, 0]} width={0.7} />
      <Wall position={[-0.15, IHH, -1.0]} size={[0.3, IH, WT]} color={C.wallInner} />

      {/* Bathroom side wall (x = -1.7, z: -2.5 to -1.0) — encloses bathroom */}
      <Wall position={[-1.7, IHH, -1.75]} size={[WT, IH, 1.5]} color={C.wallInner} />

      {/* Between Bedroom 1 and Front garden (z = 1.5, x: -3 to 0) */}
      <Wall position={[-1.85, IHH, 1.5]} size={[2.3, IH, WT]} color={C.wallInner} />
      {/* Door to garden */}
      <DoorFrame position={[-0.4, 1.05, 1.5]} rotation={[0, Math.PI / 2, 0]} />
      <Wall position={[- 0.03, IHH, 1.5]} size={[0.06, IH, WT]} color={C.wallInner} />

      {/* ─── Right side cross walls ─── */}

      {/* Between Rear yard and Family room (z = -2.5, x: 0 to 3) */}
      {/* This has the rear terrace opening */}
      <Wall position={[0.5, IHH, -2.5]} size={[1.0, IH, WT]} color={C.wallInner} />
      {/* Opening for rear terrace door (x: 1.0 to 2.0) */}
      <DoorFrame position={[1.5, 1.05, -2.5]} rotation={[0, Math.PI / 2, 0]} width={0.9} />
      <Wall position={[2.55, IHH, -2.5]} size={[0.9, IH, WT]} color={C.wallInner} />

      {/* Between Family room and Front terrace (z = 0.65, x: 0 to 3) */}
      <Wall position={[0.5, IHH, 0.65]} size={[1.0, IH, WT]} color={C.wallInner} />
      {/* Front door opening */}
      <DoorFrame position={[1.5, 1.05, 0.65]} rotation={[0, Math.PI / 2, 0]} width={0.9} />
      <Wall position={[2.55, IHH, 0.65]} size={[0.9, IH, WT]} color={C.wallInner} />

      {/* ═══ FLOORS ═══ */}

      {/* Bedroom 2 floor (wood) */}
      <Floor position={[-1.5, 0, -3.75]} size={[3.0, 0.08, 2.5]} color={C.floor} />

      {/* Bathroom floor (tiles) */}
      <Floor position={[-2.35, 0, -1.75]} size={[1.3, 0.08, 1.5]} color={C.bathTile} mat={M.tile} />

      {/* Corridor floor (between bathroom and center wall) */}
      <Floor position={[-0.85, 0, -1.75]} size={[1.7, 0.08, 1.5]} color={C.tile} mat={M.tile} />

      {/* Bedroom 1 floor (wood) */}
      <Floor position={[-1.5, 0, 0.25]} size={[3.0, 0.08, 2.5]} color={C.floor} />

      {/* Family room floor (tiles) */}
      <Floor position={[1.5, 0, -0.925]} size={[3.0, 0.08, 3.15]} color={C.tile} mat={M.tile} />

      {/* Front terrace floor */}
      <Floor position={[1.5, -0.02, 1.075]} size={[3.0, 0.06, 0.85]} color={C.concrete} mat={M.concrete} />

      {/* Carport floor (sloped - simplified as flat, lowered) */}
      <Floor position={[1.5, -0.14, 3.215]} size={[3.0, 0.06, 3.43]} color={C.concreteDark} mat={M.concrete} />

      {/* Rear yard floor */}
      <Floor position={[1.5, -0.08, -3.75]} size={[3.0, 0.06, 2.5]} color={C.concrete} mat={M.concrete} />

      {/* Front garden — grass */}
      <Floor position={[-1.5, -0.02, 3.25]} size={[3.0, 0.06, 3.5]} color={C.grass} mat={M.plant} />

      {/* Ground plane (extends beyond house) */}
      <mesh position={[0, -0.25, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color={C.ground} {...M.concrete} />
      </mesh>

      {/* Subtle base slab outline for the house footprint */}
      <mesh position={[0, -0.18, -0.035]} receiveShadow>
        <boxGeometry args={[6.2, 0.06, 10.1]} />
        <meshStandardMaterial color={C.concreteDark} roughness={0.85} />
      </mesh>

      {/* ═══ LEFT WALL WINDOWS (x = -3) — open side ═══ */}

      {/* Bedroom 2 window */}
      <group position={[-HALF_W - 0.02, 1.5, -3.75]}>
        <WindowFrame width={0.8} height={1.0} />
      </group>
      {/* Curtain for bedroom 2 */}

      {/* Bedroom 1 window */}
      <group position={[-HALF_W - 0.02, 1.5, 0.25]}>
        <WindowFrame width={0.8} height={1.0} />
      </group>

      {/* Bathroom window (small) */}
      <group position={[-HALF_W - 0.02, 1.8, -1.75]}>
        <WindowFrame width={0.4} height={0.5} />
      </group>

      {/* ═══ CARPORT CANOPY (simple pillars + thin roof) ═══ */}
      {/* Front-right pillars */}
      <mesh position={[0.15, 1.3, 4.9]} castShadow>
        <boxGeometry args={[0.12, 2.6, 0.12]} />
        <meshStandardMaterial color={C.concreteDark} {...M.concrete} />
      </mesh>
      <mesh position={[2.85, 1.3, 4.9]} castShadow>
        <boxGeometry args={[0.12, 2.6, 0.12]} />
        <meshStandardMaterial color={C.concreteDark} {...M.concrete} />
      </mesh>
      {/* Canopy roof */}
      <mesh position={[1.5, 2.65, 3.215]} receiveShadow>
        <boxGeometry args={[3.0, 0.08, 3.5]} />
        <meshStandardMaterial color={C.concreteDark} {...M.concrete} />
      </mesh>

      {/* ═══ LEFT WALL — low plinth/base to frame open side ═══ */}
      <Wall position={[-HALF_W, 0.15, -1.75]} size={[WT, 0.3, 7.0]} color={C.wallExterior} />

      {/* ═══ FRONT LOW WALL / GARDEN BORDER (left side) ═══ */}
      <Wall position={[-1.5, 0.3, HALF_D]} size={[3.0, 0.6, WT]} color={C.concreteDark} mat={M.concrete} />
    </group>
  )
}
