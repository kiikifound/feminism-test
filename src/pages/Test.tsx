import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import questions from '../data/questions.json'
import LikertScale from '../components/LikertScale'

type AnswerMap = Record<number, number>

function loadAnswers(): AnswerMap {
  try {
    const raw = localStorage.getItem('answers')
    if (!raw) return {}
    return JSON.parse(raw)
  } catch { return {} }
}
function saveAnswers(a: AnswerMap) {
  localStorage.setItem('answers', JSON.stringify(a))
}

export default function Test() {
  const nav = useNavigate()
  const [answers, setAnswers] = useState<AnswerMap>(() => loadAnswers())
  const [page, setPage] = useState(0)

  const pageSize = 6
  const items = questions as any[]
  const pages = Math.ceil(items.length / pageSize)

  const current = useMemo(() => items.slice(page * pageSize, (page+1) * pageSize), [page])

  useEffect(() => { saveAnswers(answers) }, [answers])

  const answeredCount = Object.keys(answers).length
  const progress = Math.round((answeredCount / items.length) * 100)

  const canSubmit = answeredCount === items.length

  return (
    <div className="container">
      <div className="card">
        <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:12}}>
          <h2 className="h2" style={{margin:0}}>答题进度</h2>
          <div className="small">{answeredCount}/{items.length}（{progress}%）</div>
        </div>
        <div className="progress" style={{marginTop:10}}><div style={{width: progress + '%'}} /></div>

        <hr className="sep" />

        {current.map(q => (
          <div key={q.id} className="q">
            <div className="p" style={{margin:0}}><strong>#{q.id}</strong> {q.text}</div>
            <LikertScale
              value={answers[q.id]}
              onChange={(v) => setAnswers(prev => ({...prev, [q.id]: v}))}
            />
            <div className="small" style={{marginTop:6}}>1=非常不同意 … 7=非常同意</div>
          </div>
        ))}

        <div className="footerBtns">
          <button className="btn" onClick={() => setPage(p => Math.max(0, p-1))} disabled={page===0}>上一页</button>
          <div style={{display:'flex', gap:10}}>
            <button className="btn" onClick={() => { setAnswers({}); localStorage.removeItem('answers') }}>清空答案</button>
            {page < pages-1 ? (
              <button className="btn primary" onClick={() => setPage(p => Math.min(pages-1, p+1))}>下一页</button>
            ) : (
              <button
                className="btn primary"
                disabled={!canSubmit}
                onClick={() => {
                  if (!canSubmit) return
                  nav('/result')
                }}
              >提交并查看结果</button>
            )}
          </div>
        </div>

        {!canSubmit && page === pages-1 && (
          <p className="small" style={{marginTop:12}}>最后一页：需要回答完全部题目才可提交。</p>
        )}
      </div>
    </div>
  )
}
