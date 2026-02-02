import React from 'react'
import ReactECharts from 'echarts-for-react'
import { DIM_NAMES } from '../lib/scoring'

type Props = {
  userVec: number[]
  main: { name: string, ideal: number[] }
  second?: { name: string, ideal: number[] }
}

export default function RadarChart({ userVec, main, second }: Props) {
  const indicators = DIM_NAMES.map(n => ({ name: n, max: 100 }))
  const seriesData: any[] = [
    { value: userVec, name: '你的得分' },
    { value: main.ideal, name: main.name, lineStyle: { type: 'dashed' } },
  ]
  if (second) {
    seriesData.push({ value: second.ideal, name: second.name, lineStyle: { type: 'dashed' } })
  }

  const option = {
    tooltip: { trigger: 'item' },
    legend: { top: 0 },
    radar: { indicator: indicators, splitNumber: 4 },
    series: [
      {
        type: 'radar',
        data: seriesData,
        areaStyle: { opacity: 0.08 },
        symbolSize: 4,
      }
    ]
  }
  return <ReactECharts option={option} style={{ height: 360 }} />
}
