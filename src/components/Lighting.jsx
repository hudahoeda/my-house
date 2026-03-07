import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Sparkles } from '@react-three/drei'

/* ═══════════════════════════════════════════
   SCENE LIGHTING & ENVIRONMENT
   Warm cozy lighting, dust particles,
   ambient atmosphere
   ═══════════════════════════════════════════ */

// Floating dust particles in light beams
function DustParticles() {
  return (
    <group>
      {/* Indoor dust motes — warm, subtle */}
      <Sparkles
        count={80}
        size={1.5}
        scale={[5, 3, 8]}
        position={[0, 1.5, -1]}
        speed={0.15}
        opacity={0.3}
        color="#FFE4B5"
      />
      {/* Outdoor sparkle — garden area */}
      <Sparkles
        count={40}
        size={2}
        scale={[3, 3, 3]}
        position={[-1.5, 2, 3.25]}
        speed={0.3}
        opacity={0.25}
        color="#FFFFCC"
      />
    </group>
  )
}

// Gentle ambient fog/atmosphere
function Atmosphere() {
  return (
    <>
      <fog attach="fog" args={['#2A2A3E', 22, 50]} />
      <color attach="background" args={['#1A1A2E']} />
    </>
  )
}

export default function Lighting() {
  return (
    <group>
      <Atmosphere />
      <DustParticles />

      {/* ═══ AMBIENT LIGHT ═══ */}
      <ambientLight intensity={0.45} color="#FFF0DC" />

      {/* Hemisphere for natural sky/ground fill */}
      <hemisphereLight
        intensity={0.4}
        color="#B0D4F1"
        groundColor="#A08050"
        position={[0, 10, 0]}
      />

      {/* ═══ MAIN DIRECTIONAL (warm sunlight from front-left) ═══ */}
      <directionalLight
        position={[-8, 14, 10]}
        intensity={1.8}
        color="#FFF0D0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />

      {/* Secondary fill light (softer, cool tone from opposite side) */}
      <directionalLight
        position={[6, 8, -4]}
        intensity={0.5}
        color="#E0E8FF"
      />

      {/* Warm bounce fill from below/front */}
      <directionalLight
        position={[-4, 2, 8]}
        intensity={0.25}
        color="#FFE8C0"
      />

      {/* ═══ ROOM POINT LIGHTS (warm interior glow) ═══ */}

      {/* Bedroom 2 — soft warm light */}
      <pointLight
        position={[-1.5, 1.6, -3.75]}
        intensity={1.0}
        distance={5}
        color="#FFE4B5"
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />

      {/* Bathroom — cool white */}
      <pointLight
        position={[-2.35, 1.6, -1.75]}
        intensity={0.7}
        distance={3.5}
        color="#F0F0FF"
      />

      {/* Bedroom 1 — warm ambient */}
      <pointLight
        position={[-1.5, 1.6, 0.25]}
        intensity={1.0}
        distance={5}
        color="#FFE0C0"
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />

      {/* Family room — main living light (warmest, brightest) */}
      <pointLight
        position={[1.5, 1.6, -0.925]}
        intensity={1.4}
        distance={6}
        color="#FFD9A0"
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />

      {/* Family room — accent spot on dining area */}
      <spotLight
        position={[1.5, 1.65, -1.8]}
        angle={0.5}
        penumbra={0.8}
        intensity={0.8}
        distance={4}
        color="#FFE4B5"
        target-position={[1.5, 0, -1.8]}
      />

      {/* Rear yard — soft outdoor */}
      <pointLight
        position={[1.5, 2.0, -3.75]}
        intensity={0.6}
        distance={5}
        color="#FFFFEE"
      />

      {/* Front garden — natural light */}
      <pointLight
        position={[-1.5, 3.5, 3.25]}
        intensity={0.8}
        distance={6}
        color="#FFFFDD"
      />

      {/* Carport — overhead */}
      <pointLight
        position={[1.5, 2.3, 3.2]}
        intensity={0.5}
        distance={5}
        color="#FFF0D0"
      />

      {/* Front terrace — porch light */}
      <pointLight
        position={[1.5, 1.6, 1.1]}
        intensity={0.6}
        distance={3.5}
        color="#FFE0B0"
      />
    </group>
  )
}
