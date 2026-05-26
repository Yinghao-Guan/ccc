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
  // Document-space scroll span of the active segment, so the wipe progress can be
  // recomputed from the live scroll position each frame (synced to paint, no lag).
  segTop: number
  segBottom: number
}

type InkSceneProps = {
  stateRef: RefObject<ScrollState>
}

const MOBILE_SCENE_QUERY = '(max-width: 720px), (hover: none) and (pointer: coarse)'

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

// ── Ink-wash trail ──
// Generates a soft black ink "blob" texture procedurally on the canvas, with
// irregular splotches and a few small droplets around the rim for a wet-ink
// feel. Drawn once per session and shared across all trail sprites.
function makeInkTexture(): THREE.Texture {
  if (typeof document === 'undefined') return new THREE.Texture()
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const ctx = c.getContext('2d')!
  // Soft radial body
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 118)
  grad.addColorStop(0.00, 'rgba(0,0,0,0.78)')
  grad.addColorStop(0.32, 'rgba(8,6,5,0.46)')
  grad.addColorStop(0.62, 'rgba(8,6,5,0.20)')
  grad.addColorStop(1.00, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 256, 256)
  // Irregular splotches: simulate wet-paper bleed
  for (let i = 0; i < 28; i++) {
    const a = Math.random() * Math.PI * 2
    const r = Math.sqrt(Math.random()) * 100
    const x = 128 + Math.cos(a) * r
    const y = 128 + Math.sin(a) * r
    const rr = 3 + Math.random() * 16
    const alpha = 0.04 + Math.random() * 0.18
    ctx.fillStyle = `rgba(0,0,0,${alpha.toFixed(3)})`
    ctx.beginPath()
    ctx.arc(x, y, rr, 0, Math.PI * 2)
    ctx.fill()
  }
  // Tiny rim droplets
  for (let i = 0; i < 7; i++) {
    const a = Math.random() * Math.PI * 2
    const r = 92 + Math.random() * 26
    const x = 128 + Math.cos(a) * r
    const y = 128 + Math.sin(a) * r
    const rr = 1.5 + Math.random() * 3
    ctx.fillStyle = `rgba(0,0,0,${(0.18 + Math.random() * 0.18).toFixed(3)})`
    ctx.beginPath()
    ctx.arc(x, y, rr, 0, Math.PI * 2)
    ctx.fill()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.anisotropy = 4
  return tex
}

const TRAIL_POOL_SIZE = 36

type TrailMark = {
  position: THREE.Vector3
  birth: number
  life: number
  maxAlpha: number
  startScale: number
  rotation: number
  visible: boolean
}

function InkTrail({
  marksRef,
  texture,
}: {
  marksRef: RefObject<TrailMark[]>
  texture: THREE.Texture
}) {
  const spriteRefs = useRef<(THREE.Sprite | null)[]>([])

  useFrame((state) => {
    const marks = marksRef.current
    if (!marks) return
    const now = state.clock.elapsedTime
    for (let i = 0; i < TRAIL_POOL_SIZE; i++) {
      const sprite = spriteRefs.current[i]
      const m = marks[i]
      if (!sprite) continue
      if (!m || !m.visible) { sprite.visible = false; continue }
      const age = now - m.birth
      if (age >= m.life) {
        m.visible = false
        sprite.visible = false
        continue
      }
      const t = age / m.life
      // Fade slow-then-fast so the trail lingers like wet ink before drying.
      const fade = 1 - Math.pow(t, 1.6)
      sprite.visible = true
      sprite.position.copy(m.position)
      const scale = m.startScale * (1 + t * 0.45)
      sprite.scale.set(scale, scale, 1)
      const mat = sprite.material as THREE.SpriteMaterial
      mat.opacity = fade * m.maxAlpha
      mat.rotation = m.rotation
    }
  })

  return (
    <>
      {Array.from({ length: TRAIL_POOL_SIZE }).map((_, i) => (
        <sprite
          key={i}
          ref={(el) => { spriteRefs.current[i] = el }}
          visible={false}
        >
          <spriteMaterial
            attach="material"
            map={texture}
            transparent
            depthWrite={false}
            opacity={0}
            color="#0a0805"
          />
        </sprite>
      ))}
    </>
  )
}

