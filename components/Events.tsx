export default function Events() {
  return (
    <section id="events" data-story-chapter="events" data-screen-label="03 Events">
      <div className="wrap">
        <header className="section-head in">
          <p className="section-head__no"><span className="dot"></span>II &nbsp;/&nbsp; Upcoming Gatherings</p>
          <h2 className="section-head__title">
            The <span className="it">season</span> ahead.
            <span className="cn">即 将 举 行</span>
          </h2>
        </header>

        <article className="events-feature in">
          <div className="events-feature__img">
            <span className="stripes" aria-hidden="true"></span>
            <span className="placeholder-label">photograph · lantern courtyard</span>
            <span className="seal-stamp" aria-hidden="true">春</span>
            <span className="corner-cn" aria-hidden="true">春节</span>
          </div>
          <div className="events-feature__body">
            <p className="events-feature__tag">Headline event &nbsp;·&nbsp; February</p>
            <h3 className="events-feature__title">
              <span className="it">Lunar New Year</span><br />
              Gala &amp; Banquet.
            </h3>
            <p className="events-feature__cn">农 历 新 年 · 春 节 晚 会</p>
            <p className="events-feature__copy">
              An evening of dumplings folded by hand, lion dance from our friends at the Wushu
              Society, calligraphic couplets you take home, and a long table where two hundred
              people sit shoulder to shoulder.
            </p>
            <div className="events-feature__meta">
              <div><span className="v">Sat · 14 Feb</span>6 — 10 PM</div>
              <div><span className="v">Cafeteria</span>SMC Campus</div>
              <div><span className="v">Free · RSVP</span>Members + guests</div>
            </div>
            <a className="btn-ghost" href="#join">
              Reserve a seat <span className="arrow"></span>
            </a>
          </div>
        </article>

        <div className="events-list in">
          <a className="event" href="#join">
            <div className="event__date"><span className="day">28</span><span className="mon">September</span></div>
            <div>
              <h4 className="event__title"><em>Mid-Autumn</em> Mooncake Night</h4>
              <span className="event__title-cn">中 秋 赏 月</span>
            </div>
            <div className="event__meta">
              <span className="label">Where</span>
              The Quad &mdash; under the southern oaks. Tea, lanterns, and slices of mooncake cut for everyone.
            </div>
            <div className="event__meta">
              <span className="label">When</span>7:30 — 10:00 PM
            </div>
            <span className="event__cta">↗</span>
          </a>

          <a className="event" href="#join">
            <div className="event__date"><span className="day">12</span><span className="mon">October</span></div>
            <div>
              <h4 className="event__title">Calligraphy <em>at Dusk</em></h4>
              <span className="event__title-cn">书 法 工 作 坊</span>
            </div>
            <div className="event__meta">
              <span className="label">Where</span>
              HSS 151, with brushes provided. A guided introduction to 楷书 with Prof. L. Li.
            </div>
            <div className="event__meta">
              <span className="label">When</span>6:00 — 8:00 PM
            </div>
            <span className="event__cta">↗</span>
          </a>

          <a className="event" href="#join">
            <div className="event__date"><span className="day">02</span><span className="mon">November</span></div>
            <div>
              <h4 className="event__title">A Long Table for <em>Hot Pot</em></h4>
              <span className="event__title-cn">火 锅 夜</span>
            </div>
            <div className="event__meta">
              <span className="label">Where</span>
              Westfield Century City · Haidilao. Bring an empty bowl — we&apos;ll bring the broth.
            </div>
            <div className="event__meta">
              <span className="label">When</span>5:30 — 9:00 PM
            </div>
            <span className="event__cta">↗</span>
          </a>

          <a className="event" href="#join">
            <div className="event__date"><span className="day">21</span><span className="mon">November</span></div>
            <div>
              <h4 className="event__title">Tea <em>Ceremony</em> &amp; Quiet Hour</h4>
              <span className="event__title-cn">茶 道 雅 集</span>
            </div>
            <div className="event__meta">
              <span className="label">Where</span>
              The Library, lower ground floor. Milk oolong, white peony, and a single bowl of silence.
            </div>
            <div className="event__meta">
              <span className="label">When</span>4:00 — 6:00 PM
            </div>
            <span className="event__cta">↗</span>
          </a>

          <a className="event" href="#join">
            <div className="event__date"><span className="day">06</span><span className="mon">December</span></div>
            <div>
              <h4 className="event__title">Winter <em>Film Screening</em> &mdash; <em>In the Mood for Love</em></h4>
              <span className="event__title-cn">电 影 之 夜</span>
            </div>
            <div className="event__meta">
              <span className="label">Where</span>Theatre Arts 110. Subtitled, with a short conversation afterward.
            </div>
            <div className="event__meta">
              <span className="label">When</span>7:00 — 9:30 PM
            </div>
            <span className="event__cta">↗</span>
          </a>
        </div>
      </div>
    </section>
  )
}
