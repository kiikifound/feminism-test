import { Link } from 'react-router-dom'
import { computeTypeScores, DIM_NAMES, dimLabel, nearestTypes, topDimsByCloseness, type TypeScore } from '../lib/scoring'
import idealsData from '../data/ideals.json'
import encyclopedia from '../data/encyclopedia.json'
import RadarChart from '../components/RadarChart'
import Top5Bar from '../components/Top5Bar'

type AnswerMap = Record<number, number>

function loadAnswers(): AnswerMap {
  try {
    const raw = localStorage.getItem('answers')
    if (!raw) return {}
    return JSON.parse(raw)
  } catch { return {} }
}

function getIdeal(key: string) {
  const t = (idealsData as any).types.find((x:any)=>x.key===key)
  return t ? t.ideal as number[] : [50,50,50,50,50,50]
}

function getTypeName(key: string) {
  const t = (idealsData as any).types.find((x:any)=>x.key===key)
  return t ? t.name as string : key
}

function getEntry(key: string) {
  return (encyclopedia as any[]).find(x => x.key === key)
}

function diffDimsText(userVec: number[], idealVec: number[], dims: number[]) {
  return dims.map(i => `【${DIM_NAMES[i]}】你的得分 ${Math.round(userVec[i])}，该派别典型值 ${idealVec[i]}`).join('；')
}

export default function Result() {
  const answers = loadAnswers()
  const answered = Object.keys(answers).length
  if (answered < 38) {
    return (
      <div className="container">
        <div className="card">
          <h1 className="h1">结果不可用</h1>
          <p className="p">需要完成全部 38 题后才能生成结果。</p>
          <Link to="/test" className="btn primary" style={{textDecoration:'none'}}>回到测试</Link>
        </div>
      </div>
    )
  }

  const { userVec, results, main, second, top5, consistency } = computeTypeScores(answers)

  const mainIdeal = getIdeal(main.key)
  const secondIdeal = second ? getIdeal(second.key) : undefined

  const fitDims = topDimsByCloseness(userVec, mainIdeal, 3, false)
  const tensionDims = topDimsByCloseness(userVec, mainIdeal, 2, true)

  const neighbors = nearestTypes(results, [main.key, second?.key ?? ''], 2)

  return (
    <div className="container">
      <div className="card">
        <h1 className="h1" style={{marginBottom:6}}>你的核心派别：{main.name}{second ? ` + ${second.name}` : ''}</h1>
        <p className="small">主派别相似度：{Math.round(main.sim)}{second ? `；次派别相似度：${Math.round(second.sim)}` : ''}</p>

        <div className="row" style={{marginTop:14}}>
          <div className="card" style={{padding:12}}>
            <h2 className="h2">派别分布（Top 5）</h2>
            <Top5Bar top5={top5} />
          </div>
          <div className="card" style={{padding:12}}>
            <h2 className="h2">6维立场图谱</h2>
            <RadarChart
              userVec={userVec}
              main={{ name: main.name, ideal: mainIdeal }}
              second={second ? { name: second.name, ideal: secondIdeal! } : undefined}
            />
          </div>
        </div>

        <hr className="sep" />

        <h2 className="h2">核心变量得分</h2>
        <table className="table">
          <thead>
            <tr><th>维度</th><th>得分</th><th>区间标签</th></tr>
          </thead>
          <tbody>
            {userVec.map((v, i) => (
              <tr key={i}>
                <td>{DIM_NAMES[i]}</td>
                <td>{Math.round(v)}</td>
                <td>{dimLabel(v, i)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr className="sep" />

        <h2 className="h2">为什么是这个派别</h2>
        <p className="p">
          贴合点（与{main.name}更接近的维度）：{fitDims.map(i=>DIM_NAMES[i]).join('、')}。
          {diffDimsText(userVec, mainIdeal, fitDims)}
        </p>
        <p className="p">
          张力点（与你的取向差距更大的维度）：{tensionDims.map(i=>DIM_NAMES[i]).join('、')}。
          {diffDimsText(userVec, mainIdeal, tensionDims)}
        </p>

        <hr className="sep" />

        <h2 className="h2">相邻派别差异点</h2>
        {neighbors.map((nb, idx) => {
          const nbIdeal = getIdeal(nb.key)
          const majorDiff = topDimsByCloseness(userVec, nbIdeal, 2, true)
          return (
            <div key={nb.key} style={{marginBottom:10}}>
              <p className="p" style={{marginBottom:6}}>
                与【{nb.name}】的主要差异更集中在：{majorDiff.map(i=>DIM_NAMES[i]).join('、')}。
              </p>
              <p className="small" style={{margin:0}}>
                {majorDiff.map(i=>`【${DIM_NAMES[i]}】你 ${Math.round(userVec[i])} vs ${nb.name}典型 ${Math.round(nbIdeal[i])}`).join('；')}
              </p>
            </div>
          )
        })}

        <hr className="sep" />

        <h2 className="h2">派别定义与核心特点（核心派别）</h2>
        {(() => {
          const entry = getEntry(main.key)
          if (!entry) return <p className="p">未找到该派别百科条目。</p>
          return (
            <div>
              <p className="p"><strong>{entry.name}</strong></p>
              <p className="p"><strong>核心关注：</strong>{entry.core.join('；')}</p>
              <p className="p"><strong>关键立场：</strong>{entry.positions.join('；')}</p>
              <p className="p"><strong>常见误解：</strong>{entry.misconceptions.join('；')}</p>
              <p className="p"><strong>与相邻派别分歧：</strong>{entry.differences.join('；')}</p>
              <p className="small">完整百科：请前往“派别百科”页面。</p>
            </div>
          )
        })()}

        {consistency.length > 0 && (
          <>
            <hr className="sep" />
            <div className="small">
              {consistency.map((c, i) => <div key={i}>{c.label}：{c.detail}</div>)}
            </div>
          </>
        )}

        <hr className="sep" />
        <div style={{display:'flex', gap:10}}>
          <Link to="/test" className="btn" style={{textDecoration:'none'}}>返回修改答案</Link>
          <button className="btn" onClick={() => window.print()}>打印/导出PDF</button>
        </div>
      </div>
    </div>
  )
}
