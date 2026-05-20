export default function Join() {
  return (
    <section
      className="chapter chapter--join"
      id="join"
      data-story-chapter="join"
      data-screen-label="06 Invitation"
    >
      <div className="chapter__inner join-stage">
        <div className="join-copy in">
          <p className="join-copy__eyebrow">Invitation</p>
          <h2>
            Sit down
            <br />
            <em>for a while.</em>
          </h2>
          <p className="join-copy__cn">我 们 在 等 你</p>
          <p>
            Membership is open all semester to any SMC student, faculty member, or visitor with a
            kind manner. There are no dues. Bring nothing but yourself or, if you wish, a tea you
            would like to share.
          </p>
          <a className="join-button" href="mailto:chineseculture.smc@gmail.com">
            Become a member
          </a>
        </div>

        <dl className="glass-panel join-facts in">
          <dt>Where to find us</dt>
          <dd>
            Humanities &amp; Social Science · Room 151
            <span>1900 Pico Boulevard, Santa Monica, CA</span>
          </dd>
          <dt>When we meet</dt>
          <dd>
            Thursdays · 11:15 AM — 12:30 PM
            <span>Open-door, all semester long</span>
          </dd>
          <dt>Faculty advisor</dt>
          <dd>
            Li Lei &amp; Han Meimei
            <span>Department of Modern Languages</span>
          </dd>
        </dl>
      </div>
    </section>
  )
}
