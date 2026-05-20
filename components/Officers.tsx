const officers = [
  { role: 'President',      name: 'Lei Li',     pron: 'Third-year, Comparative Literature.',  cn: '李雷',  seal: '会长' },
  { role: 'Vice President', name: 'Meimei Han', pron: 'Second-year, Economics & History.',    cn: '韩梅梅', seal: '副会长' },
  { role: 'Secretary',      name: 'San Zhang',  pron: 'Third-year, Graphic Design.',          cn: '张三',  seal: '秘书' },
  { role: 'Treasurer',      name: 'Si Li',      pron: 'Second-year, Accounting.',             cn: '李四',  seal: '财务' },
  { role: 'Events Chair',   name: 'Wu Wang',    pron: 'Third-year, Hospitality.',             cn: '王五',  seal: '活动' },
  { role: 'Cultural Chair', name: 'Liu Zhao',   pron: 'Fourth-year, East Asian Studies.',     cn: '赵六',  seal: '文化' },
]

export default function Officers() {
  return (
    <section id="officers" data-screen-label="05 Officers">
      <div className="wrap">
        <header className="section-head in">
          <p className="section-head__no"><span className="dot"></span>IV &nbsp;/&nbsp; The People Who Make It Run</p>
          <h2 className="section-head__title">
            The <span className="it">2026</span> board.
            <span className="cn">本 届 干 部</span>
          </h2>
        </header>

        <div className="officers in">
          {officers.map((o) => (
            <article className="officer" key={o.name}>
              <div className="officer__photo">
                <span className="stripes"></span>
                <span className="ph-tag">portrait</span>
                <span className="corner-cn">{o.seal}</span>
              </div>
              <div className="officer__body">
                <div>
                  <p className="officer__role">{o.role}</p>
                  <h3 className="officer__name">{o.name}</h3>
                  <p className="officer__pron">{o.pron}</p>
                </div>
                <div className="officer__cn">{o.cn}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
