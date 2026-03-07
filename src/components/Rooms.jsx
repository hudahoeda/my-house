import React, { useState, useCallback } from 'react'
import { Html } from '@react-three/drei'
import { C, M } from '../constants'
import {
  Bed, Desk, Chair, Wardrobe, Sofa, CoffeeTable, TVUnit,
  DiningSet, Toilet, Sink, ShowerArea, Plant, LargePlant, Tree,
  Rug, Bookshelf, PictureFrame, DeskLamp, CeilingFan, Curtain,
  Car, GrassPatch, WallClock
} from './Furniture'

/* ═══════════════════════════════════════════
   ROOM COMPOSITIONS
   Each room places furniture at correct positions
   per the technical measurement document
   ═══════════════════════════════════════════ */

// Room label tooltip
function RoomLabel({ name, area, yOffset = 2.2 }) {
  return (
    <Html position={[0, yOffset, 0]} center style={{ pointerEvents: 'none' }}>
      <div className="room-label">
        <h3>{name}</h3>
        <p>{area}</p>
      </div>
    </Html>
  )
}

// Hoverable floor that highlights on pointer
function InteractiveFloor({ size, color, position, mat = M.wood, children }) {
  const [hovered, setHovered] = useState(false)
  const onOver = useCallback((e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }, [])
  const onOut = useCallback(() => { setHovered(false); document.body.style.cursor = 'default' }, [])

  return (
    <group>
      <mesh
        position={position}
        receiveShadow
        onPointerOver={onOver}
        onPointerOut={onOut}
      >
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={hovered ? '#FFE8C0' : color}
          {...mat}
          emissive={hovered ? '#FFE0A0' : '#000000'}
          emissiveIntensity={hovered ? 0.08 : 0}
        />
      </mesh>
      {children}
    </group>
  )
}

// ─── Bedroom 2 (back-left): 3.0 × 2.5m ────
function Bedroom2() {
  return (
    <group position={[-1.5, 0, -3.75]}>
      <RoomLabel name="Bedroom 2" area="3.0 × 2.5m · 7.5 m²" />

      {/* Single bed along left wall */}
      <Bed single position={[-0.65, 0, -0.2]} rotation={[0, 0, 0]} />

      {/* Small desk with chair */}
      <Desk width={0.8} depth={0.45} position={[0.75, 0, -0.8]} rotation={[0, Math.PI, 0]} />
      <Chair position={[0.75, 0, -0.3]} rotation={[0, Math.PI, 0]} />
      <DeskLamp position={[0.45, 0.73, -0.85]} />

      {/* Wardrobe along back wall */}
      <Wardrobe width={1.0} height={2.0} position={[0.0, 0, -1.1]} rotation={[0, 0, 0]} />

      {/* Bookshelf */}
      <Bookshelf width={0.6} height={1.2} position={[-1.2, 0, -1.1]} />

      {/* Rug */}
      <Rug width={1.2} depth={0.8} color={C.rugBedroom} position={[-0.2, 0, 0.4]} />

      {/* Picture frame on back wall */}
      <PictureFrame position={[-0.5, 1.8, -1.22]} artColor="#A8C4D0" />

      {/* Curtain on left window */}
      <Curtain width={0.5} height={1.4} position={[-1.48, 1.5, 0.0]} />

      {/* Ceiling fan */}
      <CeilingFan position={[0, 1.68, 0]} speed={0.6} />
    </group>
  )
}

// ─── Bathroom (left-middle): ~1.3 × 1.5m ───
function Bathroom() {
  return (
    <group position={[-2.35, 0, -1.75]}>
      <RoomLabel name="Bathroom" area="1.3 × 1.5m · 2.0 m²" yOffset={2.0} />

      {/* Toilet against wall */}
      <Toilet position={[0.35, 0, -0.45]} rotation={[0, Math.PI, 0]} />

      {/* Sink */}
      <Sink position={[-0.3, 0, -0.55]} />

      {/* Shower area */}
      <ShowerArea position={[0, 0, 0.3]} />

      {/* Towel on wall */}
      <mesh position={[0.55, 1.2, -0.15]} castShadow>
        <boxGeometry args={[0.02, 0.5, 0.3]} />
        <meshStandardMaterial color={C.towel} {...M.fabric} />
      </mesh>
    </group>
  )
}

