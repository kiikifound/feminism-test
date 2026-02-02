import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="container">
      <div className="card">
        <h1 className="h1">女性主义派别测试（静态站示例）</h1>
        <p className="p">题量：38 题。输出：核心派别、派别分布图、6维变量得分、解释与相邻派别差异、派别百科。</p>
        <p className="p small">说明：这是一个立场向量匹配器。结果用于描述相对接近的理论取向，不用于评价。</p>
        <div style={{display:'flex', gap:10, marginTop:14}}>
          <Link to="/test" className="btn primary" style={{textDecoration:'none'}}>开始测试</Link>
          <Link to="/encyclopedia" className="btn" style={{textDecoration:'none'}}>查看派别百科</Link>
          <Link to="/method" className="btn" style={{textDecoration:'none'}}>查看方法</Link>
        </div>
      </div>
    </div>
  )
}
