export default function Epigraph() {
  return (
    <aside className="epigraph in" aria-label="Closing verse">
      <span className="epigraph__rule" aria-hidden="true"></span>
      <p className="epigraph__verse">
        <span className="lb">笔 落 惊 风 雨，</span>
        <span className="lb"><span className="accent">诗</span> 成 泣 鬼 神。</span>
      </p>
      <p className="epigraph__source">— Du Fu, on the weight of a brush</p>
    </aside>
  )
}
