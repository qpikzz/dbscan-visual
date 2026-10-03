import type { ScenarioId } from '../data'

type Dot = { x: number; y: number }

const previewNoise = (index: number, salt: number): number => {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453
  return value - Math.floor(value)
}

const arcDots = (
  cx: number,
  cy: number,
  radius: number,
  from: number,
  to: number,
  count: number,
): Dot[] =>
  Array.from({ length: count }, (_, i) => {
    const angleStep = (to - from) / (count - 1)
    const angle =
      from +
      angleStep * i +
      (previewNoise(i, radius) - 0.5) * angleStep * 0.7
    const pointRadius = radius + (previewNoise(i, radius * 2) - 0.5) * 1.2
    return {
      x: cx + Math.cos(angle) * pointRadius,
      y: cy + Math.sin(angle) * pointRadius,
    }
  })

const ringDots = (cx: number, cy: number, radius: number, count: number): Dot[] =>
  Array.from({ length: count }, (_, index) => {
    const angleStep = (Math.PI * 2) / count
    const angle =
      -Math.PI / 2 +
      angleStep * index +
      (previewNoise(index, radius) - 0.5) * angleStep * 0.7
    const pointRadius = radius + (previewNoise(index, radius * 2) - 0.5) * 1.2
    return {
      x: cx + Math.cos(angle) * pointRadius,
      y: cy + Math.sin(angle) * pointRadius,
    }
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
    { radius: 8, count: 24, color: 'var(--cluster-1)' },
    { radius: 17, count: 42, color: 'var(--cluster-2)' },
    { radius: 26, count: 60, color: 'var(--cluster-3)' },
  ]

  return (
    <svg className="scenario-preview" viewBox="0 0 96 72" aria-hidden="true">
      {rings.map((ring) =>
        [-2.8, 0, 2.8].flatMap((offset, layer) =>
          ringDots(48, 36, ring.radius + offset, ring.count).map((point, index) =>
            dot(
              `ring-${ring.radius}-${layer}-${index}`,
              point.x,
              point.y,
              ring.color,
              1.15,
            ),
          ),
        ),
      )}
    </svg>
  )
}

function BlobsPreview() {
  const blobs = [
    { cx: 28, cy: 16, color: 'var(--cluster-1)' },
    { cx: 70, cy: 38, color: 'var(--cluster-2)' },
    { cx: 28, cy: 57, color: 'var(--cluster-3)' },
  ]
  const offsets = [
    { x: -4, y: -1 },
    { x: -2, y: -3 },
    { x: 1, y: -4 },
    { x: 4, y: -2 },
    { x: -5, y: 2 },
    { x: -2, y: 1 },
    { x: 2, y: 0 },
    { x: 5, y: 2 },
    { x: -3, y: 5 },
    { x: 0, y: 4 },
    { x: 3, y: 5 },
    { x: 1, y: -1 },
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
            1.65,
          ),
        ),
      )}
    </svg>
  )
}

function HalfMoonsPreview() {
  const layers = [-2.8, 0, 2.8]

  return (
    <svg className="scenario-preview" viewBox="0 0 96 72" aria-hidden="true">
      {layers.flatMap((offset, layer) => {
        const left = arcDots(
          48,
          36,
          16 + offset,
          0,
          Math.PI,
          26,
        )
        const right = arcDots(
          36.3,
          36,
          16 + offset,
          Math.PI,
          Math.PI * 2,
          26,
        )
        return [
          ...left.map((p, i) =>
            dot(`moon-a-${layer}-${i}`, p.x, p.y, 'var(--cluster-3)', 1.2),
          ),
          ...right.map((p, i) =>
            dot(`moon-b-${layer}-${i}`, p.x, p.y, 'var(--cluster-2)', 1.2),
          ),
        ]
      })}
    </svg>
  )
}

function pathDots(points: readonly Dot[], spacing: number): Dot[] {
  const dots: Dot[] = []

  for (let index = 0; index < points.length; index += 1) {
    const start = points[index]
    const end = points[(index + 1) % points.length]
    if (start === undefined || end === undefined) continue

    const distance = Math.hypot(end.x - start.x, end.y - start.y)
    const count = Math.ceil(distance / spacing)
    for (let step = 0; step < count; step += 1) {
      const progress = step / count
      dots.push({
        x: start.x + (end.x - start.x) * progress,
        y: start.y + (end.y - start.y) * progress,
      })
    }
  }

  return dots
}

function CreatePreview() {
  const cursorOutline = pathDots(
    [
      { x: 34, y: 9 },
      { x: 34, y: 60 },
      { x: 45, y: 48 },
      { x: 53, y: 64 },
      { x: 61, y: 60 },
      { x: 53, y: 44 },
      { x: 68, y: 44 },
      { x: 34, y: 9 },
    ],
    4,
  )

  return (
    <svg className="scenario-preview" viewBox="0 0 96 72" aria-hidden="true">
      {cursorOutline.map((point, index) =>
        dot(`cursor-outline-${index}`, point.x, point.y, 'var(--text-muted)', 1.5),
      )}
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
