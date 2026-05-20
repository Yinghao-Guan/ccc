export default function About() {
  return (
    <section
      className="chapter chapter--about"
      id="about"
      data-story-chapter="about"
      data-screen-label="02 Origins"
    >
      <div className="chapter__inner">
        <header className="chapter-head in">
          <p className="chapter-head__index">I / Origins</p>
          <div>
            <h2 className="chapter-head__title">
              An unhurried home
              <br />
              for <em>heritage.</em>
            </h2>
            <p className="chapter-head__cn">关 于 我 们</p>
          </div>
        </header>

        <div className="about-stage">
          <article className="glass-panel prose-panel in">
            <p className="prose-panel__lead">
              The Chinese Culture Club is a place where students of every background gather to
              taste, to make, to ask, and to share what their families once knew or what they have
              always wanted to know.
            </p>
            <p>
              Founded by Songyi Yu in 2025, the club has grown into a small constellation of
              meetings, festivals, and quiet evenings of practice. We teach calligraphy without
              prerequisites, host Lunar New Year in a borrowed kitchen, and on Mid-Autumn nights
              pass around mooncakes cut into eighths so everyone has a piece.
            </p>
            <p>
              No fluency, no prior knowledge, no Chinese surname required. Only curiosity, and a
              willingness to listen.
            </p>
          </article>

          <aside className="glass-panel ritual-card in" aria-hidden="true">
            <p className="ritual-card__label">Current cadence</p>
            <div className="ritual-card__stack">
              <div>
                <span className="ritual-card__value">Thu 11:15</span>
                <span className="ritual-card__meta">weekly hour</span>
              </div>
              <div>
                <span className="ritual-card__value">HSS 151</span>
                <span className="ritual-card__meta">where the stroke pauses</span>
              </div>
              <div>
                <span className="ritual-card__value">Open</span>
                <span className="ritual-card__meta">all backgrounds welcome</span>
              </div>
            </div>
            <p className="ritual-card__vertical">一 盏 茶 ， 一 段 话 ， 一 个 学 期 的 朋 友 。</p>
          </aside>
        </div>
      </div>
    </section>
  )
}
