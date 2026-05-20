'use client'

import { useEffect, useRef, useState } from 'react'
import InkScene from '@/components/InkScene'

const chapterLabels = [
  ['hero', 'Invocation'],
  ['about', 'Origins'],
  ['events', 'Gatherings'],
  ['gallery', 'Archive'],
  ['officers', 'Board'],
  ['join', 'Invitation'],
  ['epigraph', 'Closing'],
] as const

type ChapterId = (typeof chapterLabels)[number][0]

const chapterMarks: Record<ChapterId, { glyph: string; phrase: string }> = {
  hero: { glyph: '墨', phrase: '一笔起势' },
  about: { glyph: '文', phrase: '文化有根' },
  events: { glyph: '礼', phrase: '相聚成礼' },
  gallery: { glyph: '集', phrase: '记忆成卷' },
  officers: { glyph: '会', phrase: '众手成局' },
  join: { glyph: '来', phrase: '来者入席' },
  epigraph: { glyph: '诗', phrase: '落笔成章' },
}

export default function StoryShell({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLElement | null>(null)
  const [activeChapter, setActiveChapter] = useState<ChapterId>('hero')
  const [chapterProgress, setChapterProgress] = useState(0)
  const [overallProgress, setOverallProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const root = rootRef.current
      if (!root) return

      const chapters = Array.from(root.querySelectorAll<HTMLElement>('[data-story-chapter]')).filter(
        (node) => node.dataset.storyChapter !== 'footer'
      )

      if (!chapters.length) return

      const viewportHeight = window.innerHeight
      const focusLine = viewportHeight * 0.45

      let closest = chapters[0]
      let closestDistance = Number.POSITIVE_INFINITY

      chapters.forEach((chapter) => {
        const rect = chapter.getBoundingClientRect()
        const center = rect.top + rect.height * 0.5
        const distance = Math.abs(center - focusLine)
        if (distance < closestDistance) {
          closestDistance = distance
          closest = chapter
        }
      })

      const rect = closest.getBoundingClientRect()
      const rawProgress = (focusLine - rect.top) / Math.max(rect.height, 1)
      const boundedProgress = Math.min(1, Math.max(0, rawProgress))
      const pageProgress =
        window.scrollY / Math.max(document.documentElement.scrollHeight - viewportHeight, 1)

      setActiveChapter((closest.dataset.storyChapter as ChapterId) ?? 'hero')
      setChapterProgress(boundedProgress)
      setOverallProgress(Math.min(1, Math.max(0, pageProgress)))
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div className="story-shell" data-active-chapter={activeChapter}>
      <InkScene
        activeChapter={activeChapter}
        chapterProgress={chapterProgress}
        overallProgress={overallProgress}
      />

      <div className="story-ideogram" aria-hidden="true">
        <span className="story-ideogram__glyph">{chapterMarks[activeChapter].glyph}</span>
        <span className="story-ideogram__phrase">{chapterMarks[activeChapter].phrase}</span>
      </div>

      <aside className="story-rail" aria-hidden="true">
        <div className="story-rail__line">
          <span className="story-rail__fill" style={{ transform: `scaleY(${overallProgress || 0.02})` }} />
        </div>
        <div className="story-rail__labels">
          {chapterLabels.map(([id, label], index) => (
            <span
              className={`story-rail__label${activeChapter === id ? ' is-active' : ''}`}
              key={id}
            >
              {String(index + 1).padStart(2, '0')} {label}
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
