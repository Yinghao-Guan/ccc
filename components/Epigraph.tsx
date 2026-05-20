export default function Epigraph() {
  return (
    <aside
      className="epigraph in"
      data-story-chapter="epigraph"
      data-rest-side="center"
      data-screen-label="07 Closing"
      aria-label="Closing verse"
    >
      <div className="chapter-content">
        <span className="epigraph__rule" aria-hidden="true"></span>
        <p className="epigraph__verse">
          <span className="lb">笔 落 惊 风 雨 ，</span>
          <span className="lb"><span className="accent">诗</span> 成 泣 鬼 神 。</span>
        </p>
        <p className="epigraph__source">&mdash; Du Fu, on the weight of a brush</p>
      </div>
    </aside>
  )
}
