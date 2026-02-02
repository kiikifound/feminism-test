import React from 'react'

const labels = ['非常不同意','不同意','有点不同意','中立','有点同意','同意','非常同意']

export default function LikertScale({
  value,
  onChange
}:{
  value?: number
  onChange: (v:number)=>void
}) {
  return (
    <div className="scale" role="radiogroup" aria-label="likert">
      {labels.map((lab, idx) => {
        const v = idx + 1
        const active = value === v
        return (
          <div
            key={v}
            className={'choice' + (active ? ' active' : '')}
            onClick={() => onChange(v)}
            role="radio"
            aria-checked={active}
            title={lab}
          >
            {v}
          </div>
        )
      })}
    </div>
  )
}
