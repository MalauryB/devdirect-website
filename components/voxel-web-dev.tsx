"use client"

import React, { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'

interface VoxelWebDevModelProps {
  modelPath: string
}

function VoxelWebDevModel({ modelPath }: VoxelWebDevModelProps) {
  const group = useRef<THREE.Group>(null)

  // Chargement du modèle GLTF voxel
  const { scene } = useGLTF(modelPath)

  // Animation de rotation douce et flottement
  useFrame((state) => {
    if (group.current) {
      // Rotation automatique lente
      group.current.rotation.y = state.clock.elapsedTime * 0.2
      // Léger flottement vertical
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1
    }
  })

  // Cloner la scène pour éviter les conflits de réutilisation
  const clonedScene = scene.clone()

  return (
    <group ref={group}>
      <primitive object={clonedScene} scale={[2, 2, 2]} />
    </group>
  )
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-gray-600">Chargement du modèle 3D...</p>
      </div>
    </div>
  )
}

interface VoxelWebDevProps {
  className?: string
}

export function VoxelWebDev({ className = "" }: VoxelWebDevProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          camera={{
            position: [4, 3, 4],
            fov: 45,
            near: 0.1,
            far: 1000
          }}
          shadows
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          {/* Éclairage optimisé pour les voxels */}
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <pointLight position={[-5, 5, -5]} color="#4169E1" intensity={0.4} />
          <pointLight position={[5, -2, 5]} color="#FFD700" intensity={0.3} />

          {/* Environnement de développement */}
          <Environment preset="city" />

          {/* Modèle voxel de développement web */}
          <VoxelWebDevModel modelPath="/voxel_web_development/scene.gltf" />

          {/* Plan au sol pour les ombres */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <shadowMaterial transparent opacity={0.3} />
          </mesh>

          {/* Contrôles d'orbite pour interaction */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            autoRotate={false}
            minDistance={3}
            maxDistance={10}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI - Math.PI / 6}
          />
        </Canvas>
      </Suspense>
    </div>
  )
}

// Préchargement du modèle pour de meilleures performances
useGLTF.preload("/voxel_web_development/scene.gltf")