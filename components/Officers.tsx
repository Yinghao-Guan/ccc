const officers = [
  { role: 'President', name: 'Lei Li', bio: 'Comparative Literature, third year.', cn: '李雷' },
  { role: 'Vice President', name: 'Meimei Han', bio: 'Economics and History, second year.', cn: '韩梅梅' },
  { role: 'Secretary', name: 'San Zhang', bio: 'Graphic Design, third year.', cn: '张三' },
  { role: 'Treasurer', name: 'Si Li', bio: 'Accounting, second year.', cn: '李四' },
  { role: 'Events Chair', name: 'Wu Wang', bio: 'Hospitality, third year.', cn: '王五' },
  { role: 'Cultural Chair', name: 'Liu Zhao', bio: 'East Asian Studies, fourth year.', cn: '赵六' },
]

export default function Officers() {
  return (
    <section
      className="chapter chapter--officers"
      id="officers"
      data-story-chapter="officers"
      data-screen-label="05 Board"
    >
      <div className="chapter__inner">
        <header className="chapter-head in">
          <p className="chapter-head__index">IV / Board</p>
          <div>
            <h2 className="chapter-head__title">
              The people who
              <br />
              keep it moving.
            </h2>
            <p className="chapter-head__cn">本 届 干 部</p>
          </div>
        </header>

        <div className="officer-grid in">
          {officers.map((officer) => (
            <article className="officer-card" key={officer.name}>
              <div className="officer-card__portrait" aria-hidden="true">
                <span className="officer-card__mark">{officer.cn}</span>
              </div>
              <div className="officer-card__body">
                <p className="officer-card__role">{officer.role}</p>
                <h3>{officer.name}</h3>
                <p className="officer-card__bio">{officer.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
