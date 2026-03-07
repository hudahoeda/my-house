import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { C, M } from '../constants'

/* ═══════════════════════════════════════════
   REUSABLE FURNITURE PRIMITIVES
   All furniture built from Three.js primitives
   with warm, cozy PBR materials
   ═══════════════════════════════════════════ */

// ─── Helpers ────────────────────────────────
function Box({ size, color, position = [0, 0, 0], rotation = [0, 0, 0], mat = M.wood, castShadow = true, receiveShadow = true, ...props }) {
  return (
    <mesh position={position} rotation={rotation} castShadow={castShadow} receiveShadow={receiveShadow} {...props}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} {...mat} />
    </mesh>
  )
}

function Cyl({ args, color, position = [0, 0, 0], rotation = [0, 0, 0], mat = M.wood, castShadow = true, ...props }) {
  return (
    <mesh position={position} rotation={rotation} castShadow={castShadow} {...props}>
      <cylinderGeometry args={args} />
      <meshStandardMaterial color={color} {...mat} />
    </mesh>
  )
}

// ─── Bed ────────────────────────────────────
export function Bed({ width = 1.4, length = 2.0, single = false, ...props }) {
  const w = single ? 0.9 : width
  const h = 0.35
  return (
    <group {...props}>
      {/* Frame */}
      <Box size={[w + 0.06, 0.12, length + 0.06]} color={C.woodWarm} position={[0, 0.14, 0]} />
      {/* Legs */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dz], i) => (
        <Box key={i} size={[0.06, 0.08, 0.06]} color={C.woodDark} position={[dx * (w / 2), 0.04, dz * (length / 2)]} />
      ))}
      {/* Mattress */}
      <Box size={[w, 0.16, length - 0.05]} color={C.bedsheet} position={[0, h - 0.04, -0.02]} mat={M.fabric} />
      {/* Headboard */}
      <Box size={[w + 0.06, 0.6, 0.06]} color={C.woodWarm} position={[0, 0.52, -length / 2 + 0.02]} />
      {/* Pillows */}
      <Box size={[w * 0.38, 0.08, 0.26]} color={C.pillow} position={[-w * 0.22, h + 0.04, -length / 2 + 0.25]} mat={M.fabric} />
      <Box size={[w * 0.38, 0.08, 0.26]} color={C.pillow} position={[w * 0.22, h + 0.04, -length / 2 + 0.25]} mat={M.fabric} />
      {/* Blanket (folded at foot) */}
      <Box size={[w - 0.04, 0.06, length * 0.4]} color={C.blanket} position={[0, h + 0.01, length * 0.2]} mat={M.fabric} />
      {/* Accent pillow */}
      {!single && (
        <Box size={[0.3, 0.1, 0.2]} color={C.pillowAccent} position={[0, h + 0.07, -length / 2 + 0.5]} mat={M.fabric} />
      )}
    </group>
  )
}

// ─── Desk ───────────────────────────────────
export function Desk({ width = 1.0, depth = 0.5, ...props }) {
  const h = 0.72
  const legW = 0.04
  return (
    <group {...props}>
      {/* Surface */}
      <Box size={[width, 0.03, depth]} color={C.woodLight} position={[0, h, 0]} />
      {/* Legs */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dz], i) => (
        <Box key={i} size={[legW, h, legW]} color={C.wood} position={[dx * (width / 2 - 0.04), h / 2, dz * (depth / 2 - 0.04)]} />
      ))}
      {/* Drawer unit */}
      <Box size={[width * 0.4, 0.22, depth - 0.06]} color={C.wood} position={[width * 0.25, h - 0.14, 0]} />
    </group>
  )
}

// ─── Chair ──────────────────────────────────
export function Chair({ color = C.wood, seatColor = C.fabricDark, ...props }) {
  return (
    <group {...props}>
      {/* Seat */}
      <Box size={[0.4, 0.04, 0.4]} color={seatColor} position={[0, 0.44, 0]} mat={M.fabric} />
      {/* Legs */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dz], i) => (
        <Box key={i} size={[0.03, 0.44, 0.03]} color={color} position={[dx * 0.16, 0.22, dz * 0.16]} />
      ))}
      {/* Backrest */}
      <Box size={[0.38, 0.4, 0.03]} color={color} position={[0, 0.66, -0.18]} />
    </group>
  )
}

