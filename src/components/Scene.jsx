import React, { Suspense } from 'react'
import { OrthographicCamera, OrbitControls, ContactShadows } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import House from './House'
import Rooms from './Rooms'
import Lighting from './Lighting'

/* ═══════════════════════════════════════════
   SCENE SETUP
   Camera, controls, post-processing, composition
   ═══════════════════════════════════════════ */

export default function Scene() {
  return (
    <>
      {/* Isometric orthographic camera from front-left-top */}
      <OrthographicCamera
        makeDefault
        position={[-12, 13, 14]}
        zoom={56}
        near={0.1}
        far={100}
      />

      {/* Orbit controls — constrained for isometric feel */}
      <OrbitControls
        target={[0, 0.5, 0]}
        minZoom={25}
        maxZoom={130}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 8}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.5}
        panSpeed={0.5}
      />

      {/* Lighting & atmosphere */}
      <Lighting />

      {/* Contact shadows on ground plane */}
      <ContactShadows
        position={[0, -0.24, 0]}
        opacity={0.35}
        scale={20}
        blur={2.5}
        far={6}
        color="#3A2A1A"
      />

      {/* House structure */}
      <Suspense fallback={null}>
        <House />
        <Rooms />
      </Suspense>

      {/* Post-processing for premium look */}
      <EffectComposer multisampling={4}>
        <Bloom
          intensity={0.08}
          luminanceThreshold={0.9}
          luminanceSmoothing={0.5}
          mipmapBlur
        />
        <Vignette
          darkness={0.3}
          offset={0.3}
        />
      </EffectComposer>
    </>
  )
}
