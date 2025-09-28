"use client"

import React, { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'

function SimpleTelescopeModel() {
  const group = useRef<THREE.Group>(null)

  // Animation de rotation douce
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05
    }
  })

  return (
    <group ref={group}>
      {/* Base du télescope */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.8, 1, 0.3, 16]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Support vertical */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.15, 1, 16]} />
        <meshStandardMaterial color="#444" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Tube principal du télescope */}
      <mesh position={[0, 1, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 2, 16]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Oculaire */}
      <mesh position={[-0.4, 1.6, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.3, 12]} />
        <meshStandardMaterial color="#0f3460" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Lentille avant */}
      <mesh position={[0.8, 0.4, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
        <meshStandardMaterial
          color="#87ceeb"
          metalness={0.1}
          roughness={0.0}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Chercheur */}
      <mesh position={[0.2, 1.3, 0.2]} rotation={[0, 0, Math.PI / 6]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.5, 8]} />
        <meshStandardMaterial color="#333" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Étoiles décoratives autour */}
      {Array.from({ length: 20 }, (_, i) => {
        const angle = (i / 20) * Math.PI * 2
        const radius = 3 + Math.random() * 2
        const height = Math.random() * 2 - 1
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              height,
              Math.sin(angle) * radius
            ]}
          >
            <sphereGeometry args={[0.02, 4, 4]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        )
      })}
    </group>
  )
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-gray-600">Chargement du télescope 3D...</p>
      </div>
    </div>
  )
}

interface Telescope3DProps {
  className?: string
}

export function Telescope3D({ className = "" }: Telescope3DProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          camera={{
            position: [3, 2, 3],
            fov: 50,
            near: 0.1,
            far: 1000
          }}
          shadows
          style={{
            background: 'linear-gradient(135deg, #0c0f1e 0%, #1a1a2e 50%, #16213e 100%)'
          }}
        >
          {/* Éclairage */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <pointLight position={[-10, -10, -10]} color="#4169E1" intensity={0.3} />
          <pointLight position={[5, 5, 5]} color="#87ceeb" intensity={0.2} />

          {/* Environnement étoilé */}
          <Environment preset="night" />

          {/* Modèle du télescope */}
          <SimpleTelescopeModel />

          {/* Plan au sol pour les ombres */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <shadowMaterial transparent opacity={0.3} />
          </mesh>

          {/* Contrôles d'orbite pour interaction */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            autoRotate={true}
            autoRotateSpeed={1}
            minDistance={2}
            maxDistance={8}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI - Math.PI / 6}
          />
        </Canvas>
      </Suspense>
    </div>
  )
}