// ─── Wardrobe ───────────────────────────────
export function Wardrobe({ width = 1.2, height = 2.1, depth = 0.55, ...props }) {
  return (
    <group {...props}>
      <Box size={[width, height, depth]} color={C.woodLight} position={[0, height / 2, 0]} />
      {/* Door line */}
      <Box size={[0.01, height - 0.1, depth - 0.06]} color={C.woodDark} position={[0, height / 2, depth / 2 + 0.001]} />
      {/* Handles */}
      <Box size={[0.02, 0.12, 0.02]} color={C.metal} position={[-0.06, height * 0.55, depth / 2 + 0.02]} mat={M.metal} />
      <Box size={[0.02, 0.12, 0.02]} color={C.metal} position={[0.06, height * 0.55, depth / 2 + 0.02]} mat={M.metal} />
    </group>
  )
}

// ─── Sofa ───────────────────────────────────
export function Sofa({ width = 1.8, ...props }) {
  const d = 0.75
  const seatH = 0.38
  return (
    <group {...props}>
      {/* Base */}
      <Box size={[width, seatH, d]} color={C.sofa} position={[0, seatH / 2, 0]} mat={M.fabric} />
      {/* Backrest */}
      <Box size={[width, 0.45, 0.15]} color={C.sofa} position={[0, seatH + 0.22, -d / 2 + 0.08]} mat={M.fabric} />
      {/* Armrests */}
      <Box size={[0.12, 0.25, d - 0.1]} color={C.sofa} position={[-width / 2 + 0.06, seatH + 0.12, 0]} mat={M.fabric} />
      <Box size={[0.12, 0.25, d - 0.1]} color={C.sofa} position={[width / 2 - 0.06, seatH + 0.12, 0]} mat={M.fabric} />
      {/* Seat cushions */}
      <Box size={[width * 0.45, 0.1, d - 0.2]} color={C.sofaCushion} position={[-width * 0.2, seatH + 0.05, 0.04]} mat={M.fabric} />
      <Box size={[width * 0.45, 0.1, d - 0.2]} color={C.sofaCushion} position={[width * 0.2, seatH + 0.05, 0.04]} mat={M.fabric} />
      {/* Throw pillows */}
      <Box size={[0.28, 0.22, 0.1]} color={C.cushionGold} position={[-width / 2 + 0.26, seatH + 0.16, -0.1]} mat={M.fabric} rotation={[0, 0, 0.15]} />
      <Box size={[0.24, 0.2, 0.1]} color={C.pillowAccent} position={[width / 2 - 0.24, seatH + 0.14, -0.12]} mat={M.fabric} rotation={[0, 0, -0.1]} />
    </group>
  )
}

// ─── Coffee Table ───────────────────────────
export function CoffeeTable({ ...props }) {
  return (
    <group {...props}>
      <Box size={[0.8, 0.03, 0.45]} color={C.woodWarm} position={[0, 0.36, 0]} />
      {/* Shelf below */}
      <Box size={[0.7, 0.02, 0.38]} color={C.wood} position={[0, 0.14, 0]} />
      {/* Legs */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dz], i) => (
        <Cyl key={i} args={[0.02, 0.02, 0.36, 8]} color={C.metal} position={[dx * 0.34, 0.18, dz * 0.18]} mat={M.metal} />
      ))}
      {/* Book stack */}
      <Box size={[0.18, 0.04, 0.12]} color={C.book1} position={[-0.2, 0.39, 0.08]} />
      <Box size={[0.16, 0.03, 0.11]} color={C.book4} position={[-0.19, 0.42, 0.07]} rotation={[0, 0.1, 0]} />
      {/* Small plant on table */}
      <Cyl args={[0.04, 0.035, 0.06, 8]} color={C.pot} position={[0.22, 0.39, -0.06]} />
      <mesh position={[0.22, 0.46, -0.06]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color={C.plant} {...M.plant} />
      </mesh>
    </group>
  )
}

// ─── TV Unit ────────────────────────────────
export function TVUnit({ ...props }) {
  return (
    <group {...props}>
      {/* Cabinet */}
      <Box size={[1.2, 0.4, 0.35]} color={C.woodDark} position={[0, 0.2, 0]} />
      {/* Shelf division */}
      <Box size={[0.01, 0.35, 0.3]} color={C.woodLight} position={[-0.2, 0.2, 0.01]} />
      <Box size={[0.01, 0.35, 0.3]} color={C.woodLight} position={[0.2, 0.2, 0.01]} />
      {/* TV */}
      <Box size={[0.9, 0.55, 0.04]} color={C.tv} position={[0, 0.72, 0]} mat={M.glossy} />
      {/* Screen */}
      <Box size={[0.82, 0.48, 0.005]} color={C.tvScreen} position={[0, 0.72, 0.023]} mat={{ roughness: 0.05, metalness: 0.0 }} />
      {/* Stand */}
      <Box size={[0.3, 0.02, 0.15]} color={C.metalDark} position={[0, 0.43, 0.04]} mat={M.metal} />
    </group>
  )
}

