const events = [
  {
    day: '28',
    month: 'September',
    title: 'Mid-Autumn Mooncake Night',
    cn: '中 秋 赏 月',
    where: 'The Quad, under the southern oaks. Tea, lanterns, and mooncake for everyone.',
    when: '7:30 — 10:00 PM',
  },
  {
    day: '12',
    month: 'October',
    title: 'Calligraphy at Dusk',
    cn: '书 法 工 作 坊',
    where: 'HSS 151, with brushes provided. A guided introduction to 楷书.',
    when: '6:00 — 8:00 PM',
  },
  {
    day: '02',
    month: 'November',
    title: 'A Long Table for Hot Pot',
    cn: '火 锅 夜',
    where: 'Century City. Bring an empty bowl, we will bring the broth.',
    when: '5:30 — 9:00 PM',
  },
  {
    day: '21',
    month: 'November',
    title: 'Tea Ceremony and Quiet Hour',
    cn: '茶 道 雅 集',
    where: 'The Library. Milk oolong, white peony, and an hour of quiet.',
    when: '4:00 — 6:00 PM',
  },
]

export default function Events() {
  return (
    <section
      className="chapter chapter--events"
      id="events"
      data-story-chapter="events"
      data-screen-label="03 Gatherings"
    >
      <div className="chapter__inner">
        <header className="chapter-head in">
          <p className="chapter-head__index">II / Gatherings</p>
          <div>
            <h2 className="chapter-head__title">
              The season
              <br />
              ahead.
            </h2>
            <p className="chapter-head__cn">即 将 举 行</p>
          </div>
        </header>

        <div className="events-feature glass-panel in">
          <div className="events-feature__art" aria-hidden="true">
            <span className="events-feature__seal">春</span>
            <span className="events-feature__ghost">春节</span>
          </div>
          <div className="events-feature__body">
            <p className="events-feature__tag">Headline ritual</p>
            <h3 className="events-feature__title">
              Lunar New Year
              <br />
              Gala &amp; Banquet
            </h3>
            <p className="events-feature__copy">
              An evening of dumplings folded by hand, lion dance visitors, calligraphic couplets to
              take home, and a long table where two hundred people sit shoulder to shoulder.
            </p>
            <div className="events-feature__meta">
              <span>Sat · 14 Feb</span>
              <span>6 — 10 PM</span>
              <span>SMC Cafeteria</span>
            </div>
          </div>
        </div>

        <div className="event-rail in">
          {events.map((event) => (
            <a className="event-card" href="#join" key={event.title}>
              <div className="event-card__date">
                <span className="event-card__day">{event.day}</span>
                <span className="event-card__month">{event.month}</span>
              </div>
              <div>
                <h4 className="event-card__title">{event.title}</h4>
                <p className="event-card__cn">{event.cn}</p>
              </div>
              <p className="event-card__meta">{event.where}</p>
              <p className="event-card__time">{event.when}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
