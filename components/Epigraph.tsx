export default function Epigraph() {
  return (
    <aside
      className="epigraph in"
      data-story-chapter="epigraph"
      data-rest-side="center"
      data-screen-label="07 Closing"
      aria-label="Closing verse"
    >
      <div className="chapter-content epigraph__content">
        <p className="epigraph__verse" aria-label="笔落惊风雨，诗成泣鬼神。">
          <span className="epigraph__line epigraph__line--left">笔 落 惊 风 雨 ，</span>
          <span className="epigraph__line epigraph__line--right"><span className="accent">诗</span> 成 泣 鬼 神 。</span>
        </p>
        <div className="epigraph__credit">
          <span className="epigraph__rule" aria-hidden="true"></span>
          <p className="epigraph__source">&mdash; Du Fu, on the weight of a brush</p>
        </div>
      </div>
    </aside>
  )
}