// ─── Dining Table with Chairs ───────────────
export function DiningSet({ ...props }) {
  return (
    <group {...props}>
      {/* Table top */}
      <Box size={[1.0, 0.03, 0.7]} color={C.woodWarm} position={[0, 0.72, 0]} />
      {/* Legs */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dz], i) => (
        <Box key={i} size={[0.05, 0.72, 0.05]} color={C.wood} position={[dx * 0.42, 0.36, dz * 0.28]} />
      ))}
      {/* Chairs */}
      <Chair position={[0, 0, -0.58]} />
      <Chair position={[0, 0, 0.58]} rotation={[0, Math.PI, 0]} />
      <Chair position={[-0.65, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Chair position={[0.65, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
      {/* Plate */}
      <Cyl args={[0.1, 0.1, 0.01, 16]} color="#F5F0EB" position={[0, 0.745, 0]} mat={M.tile} />
      {/* Vase */}
      <Cyl args={[0.03, 0.05, 0.14, 8]} color={C.pot} position={[0.25, 0.8, 0.12]} />
      <mesh position={[0.25, 0.92, 0.12]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color={C.plantLight} {...M.plant} />
      </mesh>
    </group>
  )
}

// ─── Toilet ─────────────────────────────────
export function Toilet({ ...props }) {
  return (
    <group {...props}>
      {/* Base */}
      <Cyl args={[0.17, 0.14, 0.3, 12]} color="#F0F0F0" position={[0, 0.15, 0]} mat={M.tile} />
      {/* Bowl rim */}
      <Cyl args={[0.18, 0.18, 0.04, 12]} color="#F5F5F5" position={[0, 0.32, 0.04]} mat={M.tile} />
      {/* Tank */}
      <Box size={[0.32, 0.35, 0.14]} color="#EBEBEB" position={[0, 0.38, -0.16]} mat={M.tile} />
      {/* Seat */}
      <Cyl args={[0.16, 0.16, 0.02, 12]} color="#FAFAFA" position={[0, 0.34, 0.04]} mat={M.glossy} />
    </group>
  )
}

// ─── Sink ───────────────────────────────────
export function Sink({ ...props }) {
  return (
    <group {...props}>
      {/* Pedestal */}
      <Box size={[0.18, 0.65, 0.14]} color="#F0F0F0" position={[0, 0.325, 0]} mat={M.tile} />
      {/* Basin */}
      <Box size={[0.45, 0.08, 0.32]} color="#F5F5F5" position={[0, 0.68, 0.04]} mat={M.tile} />
      {/* Faucet */}
      <Cyl args={[0.012, 0.012, 0.14, 8]} color={C.metal} position={[0, 0.76, -0.08]} mat={M.metal} />
      <Cyl args={[0.012, 0.012, 0.06, 8]} color={C.metal} position={[0, 0.82, -0.05]} mat={M.metal} rotation={[Math.PI / 3, 0, 0]} />
      {/* Mirror */}
      <Box size={[0.4, 0.5, 0.02]} color={C.mirror} position={[0, 1.2, -0.15]} mat={{ roughness: 0.05, metalness: 0.4 }} />
    </group>
  )
}

// ─── Shower Area ────────────────────────────
export function ShowerArea({ ...props }) {
  return (
    <group {...props}>
      {/* Floor tray */}
      <Box size={[0.7, 0.03, 0.7]} color={C.bathTile} position={[0, 0.015, 0]} mat={M.tile} />
      {/* Shower pole */}
      <Cyl args={[0.015, 0.015, 1.8, 8]} color={C.metal} position={[0.25, 0.9, -0.25]} mat={M.metal} />
      {/* Shower head */}
      <Cyl args={[0.06, 0.04, 0.03, 12]} color={C.metal} position={[0.25, 1.8, -0.15]} mat={M.metal} rotation={[0.4, 0, 0]} />
      {/* Bucket */}
      <Cyl args={[0.14, 0.11, 0.2, 10]} color="#5A8AAA" position={[-0.15, 0.1, 0.1]} mat={M.tile} />
    </group>
  )
}

// ─── Potted Plant ───────────────────────────
export function Plant({ size = 1.0, color = C.plant, potColor = C.pot, ...props }) {
  const s = size
  return (
    <group {...props}>
      {/* Pot */}
      <Cyl args={[0.1 * s, 0.08 * s, 0.15 * s, 10]} color={potColor} position={[0, 0.075 * s, 0]} />
      {/* Soil */}
      <Cyl args={[0.09 * s, 0.09 * s, 0.02, 10]} color="#5A4030" position={[0, 0.15 * s, 0]} />
      {/* Foliage - cluster of spheres */}
      <mesh position={[0, 0.3 * s, 0]}>
        <sphereGeometry args={[0.14 * s, 10, 10]} />
        <meshStandardMaterial color={color} {...M.plant} />
      </mesh>
      <mesh position={[0.06 * s, 0.38 * s, 0.04 * s]}>
        <sphereGeometry args={[0.1 * s, 8, 8]} />
        <meshStandardMaterial color={C.plantLight} {...M.plant} />
      </mesh>
      <mesh position={[-0.05 * s, 0.35 * s, -0.04 * s]}>
        <sphereGeometry args={[0.09 * s, 8, 8]} />
        <meshStandardMaterial color={C.plantDark} {...M.plant} />
      </mesh>
    </group>
  )
}

// ─── Large Plant / Small Tree ───────────────
export function LargePlant({ height = 1.2, ...props }) {
  return (
    <group {...props}>
      <Cyl args={[0.14, 0.12, 0.22, 10]} color={C.potDark} position={[0, 0.11, 0]} />
      <Cyl args={[0.03, 0.02, height * 0.5, 6]} color="#6B5030" position={[0, height * 0.35, 0]} />
      {[0, 1.2, 2.5, 3.8, 5.2].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 0.15, height * (0.4 + i * 0.1), Math.sin(a) * 0.15]}>
          <sphereGeometry args={[0.15 + i * 0.02, 8, 8]} />
          <meshStandardMaterial color={i % 2 ? C.plant : C.plantLight} {...M.plant} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Tree (for garden) ──────────────────────
export function Tree({ height = 3.0, canopyRadius = 1.2, ...props }) {
  return (
    <group {...props}>
      {/* Trunk */}
      <Cyl args={[0.08, 0.12, height * 0.5, 8]} color="#6B4830" position={[0, height * 0.25, 0]} />
      {/* Canopy - multiple spheres for organic look */}
      <mesh position={[0, height * 0.65, 0]}>
        <sphereGeometry args={[canopyRadius * 0.7, 12, 12]} />
        <meshStandardMaterial color={C.grass} {...M.plant} />
      </mesh>
      <mesh position={[canopyRadius * 0.3, height * 0.72, canopyRadius * 0.2]}>
        <sphereGeometry args={[canopyRadius * 0.5, 10, 10]} />
        <meshStandardMaterial color={C.plant} {...M.plant} />
      </mesh>
      <mesh position={[-canopyRadius * 0.25, height * 0.7, -canopyRadius * 0.2]}>
        <sphereGeometry args={[canopyRadius * 0.45, 10, 10]} />
        <meshStandardMaterial color={C.plantDark} {...M.plant} />
      </mesh>
    </group>
  )
}

// ─── Rug ────────────────────────────────────
export function Rug({ width = 1.5, depth = 1.0, color = C.rug, ...props }) {
  return (
    <Box size={[width, 0.01, depth]} color={color} position={[0, 0.006, 0]} mat={M.fabric} receiveShadow {...props} />
  )
}

// ─── Bookshelf ──────────────────────────────
export function Bookshelf({ width = 0.8, height = 1.6, ...props }) {
  const colors = [C.book1, C.book2, C.book3, C.book4, C.book5]
  const shelves = 4
  const shelfH = height / shelves
  return (
    <group {...props}>
      {/* Frame */}
      <Box size={[width, height, 0.25]} color={C.woodLight} position={[0, height / 2, 0]} />
      {/* Shelves and books */}
      {Array.from({ length: shelves }).map((_, si) => (
        <group key={si}>
          <Box size={[width - 0.04, 0.02, 0.22]} color={C.wood} position={[0, shelfH * (si + 0.5), 0.02]} />
          {/* Books on each shelf */}
          {Array.from({ length: 4 + Math.floor(Math.random() * 3) }).map((_, bi) => (
            <Box
              key={bi}
              size={[0.04 + Math.random() * 0.03, shelfH * 0.6 + Math.random() * shelfH * 0.2, 0.14]}
              color={colors[(si * 3 + bi) % colors.length]}
              position={[-width / 2 + 0.08 + bi * 0.07, shelfH * si + shelfH * 0.5, 0.02]}
            />
          ))}
        </group>
      ))}
    </group>
  )
}

// ─── Picture Frame ──────────────────────────
export function PictureFrame({ width = 0.4, height = 0.3, frameColor = C.woodDark, artColor = '#D4C5A0', ...props }) {
  return (
    <group {...props}>
      <Box size={[width, height, 0.02]} color={frameColor} position={[0, 0, 0]} />
      <Box size={[width - 0.04, height - 0.04, 0.005]} color={artColor} position={[0, 0, 0.011]} mat={M.fabric} />
    </group>
  )
}

// ─── Desk Lamp ──────────────────────────────
export function DeskLamp({ on = true, ...props }) {
  return (
    <group {...props}>
      <Cyl args={[0.06, 0.07, 0.015, 12]} color={C.metalDark} position={[0, 0.008, 0]} mat={M.metal} />
      <Cyl args={[0.012, 0.012, 0.3, 8]} color={C.metal} position={[0, 0.16, 0]} mat={M.metal} />
      <Cyl args={[0.012, 0.012, 0.12, 8]} color={C.metal} position={[0.04, 0.29, 0]} mat={M.metal} rotation={[0, 0, -0.6]} />
      <mesh position={[0.07, 0.34, 0]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.07, 0.08, 12, 1, true]} />
        <meshStandardMaterial color={C.cushionGold} side={THREE.DoubleSide} {...M.metal} />
      </mesh>
      {on && <pointLight position={[0.07, 0.3, 0]} intensity={0.3} distance={1.5} color="#FFE4B5" />}
    </group>
  )
}

// ─── Ceiling Fan (animated) ─────────────────
export function CeilingFan({ speed = 0.8, ...props }) {
  const ref = useRef()
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed
  })
  return (
    <group {...props}>
      {/* Mount */}
      <Cyl args={[0.04, 0.04, 0.15, 8]} color={C.metal} position={[0, -0.075, 0]} mat={M.metal} />
      {/* Hub */}
      <Cyl args={[0.06, 0.06, 0.04, 12]} color={C.metalDark} position={[0, -0.17, 0]} mat={M.metal} />
      {/* Blades */}
      <group ref={ref} position={[0, -0.19, 0]}>
        {[0, 1, 2, 3].map(i => (
          <Box
            key={i}
            size={[0.65, 0.01, 0.1]}
            color={C.woodLight}
            position={[Math.cos(i * Math.PI / 2) * 0.35, 0, Math.sin(i * Math.PI / 2) * 0.35]}
            rotation={[0, -i * Math.PI / 2, 0]}
          />
        ))}
      </group>
    </group>
  )
}

// ─── Curtain ────────────────────────────────
export function Curtain({ width = 0.4, height = 1.6, ...props }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.x = Math.sin(clock.elapsedTime * 0.5) * 0.01
    }
  })
  return (
    <group {...props}>
      {/* Rod */}
      <Cyl args={[0.01, 0.01, width * 2.4, 8]} color={C.metal} position={[0, height / 2 + 0.1, 0]} rotation={[0, 0, Math.PI / 2]} mat={M.metal} />
      {/* Left curtain */}
      <group ref={ref}>
        <Box size={[width, height, 0.02]} color={C.curtain} position={[-width * 0.7, 0, 0]} mat={M.fabric} />
      </group>
      {/* Right curtain */}
      <Box size={[width, height, 0.02]} color={C.curtain} position={[width * 0.7, 0, 0]} mat={M.fabric} />
    </group>
  )
}

