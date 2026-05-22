'use client'

import { useEffect } from 'react'

const sectionIds = ['about', 'events', 'gallery', 'officers', 'join']

export default function Nav() {
  useEffect(() => {
    const nav = document.getElementById('nav')
    const onScroll = () => {
      if (window.scrollY > 20) nav?.classList.add('scrolled')
      else nav?.classList.remove('scrolled')
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.nav__links a'))
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section))

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const id = entry.target.id
          links.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`))
        })
      },
      { threshold: 0.45 }
    )

    sections.forEach((section) => io.observe(section))
    return () => io.disconnect()
  }, [])

  // Slow, custom anchor scrolling — long enough for the scroll-driven brush
  // choreography to play through. Reduced motion falls back to the default
  // (instant) jump rather than fighting the user's preference.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let rafId: number | null = null
    let cleanupInterrupts: (() => void) | null = null

    const cancel = () => {
      if (rafId != null) cancelAnimationFrame(rafId)
      rafId = null
      if (cleanupInterrupts) cleanupInterrupts()
      cleanupInterrupts = null
      document.documentElement.style.scrollBehavior = ''
    }

    const ease = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

    const scrollTo = (targetY: number) => {
      cancel()
      const startY = window.scrollY
      const distance = targetY - startY
      if (Math.abs(distance) < 1) return
      // ~1.5ms per pixel travelled, clamped to a sensible window. A jump from
      // Hero (top) to About is ~2 viewports, landing around 2.2–2.6s.
      const duration = Math.min(4500, Math.max(1800, Math.abs(distance) * 1.5))
      const startTime = performance.now()

      document.documentElement.style.scrollBehavior = 'auto'

      const onInterrupt = () => cancel()
      window.addEventListener('wheel', onInterrupt, { passive: true })
      window.addEventListener('touchstart', onInterrupt, { passive: true })
      window.addEventListener('keydown', onInterrupt)
      cleanupInterrupts = () => {
        window.removeEventListener('wheel', onInterrupt)
        window.removeEventListener('touchstart', onInterrupt)
        window.removeEventListener('keydown', onInterrupt)
      }

      const step = (now: number) => {
        const elapsed = now - startTime
        const t = Math.min(1, elapsed / duration)
        window.scrollTo(0, startY + distance * ease(t))
        if (t < 1) {
          rafId = requestAnimationFrame(step)
        } else {
          cancel()
        }
      }
      rafId = requestAnimationFrame(step)
    }

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const target = e.target as HTMLElement | null
      const anchor = target?.closest<HTMLAnchorElement>('a[href^="#"]')
      if (!anchor || !anchor.closest('.nav')) return
      const href = anchor.getAttribute('href')
      if (!href || href === '#') return
      const id = href.slice(1)
      const targetY = id === 'top'
        ? 0
        : (() => {
            const el = document.getElementById(id)
            return el ? el.getBoundingClientRect().top + window.scrollY : null
          })()
      if (targetY == null) return
      e.preventDefault()
      scrollTo(targetY)
    }

    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('click', onClick)
      cancel()
    }
  }, [])

  return (
    <header className="nav" id="nav">
      <a href="#top" className="nav__brand" aria-label="Chinese Culture Club at Santa Monica College">
        <span className="seal" aria-hidden="true">
          中
        </span>
        <span className="nav__wordmark">
          <span className="en">Chinese Culture Club</span>
          <span className="meta">SANTA MONICA COLLEGE · EST. 2025</span>
        </span>
      </a>

      <nav className="nav__links" aria-label="Primary">
        <a href="#about">About</a>
        <a href="#events">Events</a>
        <a href="#gallery">Archive</a>
        <a href="#officers">Board</a>
      </nav>

      <a className="nav__cta" href="#join">Join us</a>
    </header>
  )
}
