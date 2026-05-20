export default function Hero() {
  return (
    <section
      className="chapter chapter--hero"
      id="top"
      data-story-chapter="hero"
      data-screen-label="01 Invocation"
    >
      <div className="chapter__inner hero-layout">
        <div className="hero-copy">
          <p className="hero-kicker reveal d-0">
            <span>SANTA MONICA COLLEGE</span>
            <span className="hero-kicker__dot"></span>
            <span>SCROLL TO FOLLOW THE STROKE</span>
          </p>

          <h1 className="hero-title">
            <span className="reveal d-1">
              <span>Chinese</span>
            </span>
            <span className="reveal d-2">
              <span>
                <em>Culture</em> Club
              </span>
            </span>
            <span className="reveal d-3">
              <span>as a living ritual.</span>
            </span>
          </h1>

          <div className="hero-grid">
            <p className="hero-lede reveal d-4">
              A student society where tea, calligraphy, festivals, and friendship are staged as
              one continuous gesture. The page now follows that gesture from its first suspended
              mark to its final resting line.
            </p>

            <div className="hero-panel reveal d-5">
              <p className="hero-panel__eyebrow">The Symbol</p>
              <p className="hero-panel__cn">一 笔 贯 穿</p>
              <p className="hero-panel__body">
                One brushstroke crosses every chapter, changing shape as the story turns from
                invitation to archive to assembly.
              </p>
            </div>
          </div>
        </div>

        <div className="hero-stats reveal d-5">
          <div>
            <span className="stat-value">240+</span>
            <span className="stat-label">members in orbit</span>
          </div>
          <div>
            <span className="stat-value">14</span>
            <span className="stat-label">gatherings a year</span>
          </div>
          <div>
            <span className="stat-value">2025</span>
            <span className="stat-label">club founded</span>
          </div>
        </div>
      </div>
    </section>
  )
}
