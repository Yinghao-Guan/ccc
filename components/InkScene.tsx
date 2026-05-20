'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Line, Sparkles, useGLTF } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

type InkSceneProps = {
  activeChapter: string
  chapterProgress: number
  overallProgress: number
}

// Keep path framing stable even if the orthographic camera zoom changes.
// This preserves the original composition that was tuned around zoom 500.
const PATH_LAYOUT_ZOOM = 500

const pathCurve = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(-4.8, 2.2, -1.4),
    new THREE.Vector3(-4.1, 2.5, -1.0),
    new THREE.Vector3(-3.1, 1.8, -0.2),
    new THREE.Vector3(-2.2, 0.5, 0.5),
    new THREE.Vector3(-1.3, -0.8, 0.9),
    new THREE.Vector3(-0.2, -1.9, 0.8),
    new THREE.Vector3(1.0, -2.1, 0.4),
    new THREE.Vector3(2.2, -1.2, -0.1),
    new THREE.Vector3(3.0, 0.3, -0.5),
    new THREE.Vector3(3.5, 1.5, -0.9),
    new THREE.Vector3(2.8, 2.3, -1.0),
    new THREE.Vector3(1.5, 2.0, -0.6),
    new THREE.Vector3(0.4, 1.0, 0.2),
    new THREE.Vector3(-0.3, -0.2, 0.8),
    new THREE.Vector3(0.3, -1.3, 0.7),
    new THREE.Vector3(1.8, -1.5, 0.1),
    new THREE.Vector3(3.4, -0.4, -0.6),
    new THREE.Vector3(4.4, 0.8, -0.9),
  ],
  false,
  'catmullrom',
  0.42
)

// Stable fallback axis used when tangent is anti-parallel to worldUp
const FALLBACK_AXIS = new THREE.Vector3(1, 0, 0)
const MODEL_SCALE = 8

function BrushModel({ activeChapter }: { activeChapter: string }) {
  const { scene } = useGLTF('/models/chinese-calligraphy-brush/source/Chinese Calligraphy Brush.glb')

  // Bug 2 fix: clone hierarchy AND materials so we never mutate the shared GLTF cache
  const model = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      child.material = Array.isArray(child.material)
        ? child.material.map((m: THREE.Material) => m.clone())
        : (child.material as THREE.Material).clone()
    })
    return clone
  }, [scene])

  const accentColor = useMemo(() => {
    switch (activeChapter) {
      case 'events':   return new THREE.Color('#8b3a20')
      case 'gallery':  return new THREE.Color('#5c3d26')
      case 'officers': return new THREE.Color('#7B2121')
      case 'join':     return new THREE.Color('#4a3020')
      case 'epigraph': return new THREE.Color('#2a1f1a')
      default:         return new THREE.Color('#3a2a1e')
    }
  }, [activeChapter])

  // Bug 3 fix: store each 笔杆 material's original color so the accent lerp
  // always starts from the same base regardless of how many chapters have passed
  const origColors = useRef<Map<THREE.Material, THREE.Color>>(new Map())

  // One-time geometry/material setup — runs once when the model clone is ready
  useEffect(() => {
    model.updateMatrixWorld(true)
    model.scale.setScalar(MODEL_SCALE)

    origColors.current.clear()

    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      child.castShadow = false
      child.receiveShadow = false
      child.frustumCulled = false

      const mats = Array.isArray(child.material) ? child.material : [child.material]
      mats.forEach((mat) => {
        if (!(mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial)) return
        mat.roughness = Math.min(1, Math.max(0.22, mat.roughness ?? 0.6))
        mat.metalness = Math.min(0.28, mat.metalness ?? 0)
        mat.transparent = false
        mat.side = THREE.DoubleSide
        mat.needsUpdate = true

        // Capture original color before any accent is applied
        if (!origColors.current.has(mat)) {
          origColors.current.set(mat, mat.color.clone())
        }
      })
    })
  }, [model])

  // Per-chapter accent: reset to the captured original before lerping to avoid accumulation
  useEffect(() => {
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      mats.forEach((mat) => {
        if (!(mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial)) return
        if (mat.name.includes('笔杆') || child.name.includes('笔杆')) {
          const orig = origColors.current.get(mat)
          if (orig) {
            mat.color.copy(orig).lerp(accentColor, 0.22)
            mat.needsUpdate = true
          }
        }
      })
    })
  }, [model, accentColor])

  return <primitive object={model} />
}

