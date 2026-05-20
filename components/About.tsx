export default function About() {
  return (
    <section id="about" data-screen-label="02 About">
      <div className="wrap">
        <header className="section-head in">
          <p className="section-head__no"><span className="dot"></span>I &nbsp;/&nbsp; About the Club</p>
          <h2 className="section-head__title">
            <span className="it">An</span> unhurried home <br />for <span className="it">heritage.</span>
            <span className="cn">关 于 我 们</span>
          </h2>
        </header>

        <div className="about-grid">
          <div className="about__body in">
            <p className="about__lead">The Chinese Culture Club is a place where students of every background gather to taste, to make, to ask, and to share what their families once knew — or what they have always wanted to know.</p>
            <p>Founded by Songyi Yu in 2025, the club has grown into a small constellation of meetings, festivals, and quiet evenings of practice. We teach calligraphy without prerequisites, host Lunar New Year in a borrowed kitchen, and on Mid-Autumn nights pass around mooncakes cut into eighths so everyone has a piece.</p>
            <p>No fluency, no prior knowledge, no Chinese surname required. Only curiosity, and a willingness to listen.</p>

            <div className="about__pull">
              <div className="pull__cell"><span className="v">2025</span>Established</div>
              <div className="pull__cell"><span className="v">HSS 151</span>Where we meet</div>
              <div className="pull__cell"><span className="v">Thu 11:15AM</span>Weekly hour</div>
            </div>
          </div>

          <aside className="about__scroll in" aria-hidden="true">
            <div className="about__scroll-row">
              <span className="cn-vert">
                一 盏 茶 ， <span className="accent">一</span> 段 话 ，<br />
                一 个 学 期 的 朋 友 。
              </span>
              <span className="seal-lg">会</span>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
