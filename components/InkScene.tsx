'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Sparkles, useGLTF } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'
import {
  REST_POSES,
  TRANSITIONS,
  sampleTrack,
  type ChapterId,
  type Pose,
  type TransitionId,
} from '@/lib/brushChoreography'

export type SegmentRef =
  | { kind: 'rest'; chapter: ChapterId }
  | { kind: 'transition'; id: TransitionId }

export type ScrollState = {
  segment: SegmentRef
  localProgress: number
  narrativeProgress: number
  theme: 'tea' | 'ink'
}

type InkSceneProps = {
  stateRef: RefObject<ScrollState>
}

// Tuned together with the camera fov so the brush at scale 1.0 reads about
// the same on-screen size as before the fov widening.
const MODEL_BASE_SCALE = 8.0
// Base orientation applied to the GLB so its long axis ends up vertical, tip pointing down.
// If the model loads in a different default orientation, tune these radians.
const BASE_EULER = new THREE.Euler(0, 0, 0)

function BrushModel({
  handleMaterialsRef,
}: {
  handleMaterialsRef: RefObject<Map<THREE.Material, THREE.Color>>
}) {
  const { scene } = useGLTF('/models/chinese-calligraphy-brush/source/Chinese Calligraphy Brush.glb')

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

  useEffect(() => {
    model.updateMatrixWorld(true)
    model.rotation.copy(BASE_EULER)
    model.scale.setScalar(1)

    const handleColors = handleMaterialsRef.current
    handleColors.clear()

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
        if (mat.name.includes('笔杆') || child.name.includes('笔杆')) {
          handleColors.set(mat, mat.color.clone())
        }
      })
    })
  }, [model, handleMaterialsRef])

  return <primitive object={model} />
}