function SceneContents({ activeChapter, overallProgress }: InkSceneProps) {
  const { camera } = useThree()
  const brushRigRef = useRef<THREE.Group>(null)
  const haloRef = useRef<THREE.Mesh>(null)
  const brushProgress = useRef(0.04)
  const stagedPoint = useRef(new THREE.Vector3())
  const worldUp = useRef(new THREE.Vector3(0, 1, 0))
  const targetQuaternion = useRef(new THREE.Quaternion())
  const tiltQuaternion = useRef(
    new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI * 0.52, 0, 0))
  )
  const swayQuaternion = useRef(new THREE.Quaternion())
  const pathPoints = useMemo(() => {
    const points = pathCurve.getSpacedPoints(180)
    return points.map((point) => new THREE.Vector3(point.x, point.y, 0))
  }, [])

  // Bug 4 fix: sync scroll value to a ref so useFrame always reads the latest
  // value without depending on closure capture timing
  const overallProgressRef = useRef(overallProgress)
  overallProgressRef.current = overallProgress

  const mappedPathPoints = useMemo(() => {
    const cam = camera as THREE.OrthographicCamera
    const hw = cam.right / PATH_LAYOUT_ZOOM
    const hh = cam.top / PATH_LAYOUT_ZOOM
    return pathPoints.map((point) => (
      new THREE.Vector3(
        point.x * hw * 0.155 + hw * 0.065,
        point.y * hh * 0.22 + hh * 0.12 + 0.16,
        0.18
      )
    ))
  }, [camera, pathPoints])

  useFrame((state, delta) => {
    if (!haloRef.current || !brushRigRef.current) return

    const targetT = THREE.MathUtils.clamp(overallProgressRef.current * 0.94 + 0.03, 0.03, 0.97)
    brushProgress.current = THREE.MathUtils.damp(brushProgress.current, targetT, 4.2, delta)

    const brushPoint = pathCurve.getPointAt(brushProgress.current)
    const aheadPoint = pathCurve.getPointAt(Math.min(0.995, brushProgress.current + 0.012))
    const tangent = aheadPoint.clone().sub(brushPoint).normalize()

    // Map the curve into a stable world-space layout. We still respond to screen size
    // through the orthographic frustum, but we intentionally decouple the path from the
    // live camera zoom so changing zoom only changes framing, not the brush trajectory.
    const cam = camera as THREE.OrthographicCamera
    const hw = cam.right / PATH_LAYOUT_ZOOM
    const hh = cam.top   / PATH_LAYOUT_ZOOM
    stagedPoint.current.set(
      brushPoint.x * hw * 0.155 + hw * 0.065,
      brushPoint.y * hh * 0.22  + hh * 0.12,
      0
    )

    // Bug 5 fix: setFromUnitVectors(up, tangent) produces a degenerate quaternion
    // when tangent ≈ (0, -1, 0) (anti-parallel to worldUp). Guard with dot product.
    const dot = worldUp.current.dot(tangent)
    if (dot < -0.9999) {
      targetQuaternion.current.setFromAxisAngle(FALLBACK_AXIS, Math.PI)
    } else {
      targetQuaternion.current.setFromUnitVectors(worldUp.current, tangent)
    }

    swayQuaternion.current.setFromAxisAngle(
      tangent,
      Math.sin(state.clock.elapsedTime * 0.7) * 0.035
    )
    targetQuaternion.current.multiply(tiltQuaternion.current)
    targetQuaternion.current.multiply(swayQuaternion.current)

    brushRigRef.current.position.copy(stagedPoint.current)
    brushRigRef.current.quaternion.slerp(targetQuaternion.current, 0.14)
    brushRigRef.current.position.y += 0.16
    brushRigRef.current.position.z = 0.18

    haloRef.current.position.set(
      Math.sin(state.clock.elapsedTime * 0.12) * 0.35,
      0.15 + Math.cos(state.clock.elapsedTime * 0.16) * 0.16,
      -1.8
    )
    haloRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 0.22) * 0.05)
    haloRef.current.rotation.z += delta * 0.06
  })

  return (
    <>
      <fog attach="fog" args={['#050505', 8, 18]} />
      <ambientLight intensity={0.96} />
      <directionalLight position={[4, 5, 3]} intensity={2.1} color="#fff4db" />
      <pointLight position={[-5, -2, 4]} intensity={1.1} color="#a1291d" />
      <spotLight position={[0, 6, 7]} intensity={1.5} angle={0.4} penumbra={1} color="#ffe8bf" />

      <mesh ref={haloRef}>
        <torusGeometry args={[2.8, 0.08, 20, 96]} />
        <meshBasicMaterial color="#a92f21" transparent opacity={0.08} />
      </mesh>

      <Line points={mappedPathPoints} color="#7B2121" transparent opacity={0.35} lineWidth={1} />

      {/* Bug 1 fix: BrushModel uses useGLTF which suspends during load.
          Without Suspense the Canvas throws an unhandled suspension and goes blank. */}
      <group ref={brushRigRef}>
        <Suspense fallback={null}>
          <BrushModel activeChapter={activeChapter} />
        </Suspense>
      </group>

      <Sparkles count={10} scale={[9, 6, 4]} size={1} speed={0.14} color="#f2d39f" opacity={0.16} />

      <Environment preset="warehouse" />
    </>
  )
}

export default function InkScene(props: InkSceneProps) {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return (
    <div className="scene-layer" aria-hidden="true">
      <Canvas
        orthographic
        camera={{ position: [0, 0, 10], zoom: 160 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        frameloop={reducedMotion ? 'demand' : 'always'}
      >
        <SceneContents {...props} />
      </Canvas>
    </div>
  )
}

useGLTF.preload('/models/chinese-calligraphy-brush/source/Chinese Calligraphy Brush.glb')
