const archive = [
  ['Lunar New Year, MMXXV', 'Feb 2025', '饺'],
  ['Brushwork at HSS 151', 'Oct 2024', '墨'],
  ['The Long Table', 'Nov 2024', '锅'],
  ['Mid-Autumn Night', 'Sep 2024', '月'],
  ['Gala and Banquet', 'Feb 2024', '春'],
  ['Spring Couplets', 'Jan 2024', '福'],
]

export default function Gallery() {
  return (
    <section
      className="chapter chapter--gallery"
      id="gallery"
      data-story-chapter="gallery"
      data-screen-label="04 Archive"
    >
      <div className="chapter__inner">
        <header className="chapter-head in">
          <p className="chapter-head__index">III / Archive</p>
          <div>
            <h2 className="chapter-head__title">
              A small archive
              <br />
              of shared nights.
            </h2>
            <p className="chapter-head__cn">过 往 记 事</p>
          </div>
        </header>

        <div className="archive-grid in">
          {archive.map(([title, date, mark], index) => (
            <figure className={`archive-tile archive-tile--${index + 1}`} key={title}>
              <div className="archive-tile__image" aria-hidden="true">
                <span className="archive-tile__mark">{mark}</span>
              </div>
              <figcaption className="archive-tile__caption">
                <span>{title}</span>
                <span>{date}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