function SceneContents({ stateRef }: InkSceneProps) {
  const { camera, viewport } = useThree()
  const brushRigRef = useRef<THREE.Group>(null)
  const rimLightRef = useRef<THREE.PointLight>(null)
  const handleMaterialsRef = useRef<Map<THREE.Material, THREE.Color>>(new Map())

  const currentPose = useRef<Pose>({ ...REST_POSES.hero, rotation: [...REST_POSES.hero.rotation] as [number, number, number] })
  const currentAccent = useRef(new THREE.Color(REST_POSES.hero.accent))
  const targetAccent = useRef(new THREE.Color(REST_POSES.hero.accent))
  const tempColor = useRef(new THREE.Color())
  const initialised = useRef(false)

  const inkTexture = useMemo(() => makeInkTexture(), [])
  const trailMarksRef = useRef<TrailMark[]>(
    Array.from({ length: TRAIL_POOL_SIZE }, () => ({
      position: new THREE.Vector3(),
      birth: 0,
      life: 0,
      maxAlpha: 0,
      startScale: 0,
      rotation: 0,
      visible: false,
    })),
  )
  const lastEmitRef = useRef(0)
  const lastSeamRef = useRef(-1)
  const lastProgressRef = useRef(-1)

  useFrame((state, delta) => {
    const rig = brushRigRef.current
    if (!rig) return

    const scroll = stateRef.current
    const seg = scroll?.segment ?? { kind: 'rest', chapter: 'hero' as ChapterId }
    // Recompute progress from the LIVE scroll position (not the scroll-event-driven
    // value) so the about counter-scroll stays glued to the page with no frame lag.
    let lp = scroll?.localProgress ?? 0
    if (scroll && seg.kind === 'transition') {
      const focusY = window.scrollY + window.innerHeight * 0.45
      const span = Math.max(1, scroll.segBottom - scroll.segTop)
      lp = Math.min(1, Math.max(0, (focusY - scroll.segTop) / span))
    }

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

    // ── Hero→About wipe seam ──
    // Publish the brush's on-screen x so the CSS clip edge rides exactly where the brush
    // is (the brush IS the seam). The brush's normalized xFrac equals its NDC x — the
    // perspective z-scaling cancels: screenX = (xFrac * halfW) / halfW = xFrac — so the
    // screen fraction from the left is (xFrac + 1) / 2. Short ramps over the first/last
    // 8% pull the seam to the screen edges (the brush never reaches them) so the wipe
    // completes without a pop. Rest poses pin it to 1 (hero, full) or 0 (about, cleared).
    let seam: number
    if (seg.kind === 'transition' && seg.id === 'hero-to-about') {
      const bf = (currentPose.current.xFrac + 1) / 2
      const startEdge = 0.08 // ramp in from the right edge so About doesn't pop in
      const clearStart = 0.7 // brush has finished its sweep and parks ~20% from the left;
      const clearEnd = 0.9 //   drive the seam the rest of the way to 0 so Hero fully clears
      if (lp < startEdge) seam = THREE.MathUtils.lerp(1, bf, lp / startEdge)
      else if (lp >= clearEnd) seam = 0
      else if (lp >= clearStart) seam = THREE.MathUtils.lerp(bf, 0, (lp - clearStart) / (clearEnd - clearStart))
      else seam = bf
    } else {
      seam = seg.kind === 'rest' && seg.chapter === 'hero' ? 1 : 0
    }
    seam = THREE.MathUtils.clamp(seam, 0, 1)
    if (Math.abs(seam - lastSeamRef.current) > 0.0005) {
      document.documentElement.style.setProperty('--ha-seam', seam.toFixed(4))
      lastSeamRef.current = seam
    }

    // Drive the About counter-scroll (--ha-progress) and ink-wash fade from the same
    // live, per-frame progress. Computed here in the render loop (synced to paint) it
    // cancels scroll exactly, so About sits perfectly still — no jitter.
    const progress =
      seg.kind === 'transition' && seg.id === 'hero-to-about'
        ? lp
        : seg.kind === 'rest' && seg.chapter === 'hero'
          ? 0
          : 1
    if (Math.abs(progress - lastProgressRef.current) > 0.0005) {
      document.documentElement.style.setProperty('--ha-progress', progress.toFixed(4))
      lastProgressRef.current = progress
    }

    // ── Ink-wash trail emission (hero→about transition only) ──
    // The trail is placed on the z=0 plane but aligned to the brush's screen
    // position via xFrac/yFrac so the marks visually trail behind the brush as
    // it sweeps right→left, regardless of how close the brush is to the camera.
    const isHeroAbout = scroll?.segment.kind === 'transition' && scroll.segment.id === 'hero-to-about'
    const marks = trailMarksRef.current
    const now = state.clock.elapsedTime
    if (isHeroAbout) {
      const lpNow = scroll!.localProgress
      // Emit during the close approach and the painting sweep.
      if (lpNow >= 0.38 && lpNow <= 0.98) {
        const emitInterval = 0.045
        if (now - lastEmitRef.current >= emitInterval) {
          // Recycle the oldest slot (invisible slots preferred).
          let slot = -1
          let oldest = Infinity
          for (let i = 0; i < TRAIL_POOL_SIZE; i++) {
            const m = marks[i]
            if (!m.visible) { slot = i; break }
            if (m.birth < oldest) { oldest = m.birth; slot = i }
          }
          if (slot >= 0) {
            const m = marks[slot]
            // Project the brush's xFrac/yFrac onto the z=0 plane so the trail
            // lives on the "paper" rather than near the camera.
            const baseX = currentPose.current.xFrac * (viewport.width / 2)
            const baseY = currentPose.current.yFrac * (viewport.height / 2)
            const isDroplet = Math.random() < 0.22
            const jx = (Math.random() - 0.5) * (isDroplet ? 1.4 : 0.55)
            const jy = (Math.random() - 0.5) * (isDroplet ? 1.0 : 0.40) - 0.10
            m.position.set(baseX + jx, baseY + jy, 0)
            m.birth = now
            m.life = isDroplet ? (0.9 + Math.random() * 0.7) : (1.6 + Math.random() * 1.2)
            m.maxAlpha = isDroplet ? (0.42 + Math.random() * 0.22) : (0.28 + Math.random() * 0.22)
            m.startScale = isDroplet ? (0.20 + Math.random() * 0.22) : (0.55 + Math.random() * 0.95)
            m.rotation = Math.random() * Math.PI * 2
            m.visible = true
            lastEmitRef.current = now
          }
        }
      }
    }
    // Outside the hero→about transition we simply stop emitting new marks —
    // existing marks keep aging through InkTrail's useFrame so the trail
    // tapers off smoothly instead of vanishing at the segment boundary.

    const handles = handleMaterialsRef.current
    handles.forEach((orig, mat) => {
      const m = mat as THREE.MeshStandardMaterial
      tempColor.current.copy(orig).lerp(currentAccent.current, 0.28)
      if (!m.color.equals(tempColor.current)) {
        m.color.copy(tempColor.current)
        m.needsUpdate = true
      }
    })

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

      {/* Rim light that brightens the brush handle on ink chapters so the silhouette
          stays legible against the dark page. Intensity is tuned in useFrame. */}
      <pointLight ref={rimLightRef} position={[2, 1, 4]} intensity={0} color="#f5c98a" distance={20} />

      <group ref={brushRigRef}>
        <Suspense fallback={null}>
          <BrushModel handleMaterialsRef={handleMaterialsRef} />
        </Suspense>
      </group>

      <InkTrail marksRef={trailMarksRef} texture={inkTexture} />

      <Sparkles count={10} scale={[10, 7, 4]} size={1} speed={0.14} color="#f2d39f" opacity={0.16} />
      <Environment preset="warehouse" />
    </>
  )
}

export default function InkScene(props: InkSceneProps) {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const media = window.matchMedia(MOBILE_SCENE_QUERY)
    const update = () => setIsMobile(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  if (isMobile) return null

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