// ─── Car (simplified) ───────────────────────
export function Car({ ...props }) {
  return (
    <group {...props}>
      {/* Body */}
      <Box size={[1.6, 0.5, 3.8]} color={C.car} position={[0, 0.45, 0]} mat={{ roughness: 0.3, metalness: 0.6 }} />
      {/* Cabin */}
      <Box size={[1.4, 0.45, 1.8]} color={C.car} position={[0, 0.9, -0.3]} mat={{ roughness: 0.3, metalness: 0.6 }} />
      {/* Windows */}
      <Box size={[1.42, 0.35, 1.7]} color={C.carWindow} position={[0, 0.92, -0.3]} mat={M.glass} />
      {/* Wheels */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dz], i) => (
        <Cyl key={i} args={[0.2, 0.2, 0.14, 12]} color="#222" position={[dx * 0.7, 0.2, dz * 1.4]} rotation={[0, 0, Math.PI / 2]} mat={{ roughness: 0.9, metalness: 0 }} />
      ))}
      {/* Headlights */}
      <Box size={[0.15, 0.08, 0.02]} color="#FFE4B5" position={[-0.55, 0.5, 1.91]} mat={{ roughness: 0.1, metalness: 0.3, emissive: '#FFE4B5', emissiveIntensity: 0.2 }} />
      <Box size={[0.15, 0.08, 0.02]} color="#FFE4B5" position={[0.55, 0.5, 1.91]} mat={{ roughness: 0.1, metalness: 0.3, emissive: '#FFE4B5', emissiveIntensity: 0.2 }} />
    </group>
  )
}

