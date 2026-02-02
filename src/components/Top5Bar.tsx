import React from 'react'
import ReactECharts from 'echarts-for-react'
import type { TypeScore } from '../lib/scoring'

export default function Top5Bar({ top5 }: { top5: TypeScore[] }) {
  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: 90, right: 20, top: 20, bottom: 20 },
    xAxis: { type: 'value', max: 100 },
    yAxis: { type: 'category', data: top5.map(x => x.name).reverse() },
    series: [
      { type: 'bar', data: top5.map(x => Math.round(x.sim)).reverse() }
    ]
  }
  return <ReactECharts option={option} style={{ height: 260 }} />
}
