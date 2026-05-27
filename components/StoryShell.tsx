'use client'

import { useEffect, useRef, useState } from 'react'
import InkScene, { type ScrollState } from '@/components/InkScene'
import {
  CHAPTER_IDS,
  type ChapterId,
  type TransitionId,
} from '@/lib/brushChoreography'

const chapterLabels: Record<ChapterId, string> = {
  hero: 'Invocation',
  about: 'Origins',
  events: 'Gatherings',
  gallery: 'Archive',
  officers: 'Board',
  join: 'Invitation',
  epigraph: 'Closing',
}

const themeForChapter: Record<ChapterId, 'tea' | 'ink'> = {
  hero: 'tea',
  about: 'ink',
  events: 'tea',
  gallery: 'ink',
  officers: 'tea',
  join: 'ink',
  epigraph: 'tea',
}

const chapterMarks: Record<ChapterId, { glyph: string; phrase: string }> = {
  hero:     { glyph: '墨', phrase: '一笔起势' },
  about:    { glyph: '文', phrase: '文化有根' },
  events:   { glyph: '礼', phrase: '相聚成礼' },
  gallery:  { glyph: '集', phrase: '记忆成卷' },
  officers: { glyph: '会', phrase: '众手成局' },
  join:     { glyph: '来', phrase: '来者入席' },
  epigraph: { glyph: '诗', phrase: '落笔成章' },
}

const HERO_ABOUT_HANDOFF_PROGRESS = 0.88

type RestSeg = { kind: 'rest'; chapter: ChapterId; el: HTMLElement; top: number; bottom: number }
type TransSeg = { kind: 'transition'; id: TransitionId; from: ChapterId; to: ChapterId; el: HTMLElement; top: number; bottom: number }
type Seg = RestSeg | TransSeg

