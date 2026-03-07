import React, { useState, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'

export default function App() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="canvas-container">
      {/* Loading screen */}
      <div className={`loading-screen ${loaded ? 'loaded' : ''}`}>
        <div className="loading-spinner" />
        <p className="loading-text">Loading 3D scene…</p>
      </div>

      {/* Three.js Canvas */}
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          preserveDrawingBuffer: true,
          outputColorSpace: 'srgb',
        }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div className="overlay">
        <h1 className="overlay-title">My Cozy House</h1>
        <p className="overlay-subtitle">6.00m × 10.00m · Interactive 3D Floor Plan</p>
      </div>

      {/* Controls hint */}
      <div className="controls-hint">
        <span><kbd>Drag</kbd> Rotate</span>
        <span><kbd>Scroll</kbd> Zoom</span>
        <span><kbd>Right-drag</kbd> Pan</span>
      </div>
    </div>
  )
}