// ─── Grass Patch ────────────────────────────
export function GrassPatch({ width, depth, ...props }) {
  return (
    <mesh position={[0, 0.02, 0]} receiveShadow {...props}>
      <boxGeometry args={[width, 0.04, depth]} />
      <meshStandardMaterial color={C.grass} {...M.plant} />
    </mesh>
  )
}

// ─── Window (decorative, for left wall) ─────
export function WindowFrame({ width = 0.8, height = 1.0, ...props }) {
  return (
    <group {...props}>
      {/* Frame */}
      <Box size={[width + 0.06, height + 0.06, 0.06]} color={C.doorFrame} position={[0, 0, 0]} />
      {/* Glass panes */}
      <Box size={[width * 0.46, height * 0.46, 0.02]} color={C.glass} position={[-width * 0.25, height * 0.25, 0]} mat={M.glass} castShadow={false} />
      <Box size={[width * 0.46, height * 0.46, 0.02]} color={C.glass} position={[width * 0.25, height * 0.25, 0]} mat={M.glass} castShadow={false} />
      <Box size={[width * 0.46, height * 0.46, 0.02]} color={C.glass} position={[-width * 0.25, -height * 0.25, 0]} mat={M.glass} castShadow={false} />
      <Box size={[width * 0.46, height * 0.46, 0.02]} color={C.glass} position={[width * 0.25, -height * 0.25, 0]} mat={M.glass} castShadow={false} />
      {/* Cross bars */}
      <Box size={[width, 0.03, 0.04]} color={C.doorFrame} position={[0, 0, 0]} />
      <Box size={[0.03, height, 0.04]} color={C.doorFrame} position={[0, 0, 0]} />
    </group>
  )
}