export default function StoryShell({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLElement | null>(null)
  const scrollStateRef = useRef<ScrollState>({
    segment: { kind: 'rest', chapter: 'hero' },
    localProgress: 0,
    narrativeProgress: 0,
    theme: 'tea',
    segTop: 0,
    segBottom: 1,
  })
  const [activeChapter, setActiveChapter] = useState<ChapterId>('hero')
  const [narrativeProgress, setNarrativeProgress] = useState(0)

  useEffect(() => {
    document.documentElement.dataset.theme = themeForChapter[activeChapter]
    return () => {
      delete document.documentElement.dataset.theme
    }
  }, [activeChapter])

  useEffect(() => {
    let rafId: number | null = null
    let pendingMeasure = true
    let prevHeroAbout = false
    let segments: Seg[] = []
    const restByChapter = new Map<ChapterId, RestSeg>()

    const getLayoutTop = (el: HTMLElement): number => {
      let top = 0
      let node: HTMLElement | null = el
      while (node) {
        top += node.offsetTop
        node = node.offsetParent as HTMLElement | null
      }
      return top
    }

    const getSegmentTop = (el: HTMLElement): number => {
      const stage = el.closest<HTMLElement>('[data-ha-stage]')
      if (!stage || el.parentElement !== stage) return getLayoutTop(el)

      let top = getLayoutTop(stage)
      for (const child of Array.from(stage.children)) {
        if (!(child instanceof HTMLElement)) continue
        if (child === el) return top
        top += child.offsetHeight
      }
      return getLayoutTop(el)
    }

    const buildSegments = (): Seg[] => {
      const root = rootRef.current
      if (!root) return []
      const nodes = Array.from(
        root.querySelectorAll<HTMLElement>('[data-story-chapter], [data-story-transition]'),
      )
      const out: Seg[] = []
      restByChapter.clear()
      for (const el of nodes) {
        const chapter = el.dataset.storyChapter
        const transition = el.dataset.storyTransition
        const top = getSegmentTop(el)
        const bottom = top + el.offsetHeight
        if (chapter && chapter !== 'footer') {
          const seg: RestSeg = { kind: 'rest', chapter: chapter as ChapterId, el, top, bottom }
          out.push(seg)
          restByChapter.set(seg.chapter, seg)
        } else if (transition) {
          const from = el.dataset.from as ChapterId
          const to = el.dataset.to as ChapterId
          out.push({ kind: 'transition', id: transition as TransitionId, from, to, el, top, bottom })
        }
      }
      out.sort((a, b) => a.top - b.top)
      return out
    }

    const findSegment = (focusY: number): Seg => {
      for (let i = 0; i < segments.length; i++) {
        const s = segments[i]
        if (focusY < s.top) return segments[i === 0 ? 0 : i - 1]
        if (focusY >= s.top && focusY < s.bottom) return s
      }
      return segments[segments.length - 1]
    }

    const update = () => {
      rafId = null
      const docEl = document.documentElement
      const aboutIsFixed = prevHeroAbout && docEl.dataset.haActive != null
      if (pendingMeasure && !aboutIsFixed) {
        segments = buildSegments()
        pendingMeasure = false
        // Record About's in-flow height so its placeholder can hold its place while it is
        // position:fixed during the wipe (keeps page height stable, handoff jump-free).
        const aboutSeg = restByChapter.get('about')
        if (aboutSeg) {
          document.documentElement.style.setProperty(
            '--about-h',
            `${Math.round(aboutSeg.bottom - aboutSeg.top)}px`,
          )
        }
      }
      if (!segments.length) return

      const viewportHeight = window.innerHeight
      const focusY = window.scrollY + viewportHeight * 0.45
      const pageHeight = Math.max(document.documentElement.scrollHeight - viewportHeight, 1)
      const narrative = Math.min(1, Math.max(0, window.scrollY / pageHeight))

      const current = findSegment(focusY)
      const localProgress = Math.min(
        1,
        Math.max(0, (focusY - current.top) / Math.max(1, current.bottom - current.top)),
      )

      scrollStateRef.current.segment =
        current.kind === 'rest'
          ? { kind: 'rest', chapter: current.chapter }
          : { kind: 'transition', id: current.id }
      scrollStateRef.current.localProgress = localProgress
      scrollStateRef.current.narrativeProgress = narrative

      // Theme follows the chapter the active-marker is on (pivots at t=0.5 in transitions).
      const pivotChapter: ChapterId =
        current.kind === 'rest'
          ? current.chapter
          : localProgress < 0.5
            ? current.from
            : current.to
      scrollStateRef.current.theme = themeForChapter[pivotChapter]

      // Per-chapter fade: 1 = fully visible, 0 = invisible.
      // Default to 1; only the from/to chapters of the active transition get reduced fade.
      for (const s of segments) {
        if (s.kind === 'rest') s.el.style.setProperty('--fade', '1')
      }
      if (current.kind === 'transition') {
        const fromEl = restByChapter.get(current.from)?.el
        const toEl = restByChapter.get(current.to)?.el
        if (fromEl) fromEl.style.setProperty('--fade', (1 - localProgress).toFixed(3))
        if (toEl) toEl.style.setProperty('--fade', localProgress.toFixed(3))
      }

      // Hero→About wipe: publish progress (0 before, 1 after) + an active flag so the
      // CSS clip-path/counter-scroll and the scroll-linked ink wash can read them.
      // Expose the active segment's scroll span so InkScene can recompute the wipe
      // progress from the live scroll position each render frame (synced to paint), which
      // avoids the counter-scroll lag/jitter of a scroll-event-driven CSS variable.
      scrollStateRef.current.segTop = current.top
      scrollStateRef.current.segBottom = current.bottom

      const isHeroAbout = current.kind === 'transition' && current.id === 'hero-to-about'
      if (isHeroAbout) docEl.dataset.haActive = ''
      else delete docEl.dataset.haActive
      // Phase gates Hero's visibility: 'hero' = full, 'wipe' = clipped at the seam,
      // 'about' = hidden. Hero stays sticky-pinned through about-rest, so without this it
      // peeks above About (which sits ~45% down) while About scrolls up into place. The
      // final hero-to-about stretch hands off early so readability does not depend on the
      // Three.js frame loop publishing the final seam before the browser paints.
      const heroAboutHandedOff = isHeroAbout && localProgress >= HERO_ABOUT_HANDOFF_PROGRESS
      docEl.dataset.haPhase = isHeroAbout
        ? heroAboutHandedOff
          ? 'about'
          : 'wipe'
        : current.kind === 'rest' && current.chapter === 'hero'
          ? 'hero'
          : 'about'

      // The wipe applies a transform to the measured #about section. If a resize
      // re-measured it mid-wipe, the rect would be polluted; force a clean re-measure
      // once the wipe ends and #about is back at identity.
      if (prevHeroAbout && !isHeroAbout) pendingMeasure = true
      prevHeroAbout = isHeroAbout

      const nextActive: ChapterId =
        current.kind === 'rest'
          ? current.chapter
          : localProgress < 0.5
            ? current.from
            : current.to

      setActiveChapter((prev) => (prev === nextActive ? prev : nextActive))
      setNarrativeProgress((prev) =>
        Math.abs(prev - narrative) < 0.005 ? prev : narrative,
      )
    }

    const schedule = () => {
      if (rafId != null) return
      rafId = requestAnimationFrame(update)
    }

    const onScroll = () => schedule()
    const onResize = () => {
      pendingMeasure = true
      schedule()
    }

    // ResizeObserver picks up content-height changes (e.g., fonts loading) so chapter rects stay accurate.
    const ro = new ResizeObserver(() => {
      pendingMeasure = true
      schedule()
    })
    if (rootRef.current) ro.observe(rootRef.current)

    pendingMeasure = true
    schedule()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      if (rafId != null) cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      ro.disconnect()
    }
  }, [])

  return (
    <div className="story-shell" data-active-chapter={activeChapter}>
      <InkScene stateRef={scrollStateRef} />

      <div className="story-ideogram" aria-hidden="true">
        <span className="story-ideogram__glyph">{chapterMarks[activeChapter].glyph}</span>
        <span className="story-ideogram__phrase">{chapterMarks[activeChapter].phrase}</span>
      </div>

      <aside className="story-rail" aria-hidden="true">
        <div className="story-rail__line">
          <span className="story-rail__fill" style={{ transform: `scaleY(${narrativeProgress || 0.02})` }} />
        </div>
        <div className="story-rail__labels">
          {CHAPTER_IDS.map((id, index) => (
            <span
              className={`story-rail__label${activeChapter === id ? ' is-active' : ''}`}
              key={id}
            >
              {String(index + 1).padStart(2, '0')} {chapterLabels[id]}
            </span>
          ))}
        </div>
      </aside>

      <main className="story-content" ref={rootRef}>
        {children}
      </main>
    </div>
  )
}
