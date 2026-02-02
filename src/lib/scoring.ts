import idealsData from '../data/ideals.json'
import questionsData from '../data/questions.json'

export type AnswerMap = Record<number, number> // qid -> 1..7

export const DIM_NAMES = [
  '性别本体论',
  '压迫来源判断',
  '男性阶级理解',
  '性与身体政治',
  '资本主义立场',
  '交叉性优先级',
] as const

export const DIM_ANCHORS = [
  ['建构/可消解', '物质性/不可忽视'],
  ['个体选择优先', '结构制度优先'],
  ['否定阶级化', '阶级化理解'],
  ['去政治化', '高政治性'],
  ['市场中立/解放', '资本主义压迫'],
  ['性别优先', '多重结构交叉'],
] as const

export function scoreAnswer(ans1to7: number, reverse: boolean): number {
  const raw = ((ans1to7 - 1) / 6) * 100
  return reverse ? 100 - raw : raw
}

export function buildUserVec(answers: AnswerMap): number[] {
  const buckets: number[][] = Array.from({ length: 6 }, () => [])
  for (const q of questionsData as any[]) {
    if (q.kind === 'calibration') continue
    const ans = answers[q.id]
    if (!ans) continue
    const s = scoreAnswer(ans, !!q.reverse)
    buckets[q.dim].push(s)
  }
  return buckets.map(arr => arr.length ? arr.reduce((a,b)=>a+b,0) / arr.length : 50)
}

function weightedDistance(a: number[], b: number[], w: number[]): number {
  let sum = 0
  for (let i=0;i<6;i++){
    const diff = a[i] - b[i]
    sum += (w[i] ?? 1) * diff * diff
  }
  return Math.sqrt(sum)
}

function baseSimilarityFromDistance(d: number, temperature: number): number {
  return 100 * Math.exp(-d / temperature)
}

function calibrationBoost(typeKey: string, answers: AnswerMap): number {
  const cal = (idealsData as any).calibration
  const qids: number[] = cal.qids
  const tend: number[] = cal.tendencies[typeKey] ?? [0,0,0,0,0,0]
  const values: number[] = []
  for (let i=0;i<qids.length;i++){
    const qid = qids[i]
    const ans = answers[qid]
    if (!ans) continue
    // 0..100 then normalize to -1..+1
    const score = scoreAnswer(ans, false)
    const t = (score - 50) / 50
    values.push((tend[i] ?? 0) * t)
  }
  if (!values.length) return 0
  const avg = values.reduce((a,b)=>a+b,0) / values.length
  return avg
}

export type TypeScore = { key: string, name: string, sim: number }

export function computeTypeScores(answers: AnswerMap) {
  const userVec = buildUserVec(answers)
  const w: number[] = (idealsData as any).weights
  const temperature: number = (idealsData as any).temperature ?? 45
  const calW: number = (idealsData as any).calibration_weight ?? 6

  const results: TypeScore[] = []
  for (const t of (idealsData as any).types as any[]) {
    const d = weightedDistance(userVec, t.ideal, w)
    let sim = baseSimilarityFromDistance(d, temperature)
    const cal = calibrationBoost(t.key, answers)
    sim = sim + calW * cal
    // clamp
    sim = Math.max(0, Math.min(100, sim))
    results.push({ key: t.key, name: t.name, sim })
  }

  results.sort((a,b)=>b.sim - a.sim)
  const main = results[0]
  const secondCand = results[1]
  const second = (secondCand.sim >= main.sim * 0.85 || (main.sim - secondCand.sim) <= 6)
    ? secondCand
    : undefined

  const top5 = results.slice(0, 5)

  const consistency = computeConsistencyFlags(answers)

  return { userVec, results, main, second, top5, consistency }
}

export function computeConsistencyFlags(answers: AnswerMap) {
  // q6 vs q37; q16 vs q38 (37 and 38 are reverse-scored already in vec but here we check raw agreement tension)
  const getS = (qid: number, reverse: boolean) => {
    const ans = answers[qid]
    if (!ans) return null
    return scoreAnswer(ans, reverse)
  }

  const s6 = getS(6, false)
  const s37 = getS(37, false)
  const s16 = getS(16, false)
  const s38 = getS(38, false)

  const flags: { label: string, detail: string }[] = []
  if (s6 !== null && s37 !== null) {
    const diff = Math.abs(s6 - s37)
    if (diff < 15) flags.push({ label: '一致性偏低', detail: '第6题与第37题倾向接近' })
  }
  if (s16 !== null && s38 !== null) {
    const diff = Math.abs(s16 - s38)
    if (diff < 15) flags.push({ label: '一致性偏低', detail: '第16题与第38题倾向接近' })
  }
  return flags
}

export function dimLabel(score: number, dimIndex: number) {
  const anchors = DIM_ANCHORS[dimIndex]
  if (score <= 33) return anchors[0]
  if (score >= 67) return anchors[1]
  return '中间区间'
}

export function nearestTypes(all: TypeScore[], excludeKeys: string[], n = 2) {
  const res: TypeScore[] = []
  for (const t of all) {
    if (excludeKeys.includes(t.key)) continue
    res.push(t)
    if (res.length >= n) break
  }
  return res
}

export function topDimsByCloseness(userVec: number[], idealVec: number[], count = 3, invert = false) {
  const diffs = userVec.map((v,i)=>({i, d: Math.abs(v - idealVec[i])}))
  diffs.sort((a,b)=> invert ? b.d - a.d : a.d - b.d)
  return diffs.slice(0, count).map(x => x.i)
}