function SceneContents({ stateRef }: InkSceneProps) {
  const { camera, viewport } = useThree()
  const brushRigRef = useRef<THREE.Group>(null)
  const haloRef = useRef<THREE.Mesh>(null)
  const haloMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const rimLightRef = useRef<THREE.PointLight>(null)
  const handleMaterialsRef = useRef<Map<THREE.Material, THREE.Color>>(new Map())

  const currentPose = useRef<Pose>({ ...REST_POSES.hero, rotation: [...REST_POSES.hero.rotation] as [number, number, number] })
  const currentAccent = useRef(new THREE.Color(REST_POSES.hero.accent))
  const targetAccent = useRef(new THREE.Color(REST_POSES.hero.accent))
  const tempColor = useRef(new THREE.Color())
  const initialised = useRef(false)

  useFrame((state, delta) => {
    const rig = brushRigRef.current
    if (!rig) return

    const scroll = stateRef.current
    const seg = scroll?.segment ?? { kind: 'rest', chapter: 'hero' as ChapterId }
    const lp = scroll?.localProgress ?? 0

    const targetPose: Pose =
      seg.kind === 'rest'
        ? REST_POSES[seg.chapter]
        : sampleTrack(TRANSITIONS[seg.id], lp)

    if (!initialised.current) {
      currentPose.current.xFrac = targetPose.xFrac
      currentPose.current.yFrac = targetPose.yFrac
      currentPose.current.z = targetPose.z
      currentPose.current.scale = targetPose.scale
      currentPose.current.rotation = [...targetPose.rotation] as [number, number, number]
      currentAccent.current.set(targetPose.accent)
      initialised.current = true
    }

    // Higher damping speed during transitions so the brush actually follows the
    // dramatic keyframes; gentler at rest for organic settling.
    const k = scroll?.segment.kind === 'transition' ? 7.0 : 4.5
    const damp = (a: number, b: number) => THREE.MathUtils.damp(a, b, k, delta)

    currentPose.current.xFrac = damp(currentPose.current.xFrac, targetPose.xFrac)
    currentPose.current.yFrac = damp(currentPose.current.yFrac, targetPose.yFrac)
    currentPose.current.z = damp(currentPose.current.z, targetPose.z)
    currentPose.current.scale = damp(currentPose.current.scale, targetPose.scale)
    currentPose.current.rotation[0] = damp(currentPose.current.rotation[0], targetPose.rotation[0])
    currentPose.current.rotation[1] = damp(currentPose.current.rotation[1], targetPose.rotation[1])
    currentPose.current.rotation[2] = damp(currentPose.current.rotation[2], targetPose.rotation[2])

    targetAccent.current.set(targetPose.accent)
    currentAccent.current.lerp(targetAccent.current, 1 - Math.exp(-k * delta))

    // Map normalized viewport coords to world units using the perspective frustum.
    // viewport.width/height is the visible world size at z=0 (camera-target distance).
    // At a different z, scale linearly with (focalZ - z) / focalZ.
    const cam = camera as THREE.PerspectiveCamera
    const focalZ = cam.position.z
    const zDist = focalZ - currentPose.current.z
    const scaleByDist = zDist / focalZ
    const halfW = (viewport.width / 2) * scaleByDist
    const halfH = (viewport.height / 2) * scaleByDist

    rig.position.set(
      currentPose.current.xFrac * halfW,
      currentPose.current.yFrac * halfH,
      currentPose.current.z,
    )

    // Tiny idle sway layered on top of pose rotation.
    const swayX = Math.sin(state.clock.elapsedTime * 0.7) * 0.025
    const swayZ = Math.cos(state.clock.elapsedTime * 0.55) * 0.020

    rig.rotation.set(
      currentPose.current.rotation[0] + swayX,
      currentPose.current.rotation[1],
      currentPose.current.rotation[2] + swayZ,
    )

    rig.scale.setScalar(MODEL_BASE_SCALE * currentPose.current.scale)

    const handles = handleMaterialsRef.current
    handles.forEach((orig, mat) => {
      const m = mat as THREE.MeshStandardMaterial
      tempColor.current.copy(orig).lerp(currentAccent.current, 0.28)
      if (!m.color.equals(tempColor.current)) {
        m.color.copy(tempColor.current)
        m.needsUpdate = true
      }
    })

    if (haloRef.current) {
      haloRef.current.position.set(
        Math.sin(state.clock.elapsedTime * 0.12) * 0.4,
        0.2 + Math.cos(state.clock.elapsedTime * 0.16) * 0.18,
        -3.0,
      )
      haloRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 0.22) * 0.05)
      haloRef.current.rotation.z += delta * 0.06
    }

    // Halo opacity stays subtle in both themes since the paper is light in both.
    if (haloMatRef.current) {
      haloMatRef.current.opacity = THREE.MathUtils.damp(haloMatRef.current.opacity, 0.07, 3.0, delta)
    }
    if (rimLightRef.current) {
      rimLightRef.current.intensity = THREE.MathUtils.damp(rimLightRef.current.intensity, 0, 3.0, delta)
    }
  })

  return (
    <>
      <fog attach="fog" args={['#050505', 10, 24]} />
      <ambientLight intensity={0.96} />
      <directionalLight position={[4, 5, 3]} intensity={2.1} color="#fff4db" />
      <pointLight position={[-5, -2, 4]} intensity={1.0} color="#a1291d" />
      <spotLight position={[0, 6, 7]} intensity={1.5} angle={0.4} penumbra={1} color="#ffe8bf" />

      <mesh ref={haloRef}>
        <torusGeometry args={[3.4, 0.09, 20, 96]} />
        <meshBasicMaterial ref={haloMatRef} color="#c75a3a" transparent opacity={0.07} />
      </mesh>

      {/* Rim light that brightens the brush handle on ink chapters so the silhouette
          stays legible against the dark page. Intensity is tuned in useFrame. */}
      <pointLight ref={rimLightRef} position={[2, 1, 4]} intensity={0} color="#f5c98a" distance={20} />

      <group ref={brushRigRef}>
        <Suspense fallback={null}>
          <BrushModel handleMaterialsRef={handleMaterialsRef} />
        </Suspense>
      </group>

      <Sparkles count={10} scale={[10, 7, 4]} size={1} speed={0.14} color="#f2d39f" opacity={0.16} />
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
        camera={{ position: [0, 0, 8], fov: 46, near: 0.1, far: 60 }}
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
