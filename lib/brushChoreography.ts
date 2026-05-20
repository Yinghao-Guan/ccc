// Brush choreography data.
//
// REST_POSES — where the brush sits while a chapter is being read.
//   xFrac / yFrac are normalized viewport coordinates at the brush's z plane
//   (-1 = left/bottom edge, +1 = right/top edge, 0 = center).
//
// TRANSITIONS — keyframed arcs that the brush traces between two adjacent chapters.
//   Each track has 4–6 keyframes at normalized time t∈[0,1].

export const CHAPTER_IDS = [
  'hero',
  'about',
  'events',
  'gallery',
  'officers',
  'join',
  'epigraph',
] as const

export type ChapterId = (typeof CHAPTER_IDS)[number]

export type TransitionId =
  | 'hero-to-about'
  | 'about-to-events'
  | 'events-to-gallery'
  | 'gallery-to-officers'
  | 'officers-to-join'
  | 'join-to-epigraph'

export type Pose = {
  xFrac: number          // -1 (left edge) .. +1 (right edge)
  yFrac: number          // -1 (bottom)    .. +1 (top)
  z: number              // depth; negative pushes back, positive pulls toward camera
  rotation: [number, number, number]  // extra Euler rotation on top of the base "vertical tip-down" orientation
  scale: number          // multiplier on MODEL_BASE_SCALE
  accent: string         // 笔杆 (handle) tint blended toward the original material color
}

export type TransitionTrack = {
  keyframes: { t: number; pose: Pose }[]
}

export const REST_POSES: Record<ChapterId, Pose> = {
  hero:     { xFrac:  0.62, yFrac:  0.05, z:  0,    rotation: [0,    0,  0.05], scale: 1.00, accent: '#3a2a1e' },
  about:    { xFrac: -0.60, yFrac:  0.00, z:  0,    rotation: [0,    0, -0.05], scale: 0.95, accent: '#5c3d26' },
  events:   { xFrac:  0.58, yFrac:  0.00, z:  0,    rotation: [0,    0,  0.06], scale: 0.85, accent: '#8b3a20' },
  gallery:  { xFrac: -0.82, yFrac:  0.20, z: -1.2,  rotation: [0.05, 0, -0.10], scale: 0.65, accent: '#5c3d26' },
  officers: { xFrac:  0.60, yFrac:  0.00, z:  0,    rotation: [0,    0,  0.05], scale: 0.90, accent: '#7B2121' },
  join:     { xFrac: -0.58, yFrac:  0.00, z:  0,    rotation: [0,    0, -0.05], scale: 1.00, accent: '#4a3020' },
  epigraph: { xFrac:  0.00, yFrac: -0.05, z:  0,    rotation: [0,    0,  0   ], scale: 1.35, accent: '#2a1f1a' },
}

// Helper to build keyframes with less boilerplate.
const kf = (t: number, pose: Pose) => ({ t, pose })