// ─── Door Frame ─────────────────────────────
export function DoorFrame({ width = 0.75, height = 2.1, ...props }) {
  return (
    <group {...props}>
      {/* Frame top */}
      <Box size={[width + 0.08, 0.04, 0.12]} color={C.doorFrame} position={[0, height / 2 + 0.02, 0]} />
      {/* Frame sides */}
      <Box size={[0.04, height, 0.12]} color={C.doorFrame} position={[-width / 2 - 0.02, 0, 0]} />
      <Box size={[0.04, height, 0.12]} color={C.doorFrame} position={[width / 2 + 0.02, 0, 0]} />
    </group>
  )
}

// ─── Clock (animated) ───────────────────────
export function WallClock({ ...props }) {
  const minuteRef = useRef()
  const hourRef = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (minuteRef.current) minuteRef.current.rotation.z = -t * 0.1
    if (hourRef.current) hourRef.current.rotation.z = -t * 0.008
  })
  return (
    <group {...props}>
      {/* Face */}
      <Cyl args={[0.15, 0.15, 0.02, 20]} color="#F5F0E8" position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} mat={M.tile} />
      {/* Rim */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.15, 0.012, 8, 24]} />
        <meshStandardMaterial color={C.woodDark} {...M.wood} />
      </mesh>
      {/* Minute hand */}
      <group ref={minuteRef} position={[0, 0, 0.015]}>
        <Box size={[0.01, 0.12, 0.003]} color="#333" position={[0, 0.06, 0]} />
      </group>
      {/* Hour hand */}
      <group ref={hourRef} position={[0, 0, 0.015]}>
        <Box size={[0.012, 0.08, 0.003]} color="#333" position={[0, 0.04, 0]} />
      </group>
    </group>
  )
}
