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