// ─── Bedroom 1 (mid-left): 3.0 × 2.5m ─────
function Bedroom1() {
  return (
    <group position={[-1.5, 0, 0.25]}>
      <RoomLabel name="Bedroom 1" area="3.0 × 2.5m · 7.5 m²" />

      {/* Queen bed */}
      <Bed width={1.5} length={2.0} position={[-0.45, 0, -0.15]} />

      {/* Wardrobe along inner wall */}
      <Wardrobe width={1.4} height={2.2} depth={0.5} position={[0.8, 0, -0.95]} rotation={[0, 0, 0]} />

      {/* Bedside table (small desk) */}
      <Desk width={0.4} depth={0.35} position={[0.65, 0, 0.3]} />
      <DeskLamp position={[0.65, 0.73, 0.3]} on={false} />

      {/* Rug beside bed */}
      <Rug width={1.6} depth={1.0} color={C.rug} position={[-0.45, 0, 0.8]} />

      {/* Picture frames */}
      <PictureFrame width={0.5} height={0.35} position={[-0.45, 1.9, -1.22]} artColor="#D4B896" />
      <PictureFrame width={0.3} height={0.25} position={[0.15, 1.7, -1.22]} artColor="#BDA8C0" />

      {/* Curtain on left window */}
      <Curtain width={0.5} height={1.4} position={[-1.48, 1.5, 0.0]} />

      {/* Plant in corner */}
      <Plant size={0.8} position={[1.2, 0, 0.95]} />

      {/* Ceiling fan */}
      <CeilingFan position={[0, 1.68, 0]} speed={0.5} />
    </group>
  )
}

// ─── Family Room (center-right): 3.0 × 3.15m ─
function FamilyRoom() {
  return (
    <group position={[1.5, 0, -0.925]}>
      <RoomLabel name="Family Room" area="3.0 × 3.15m · 9.45 m²" />

      {/* Sofa against right wall */}
      <Sofa width={1.6} position={[0.85, 0, 0.3]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Coffee table in front of sofa */}
      <CoffeeTable position={[0.05, 0, 0.3]} />

      {/* TV Unit against center wall */}
      <TVUnit position={[-1.2, 0, 0.3]} rotation={[0, Math.PI / 2, 0]} />

      {/* Dining set in the back portion */}
      <DiningSet position={[0.3, 0, -0.95]} />

      {/* Large plant in corner */}
      <LargePlant height={1.0} position={[1.15, 0, -1.3]} />

      {/* Small plant near TV */}
      <Plant size={0.6} position={[-1.15, 0, 1.15]} />

      {/* Wall clock on back wall */}
      <WallClock position={[0.3, 2.0, -1.52]} />

      {/* Rug under coffee table area */}
      <Rug width={1.8} depth={1.4} color={C.rugDark} position={[0.2, 0, 0.3]} />

      {/* Ceiling fan */}
      <CeilingFan position={[0, 1.68, 0.2]} speed={0.7} />

      {/* Picture frame on right wall */}
      <PictureFrame width={0.5} height={0.4} position={[1.44, 1.8, -0.4]} rotation={[0, -Math.PI / 2, 0]} artColor="#C4A882" />
      <PictureFrame width={0.35} height={0.28} position={[1.44, 1.75, 0.95]} rotation={[0, -Math.PI / 2, 0]} artColor="#A0B8A0" />
    </group>
  )
}

