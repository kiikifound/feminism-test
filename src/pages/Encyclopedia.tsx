import encyclopedia from '../data/encyclopedia.json'

export default function Encyclopedia() {
  return (
    <div className="container">
      <div className="card">
        <h1 className="h1">派别百科（9 类）</h1>
        <p className="p small">条目结构：核心关注 / 关键立场 / 常见误解 / 与相邻派别分歧。</p>
        <hr className="sep" />
        {(encyclopedia as any[]).map(e => (
          <div key={e.key} style={{marginBottom:14}}>
            <h2 className="h2" style={{marginBottom:6}}>{e.name}</h2>
            <p className="p"><strong>核心关注：</strong>{e.core.join('；')}</p>
            <p className="p"><strong>关键立场：</strong>{e.positions.join('；')}</p>
            <p className="p"><strong>常见误解：</strong>{e.misconceptions.join('；')}</p>
            <p className="p"><strong>与相邻派别分歧：</strong>{e.differences.join('；')}</p>
            <hr className="sep" />
          </div>
        ))}
      </div>
    </div>
  )
}
