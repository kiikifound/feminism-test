import idealsData from '../data/ideals.json'
import { DIM_NAMES, DIM_ANCHORS } from '../lib/scoring'

export default function Method() {
  return (
    <div className="container">
      <div className="card">
        <h1 className="h1">方法说明</h1>

        <h2 className="h2">1) 维度</h2>
        <table className="table">
          <thead><tr><th>维度</th><th>低端锚点</th><th>高端锚点</th></tr></thead>
          <tbody>
            {DIM_NAMES.map((n, i) => (
              <tr key={i}>
                <td>{n}</td>
                <td>{DIM_ANCHORS[i][0]}</td>
                <td>{DIM_ANCHORS[i][1]}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="h2" style={{marginTop:16}}>2) 计分</h2>
        <p className="p">每题 1–7 映射到 0–100；反向题取 100-得分。每个维度取对应题目的平均分，得到 6维向量。</p>

        <h2 className="h2">3) 派别匹配</h2>
        <p className="p">每个派别有一个理想向量（0–100）。使用加权欧氏距离计算相似度，并叠加 6 道校准题对派别的特征加权。</p>
        <p className="p small">当前参数：温度={String((idealsData as any).temperature)}；校准权重={String((idealsData as any).calibration_weight)}。</p>

        <h2 className="h2">4) 混合型</h2>
        <p className="p">若第二名相似度 ≥ 第一名的 85% 或差值 ≤ 6，则显示“主派别 + 次派别”。</p>

        <h2 className="h2">5) 数据与隐私</h2>
        <p className="p">本版本为静态站：答案仅保存在浏览器 localStorage，不上传服务器。</p>
      </div>
    </div>
  )
}
