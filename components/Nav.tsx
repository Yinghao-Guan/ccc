'use client'

import { useEffect } from 'react'

export default function Nav() {
  useEffect(() => {
    const nav = document.getElementById('nav')
    const onScroll = () => {
      if (window.scrollY > 12) nav?.classList.add('scrolled')
      else nav?.classList.remove('scrolled')
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const navLinks = document.querySelectorAll('.nav__links a')
    const sections = ['about', 'events', 'gallery', 'officers'].map((id) =>
      document.getElementById(id)
    )
    const navIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = (e.target as HTMLElement).id
            navLinks.forEach((a) =>
              a.classList.toggle('is-active', a.getAttribute('href') === '#' + id)
            )
          }
        })
      },
      { threshold: 0.3 }
    )
    sections.forEach((s) => s && navIO.observe(s))
    return () => navIO.disconnect()
  }, [])

  return (
    <header className="nav" id="nav">
      <a href="#top" className="nav__brand" aria-label="Chinese Culture Club at Santa Monica College">
        <span className="seal" aria-hidden="true">中</span>
        <span className="nav__wordmark">
          <span className="en">Chinese Culture Club</span>
          <span className="meta">SANTA MONICA COLLEGE · EST. 2025</span>
        </span>
      </a>
      <nav className="nav__links" aria-label="Primary">
        <a href="#about">About</a>
        <a href="#events">Events</a>
        <a href="#gallery">Gallery</a>
        <a href="#officers">Officers</a>
      </nav>
      <a className="nav__cta" href="#join">Join us</a>
    </header>
  )
}