export const TRANSITIONS: Record<TransitionId, TransitionTrack> = {
  // ─── Hero (right) → About (left) ────────────────────────────────────────
  // Signature circular arc: brush sweeps back-left into the distance, then
  // rockets forward HUGE crossing the screen, settles down on the left.
  'hero-to-about': {
    keyframes: [
      kf(0.00, REST_POSES.hero),
      kf(0.14, { xFrac:  0.50, yFrac:  0.20, z: -1.6, rotation: [ 0.35,  0.20, -0.45], scale: 0.95, accent: '#4a3023' }),
      kf(0.32, { xFrac:  0.10, yFrac:  0.35, z: -4.8, rotation: [ 0.70,  0.40, -0.90], scale: 0.70, accent: '#3e2a1f' }),
      kf(0.50, { xFrac: -0.30, yFrac:  0.25, z: -5.6, rotation: [ 0.90,  0.20, -1.20], scale: 0.65, accent: '#3e2a1f' }),
      kf(0.66, { xFrac: -0.55, yFrac: -0.05, z: -2.0, rotation: [ 0.45, -0.10, -1.00], scale: 0.95, accent: '#4a3023' }),
      kf(0.80, { xFrac: -0.45, yFrac: -0.10, z:  4.6, rotation: [-0.20, -0.10, -0.40], scale: 1.55, accent: '#5c3d26' }),
      kf(0.92, { xFrac: -0.58, yFrac:  0.00, z:  1.4, rotation: [-0.02,  0,    -0.15], scale: 1.10, accent: '#5c3d26' }),
      kf(1.00, REST_POSES.about),
    ],
  },

  // ─── About (left) → Events (right) ─────────────────────────────────────
  // Calligraphic stroke: brush lays nearly flat (tip-forward), dips below the
  // baseline as if writing across the page, then pops upright on the right.
  'about-to-events': {
    keyframes: [
      kf(0.00, REST_POSES.about),
      kf(0.15, { xFrac: -0.55, yFrac: -0.20, z:  0.6, rotation: [-0.55, 0,    -0.10], scale: 0.95, accent: '#6b3220' }),
      kf(0.30, { xFrac: -0.40, yFrac: -0.55, z:  1.6, rotation: [-1.25, 0,     0.10], scale: 1.05, accent: '#7a361d' }),
      kf(0.50, { xFrac:  0.00, yFrac: -0.65, z:  2.2, rotation: [-1.45, 0,     0.30], scale: 1.10, accent: '#8b3a20' }),
      kf(0.70, { xFrac:  0.40, yFrac: -0.55, z:  1.6, rotation: [-1.25, 0,     0.45], scale: 1.05, accent: '#8b3a20' }),
      kf(0.86, { xFrac:  0.55, yFrac: -0.15, z:  0.4, rotation: [-0.40, 0,     0.25], scale: 0.92, accent: '#8b3a20' }),
      kf(1.00, REST_POSES.events),
    ],
  },

  // ─── Events (right) → Gallery (small, top-left) ────────────────────────
  // Cartwheel: forward tumble (X-axis) carries the brush up and across in a
  // tall arc, shrinking as it lands in the top-left corner.
  'events-to-gallery': {
    keyframes: [
      kf(0.00, REST_POSES.events),
      kf(0.15, { xFrac:  0.50, yFrac:  0.20, z:  0.6, rotation: [ 0.80,  0.20,  0.10], scale: 0.95, accent: '#7a361d' }),
      kf(0.32, { xFrac:  0.30, yFrac:  0.55, z:  1.4, rotation: [ 1.80,  0.40,  0   ], scale: 1.05, accent: '#6e3520' }),
      kf(0.50, { xFrac:  0.00, yFrac:  0.65, z:  1.0, rotation: [ 2.60,  0.50, -0.10], scale: 0.95, accent: '#6a3a23' }),
      kf(0.68, { xFrac: -0.35, yFrac:  0.55, z:  0.0, rotation: [ 2.20,  0.40, -0.25], scale: 0.85, accent: '#5c3d26' }),
      kf(0.85, { xFrac: -0.65, yFrac:  0.35, z: -0.8, rotation: [ 1.10,  0.20, -0.20], scale: 0.72, accent: '#5c3d26' }),
      kf(1.00, REST_POSES.gallery),
    ],
  },

  // ─── Gallery (small, corner) → Officers (right) ────────────────────────
  // Reveal: brush drops below the frame, swings far back into distance, then
  // surges forward and right, expanding from tiny to full size.
  'gallery-to-officers': {
    keyframes: [
      kf(0.00, REST_POSES.gallery),
      kf(0.18, { xFrac: -0.70, yFrac: -0.30, z: -1.5, rotation: [ 0.30, 0,    -0.50], scale: 0.65, accent: '#6a3225' }),
      kf(0.35, { xFrac: -0.30, yFrac: -0.70, z: -3.5, rotation: [ 0.10, 0.30,-0.20], scale: 0.55, accent: '#6a3225' }),
      kf(0.55, { xFrac:  0.10, yFrac: -0.55, z: -1.0, rotation: [-0.25, 0.10, 0.05], scale: 0.95, accent: '#7B2121' }),
      kf(0.72, { xFrac:  0.20, yFrac: -0.15, z:  4.0, rotation: [-0.40, 0,    0   ], scale: 1.45, accent: '#7B2121' }),
      kf(0.88, { xFrac:  0.50, yFrac:  0.00, z:  1.0, rotation: [-0.10, 0,    0.08], scale: 1.10, accent: '#7B2121' }),
      kf(1.00, REST_POSES.officers),
    ],
  },

  // ─── Officers (right) → Join (left) ────────────────────────────────────
  // Toss: brush is thrown in a high arc with an end-over-end tumble, falling
  // down to land on the left like a pen set down across the page.
  'officers-to-join': {
    keyframes: [
      kf(0.00, REST_POSES.officers),
      kf(0.14, { xFrac:  0.55, yFrac:  0.40, z:  1.0, rotation: [ 0.80, 0,     0.50], scale: 0.95, accent: '#6a2820' }),
      kf(0.32, { xFrac:  0.30, yFrac:  0.75, z:  2.2, rotation: [ 1.80, 0,     0.30], scale: 1.00, accent: '#5a2820' }),
      kf(0.50, { xFrac:  0.00, yFrac:  0.80, z:  2.4, rotation: [ 2.60, 0,     0   ], scale: 0.95, accent: '#56281f' }),
      kf(0.68, { xFrac: -0.30, yFrac:  0.65, z:  1.8, rotation: [ 2.20, 0,    -0.30], scale: 0.92, accent: '#4f2a1f' }),
      kf(0.84, { xFrac: -0.50, yFrac:  0.20, z:  0.6, rotation: [ 0.80, 0,    -0.30], scale: 1.00, accent: '#4a3020' }),
      kf(1.00, REST_POSES.join),
    ],
  },

  // ─── Join (left) → Epigraph (center, huge, behind verse) ───────────────
  // Recede & return: brush pulls way back into the distance shrinking with a
  // partial tumble, then surges forward to fill the center stage.
  'join-to-epigraph': {
    keyframes: [
      kf(0.00, REST_POSES.join),
      kf(0.18, { xFrac: -0.45, yFrac:  0.25, z: -2.5, rotation: [ 0.30, 0.30,-0.20], scale: 0.85, accent: '#3e2820' }),
      kf(0.40, { xFrac: -0.10, yFrac:  0.40, z: -6.0, rotation: [ 0.80, 0.80, 0   ], scale: 0.55, accent: '#2f1e1a' }),
      kf(0.58, { xFrac:  0.20, yFrac:  0.20, z: -4.5, rotation: [ 0.40, 0.50, 0   ], scale: 0.75, accent: '#2f1e1a' }),
      kf(0.78, { xFrac:  0.00, yFrac:  0.05, z:  3.5, rotation: [-0.15, 0.10, 0   ], scale: 1.55, accent: '#2a1f1a' }),
      kf(0.92, { xFrac:  0.00, yFrac:  0.00, z:  0.8, rotation: [ 0,    0,    0   ], scale: 1.40, accent: '#2a1f1a' }),
      kf(1.00, REST_POSES.epigraph),
    ],
  },
}