// ─── Rear Open Yard (back-right): 3.0 × 2.5m ─
function RearYard() {
  return (
    <group position={[1.5, 0, -3.75]}>
      <RoomLabel name="Rear Yard" area="3.0 × 2.5m · 7.5 m²" yOffset={2.0} />

      {/* Grass patch */}
      <GrassPatch width={2.4} depth={2.0} position={[0, -0.06, 0]} />

      {/* Potted plants — varied arrangement */}
      <Plant size={1.3} position={[-0.8, -0.08, -0.7]} potColor={C.potDark} />
      <Plant size={0.8} position={[0.9, -0.08, -0.9]} color={C.plantLight} />
      <Plant size={1.0} position={[0.4, -0.08, 0.5]} />
      <LargePlant height={1.5} position={[-0.4, -0.08, 0.7]} />
      <Plant size={0.6} position={[1.0, -0.08, 0.3]} color={C.grass} potColor={C.pot} />

      {/* Stepping stones */}
      {[[0, -0.1], [0.45, 0.25], [0.1, 0.6]].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.05, z]} receiveShadow rotation={[0, i * 0.3, 0]}>
          <cylinderGeometry args={[0.18, 0.2, 0.04, 8]} />
          <meshStandardMaterial color={C.concreteDark} {...M.concrete} />
        </mesh>
      ))}

      {/* Small decorative rocks */}
      <mesh position={[-0.3, -0.04, -0.2]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial color="#908070" roughness={0.95} />
      </mesh>
      <mesh position={[0.7, -0.04, 0.0]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color="#7A7060" roughness={0.95} />
      </mesh>
    </group>
  )
}

// ─── Front Garden (front-left): 3.0 × 3.5m ──
function FrontGarden() {
  return (
    <group position={[-1.5, 0, 3.25]}>
      <RoomLabel name="Front Garden" area="3.0 × 3.5m · 10.5 m²" yOffset={2.5} />

      {/* Main tree */}
      <Tree height={3.5} canopyRadius={1.3} position={[-0.3, -0.02, 0.4]} />

      {/* Smaller tree */}
      <Tree height={2.0} canopyRadius={0.7} position={[0.9, -0.02, -1.0]} />

      {/* Shrubs along edges */}
      <Plant size={1.4} position={[-1.15, -0.02, -0.5]} color={C.grass} potColor={C.grassDark} />
      <Plant size={1.0} position={[-1.1, -0.02, -1.3]} color={C.plantDark} />
      <Plant size={1.2} position={[0.8, -0.02, 1.0]} color={C.plantLight} potColor={C.potDark} />
      <Plant size={0.8} position={[-0.8, -0.02, 1.2]} color={C.plant} />

      {/* Garden path (stepping stones leading to door) */}
      {[[-0.2, -1.5], [0.0, -1.1], [0.15, -0.7], [0.1, -0.3]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.01, z]} receiveShadow>
          <cylinderGeometry args={[0.15, 0.17, 0.03, 8]} />
          <meshStandardMaterial color={C.concrete} {...M.concrete} />
        </mesh>
      ))}

      {/* Garden border fence (low, left side) */}
      <mesh position={[-1.48, 0.3, 0.0]} castShadow>
        <boxGeometry args={[0.04, 0.6, 3.4]} />
        <meshStandardMaterial color={C.concreteDark} {...M.concrete} />
      </mesh>
    </group>
  )
}

// ─── Front Terrace: 3.0 × 0.85m ────────────
function FrontTerrace() {
  return (
    <group position={[1.5, 0, 1.075]}>
      <RoomLabel name="Terrace" area="3.0 × 0.85m" yOffset={2.0} />
      {/* Small bench / shoe rack */}
      <mesh position={[-0.8, 0.15, 0.2]} castShadow>
        <boxGeometry args={[0.8, 0.3, 0.3]} />
        <meshStandardMaterial color={C.woodDark} {...M.wood} />
      </mesh>
      {/* Plant */}
      <Plant size={0.7} position={[1.0, -0.02, 0.2]} />
    </group>
  )
}

// ─── Carport (front-right): 3.0 × 3.43m ────
function Carport() {
  return (
    <group position={[1.5, 0, 3.215]}>
      <RoomLabel name="Carport" area="3.0 × 3.43m · 10.3 m²" yOffset={2.0} />

      {/* Car */}
      <Car position={[0, -0.12, 0.2]} rotation={[0, Math.PI, 0]} />
    </group>
  )
}

// ─── Export all rooms ───────────────────────
export default function Rooms() {
  return (
    <group>
      <Bedroom2 />
      <Bathroom />
      <Bedroom1 />
      <FamilyRoom />
      <RearYard />
      <FrontGarden />
      <FrontTerrace />
      <Carport />
    </group>
  )
}
