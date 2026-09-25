import type { CSSProperties } from 'react'
import type { ScenarioId } from '../data'

type Dot = { x: number; y: number }

const ringDot = (
  cx: number,
  cy: number,
  radius: number,
  count: number,
): Dot[] =>
  Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2
    return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius }
  })

const arcDots = (
  cx: number,
  cy: number,
  radius: number,
  from: number,
  to: number,
  count: number,
): Dot[] =>
  Array.from({ length: count }, (_, i) => {
    const angle = from + ((to - from) * i) / (count - 1)
    return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius }
  })

const blobOffsets = [
  { x: 0, y: 0 },
  { x: 4, y: -3 },
  { x: -3, y: 2 },
  { x: -2, y: -4 },
  { x: 5, y: 4 },
  { x: -5, y: -1 },
  { x: 2, y: -5 },
  { x: 4, y: 1 },
]

const dot = (
  key: string,
  x: number,
  y: number,
  fill: string,
  r = 2,
  style?: CSSProperties,
) => <circle key={key} cx={x} cy={y} r={r} fill={fill} style={style} />

function CirclesPreview() {
  const rings = [
    { radius: 6, count: 10, color: 'var(--cluster-1)' },
    { radius: 13, count: 16, color: 'var(--cluster-2)' },
    { radius: 20, count: 22, color: 'var(--cluster-3)' },
  ]

  return (
    <svg className="scenario-preview" viewBox="0 0 96 72" aria-hidden="true">
      {rings.map((ring, idx) =>
        ringDot(48, 36, ring.radius, ring.count).map((p, i) =>
          dot(`circle-${idx}-${i}`, p.x, p.y, ring.color),
        ),
      )}
    </svg>
  )
}

function BlobsPreview() {
  const blobs = [
    { cx: 22, cy: 22, color: 'var(--cluster-1)' },
    { cx: 74, cy: 20, color: 'var(--cluster-2)' },
    { cx: 26, cy: 52, color: 'var(--cluster-3)' },
    { cx: 72, cy: 52, color: 'var(--cluster-4)' },
  ]

  return (
    <svg className="scenario-preview" viewBox="0 0 96 72" aria-hidden="true">
      {blobs.map((blob, bi) =>
        blobOffsets.map((offset, i) =>
          dot(
            `blob-${bi}-${i}`,
            blob.cx + offset.x,
            blob.cy + offset.y,
            blob.color,
          ),
        ),
      )}
    </svg>
  )
}

function HalfMoonsPreview() {
  const upper = arcDots(44, 34, 15, Math.PI * 0.05, Math.PI * 0.95, 12)
  const lower = arcDots(52, 38, 15, Math.PI * 1.05, Math.PI * 1.95, 12)

  return (
    <svg className="scenario-preview" viewBox="0 0 96 72" aria-hidden="true">
      {upper.map((p, i) => dot(`moon-a-${i}`, p.x, p.y, 'var(--cluster-3)'))}
      {lower.map((p, i) => dot(`moon-b-${i}`, p.x, p.y, 'var(--cluster-2)'))}
    </svg>
  )
}

function CreatePreview() {
  return (
    <svg className="scenario-preview" viewBox="0 0 96 72" aria-hidden="true">
      <path
        d="M24 52 48 28 68 48 44 72h-8l-8-8z"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M48 28l20 20"
        fill="none"
        stroke="var(--cluster-4)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="18" cy="18" r="3" fill="var(--cluster-3)" />
      <circle cx="78" cy="60" r="3" fill="var(--cluster-5)" />
      <circle cx="82" cy="14" r="2.5" fill="var(--cluster-1)" />
    </svg>
  )
}

export function ScenarioPreview({ scenario }: { scenario: ScenarioId }) {
  switch (scenario) {
    case 'circles':
      return <CirclesPreview />
    case 'blobs':
      return <BlobsPreview />
    case 'half-moons':
      return <HalfMoonsPreview />
    case 'create':
      return <CreatePreview />
  }
}