// Adjacent-chapter pair → transition id, for StoryShell wiring.
export const TRANSITION_FOR: Record<string, TransitionId> = {
  'hero|about':       'hero-to-about',
  'about|events':     'about-to-events',
  'events|gallery':   'events-to-gallery',
  'gallery|officers': 'gallery-to-officers',
  'officers|join':    'officers-to-join',
  'join|epigraph':    'join-to-epigraph',
}

// inOutCubic — gentle easing applied to the global t of each transition before keyframe lookup.
export function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

// Pose-field linear interpolation. Rotation is lerped per-Euler-component;
// angles in REST/TRANSITIONS are small enough that this is visually indistinguishable from slerp.
export function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const lerp = (x: number, y: number) => x + (y - x) * t
  return {
    xFrac: lerp(a.xFrac, b.xFrac),
    yFrac: lerp(a.yFrac, b.yFrac),
    z:     lerp(a.z,     b.z),
    rotation: [
      lerp(a.rotation[0], b.rotation[0]),
      lerp(a.rotation[1], b.rotation[1]),
      lerp(a.rotation[2], b.rotation[2]),
    ],
    scale: lerp(a.scale, b.scale),
    accent: lerpColorHex(a.accent, b.accent, t),
  }
}

// Sample a track at normalized time t∈[0,1].
export function sampleTrack(track: TransitionTrack, t: number): Pose {
  const eased = easeInOutCubic(Math.min(1, Math.max(0, t)))
  const frames = track.keyframes
  if (eased <= frames[0].t) return frames[0].pose
  if (eased >= frames[frames.length - 1].t) return frames[frames.length - 1].pose
  for (let i = 0; i < frames.length - 1; i++) {
    const a = frames[i]
    const b = frames[i + 1]
    if (eased >= a.t && eased <= b.t) {
      const local = (eased - a.t) / Math.max(1e-6, b.t - a.t)
      return lerpPose(a.pose, b.pose, local)
    }
  }
  return frames[frames.length - 1].pose
}

function lerpColorHex(a: string, b: string, t: number): string {
  const pa = parseHex(a)
  const pb = parseHex(b)
  const r = Math.round(pa[0] + (pb[0] - pa[0]) * t)
  const g = Math.round(pa[1] + (pb[1] - pa[1]) * t)
  const bb = Math.round(pa[2] + (pb[2] - pa[2]) * t)
  return `#${toHex(r)}${toHex(g)}${toHex(bb)}`
}

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

function toHex(n: number): string {
  return Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0')
}
