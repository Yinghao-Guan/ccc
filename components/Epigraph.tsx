export default function Epigraph() {
  return (
    <aside
      className="chapter chapter--epigraph"
      data-story-chapter="epigraph"
      data-screen-label="07 Closing"
      aria-label="Closing verse"
    >
      <div className="chapter__inner epigraph-stage in">
        <p className="epigraph-stage__mark">终</p>
        <p className="epigraph-stage__verse">
          <span>笔 落 惊 风 雨 ，</span>
          <span>诗 成 泣 鬼 神 。</span>
        </p>
        <p className="epigraph-stage__source">Du Fu, on the weight of a brush</p>
      </div>
    </aside>
  )
}
