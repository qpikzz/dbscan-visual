import type { ScenarioId } from '../data'

type Dot = { x: number; y: number }

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

const dot = (
  key: string,
  x: number,
  y: number,
  fill: string,
  r = 2,
) => <circle key={key} cx={x} cy={y} r={r} fill={fill} />

function CirclesPreview() {
  const rings = [
    { radius: 7, color: 'var(--cluster-1)' },
    { radius: 14, color: 'var(--cluster-2)' },
    { radius: 21, color: 'var(--cluster-3)' },
  ]

  return (
    <svg className="scenario-preview" viewBox="0 0 96 72" aria-hidden="true">
      {rings.map((ring) => (
        <circle
          key={ring.radius}
          cx={48}
          cy={36}
          r={ring.radius}
          fill="none"
          stroke={ring.color}
          strokeWidth={1.5}
          strokeDasharray="1.5 2.5"
          strokeLinecap="round"
        />
      ))}
    </svg>
  )
}

function BlobsPreview() {
  const blobs = [
    { cx: 20, cy: 22, color: 'var(--cluster-1)' },
    { cx: 72, cy: 18, color: 'var(--cluster-2)' },
    { cx: 30, cy: 52, color: 'var(--cluster-3)' },
    { cx: 74, cy: 52, color: 'var(--cluster-4)' },
  ]
  const offsets = [
    { x: 0, y: 0 },
    { x: 4, y: -2 },
    { x: -4, y: -1 },
    { x: -1, y: 4 },
    { x: 3, y: 3 },
    { x: -3, y: -4 },
  ]

  return (
    <svg className="scenario-preview" viewBox="0 0 96 72" aria-hidden="true">
      {blobs.map((blob, bi) =>
        offsets.map((offset, i) =>
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
  const upper = arcDots(42, 36, 16, Math.PI * 0.05, Math.PI * 0.95, 14)
  const lower = arcDots(54, 36, 16, Math.PI * 1.05, Math.PI * 1.95, 14)

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
      <g
        fill="none"
        stroke="var(--text-muted)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M52 20l12 12L38 58l-14 2 2-14L52 20Z" />
        <path d="M48 24l12 12" />
      </g>
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
