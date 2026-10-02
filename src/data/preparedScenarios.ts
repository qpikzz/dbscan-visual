import type { Point } from '../features/dbscan/types'

const unitNoise = (index: number, salt: number): number => {
  let value = Math.imul(index ^ Math.floor(salt * 1000), 0x45d9f3b)
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b)
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b)
  return ((value ^ (value >>> 16)) >>> 0) / 0xffffffff
}

const circleBandPoints = (radius: number, count: number): Point[] =>
  [-0.8, 0, 0.8].flatMap((offset, layer) =>
    Array.from({ length: count }, (_, index) => {
      const pointId = layer * count + index
      const angleStep = (Math.PI * 2) / count
      const angle =
        (Math.PI * 2 * (index + layer / 3)) / count +
        (unitNoise(pointId, radius * 11) - 0.5) * angleStep * 0.8
      const layerRadius =
        radius + offset + (unitNoise(pointId, radius * 23) - 0.5) * 0.7

      return {
        x: Math.cos(angle) * layerRadius,
        y: Math.sin(angle) * layerRadius,
      }
    }),
  )

const blobCenters = [
  { x: -3, y: -2.2 },
  { x: 3, y: -2.2 },
  { x: 0, y: 2.4 },
] satisfies readonly Point[]

const rotateBlobCenter = (point: Point): Point => {
  const centerY = -2 / 3
  const scale = 2.3
  const angle = Math.PI / 6
  const x = point.x * scale
  const y = (point.y - centerY) * scale

  return {
    x: x * Math.cos(angle) - y * Math.sin(angle),
    y: centerY + x * Math.sin(angle) + y * Math.cos(angle),
  }
}

const blobPoints = (center: Point, count: number): Point[] => {
  const points: Point[] = []
  const minimumSpacing = 0.6
  let attempt = 0

  while (points.length < count && attempt < 10000) {
    const angle = unitNoise(attempt, center.x + center.y * 13) * Math.PI * 2
    const radius = 3.7 * Math.sqrt(unitNoise(attempt, center.x * 7 + center.y))
    const candidate = {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    }

    if (
      points.every(
        (point) => Math.hypot(point.x - candidate.x, point.y - candidate.y) >= minimumSpacing,
      )
    ) {
      points.push(candidate)
    }
    attempt += 1
  }

  if (points.length !== count) {
    throw new Error(`Could not place ${count} points in a blob`)
  }

  return points
}

const halfMoonPoints = (pointsPerTrack: number): Point[] => {
  const points: Point[] = []
  const radius = 4.8
  const upperCenter = { x: 0, y: 0 }
  const lowerCenter = { x: -3.5, y: 0 }
  const trackOffsets = [-0.65, 0, 0.65]

  for (const [layer, offset] of trackOffsets.entries()) {
    for (let index = 0; index < pointsPerTrack; index += 1) {
      const pointId = layer * pointsPerTrack + index
      const from = 0
      const to = Math.PI
      const angleStep = (to - from) / (pointsPerTrack - 1)
      const angle =
        from +
        angleStep * index +
        (unitNoise(pointId, 3) - 0.5) * angleStep * 0.8
      const trackRadius =
        radius + offset + (unitNoise(pointId, 5) - 0.5) * 0.6

      points.push({
        x: upperCenter.x + Math.cos(angle) * trackRadius,
        y: upperCenter.y + Math.sin(angle) * trackRadius,
      })
    }

    for (let index = 0; index < pointsPerTrack; index += 1) {
      const pointId = layer * pointsPerTrack + index + pointsPerTrack * 3
      const from = Math.PI
      const to = Math.PI * 2
      const angleStep = (to - from) / (pointsPerTrack - 1)
      const angle =
        from +
        angleStep * index +
        (unitNoise(pointId, 7) - 0.5) * angleStep * 0.8
      const trackRadius =
        radius + offset + (unitNoise(pointId, 11) - 0.5) * 0.6

      points.push({
        x: lowerCenter.x + Math.cos(angle) * trackRadius,
        y: lowerCenter.y + Math.sin(angle) * trackRadius,
      })
    }
  }

  return points
}

export const PREPARED_SCENARIO_POINTS = {
  circles: [
    ...circleBandPoints(3.4, 18),
    ...circleBandPoints(8.2, 32),
    ...circleBandPoints(13, 48),
  ],
  blobs: [
    ...blobCenters.flatMap((center) => blobPoints(rotateBlobCenter(center), 64)),
  ],
  'half-moons': halfMoonPoints(22),
} as const satisfies Record<'circles' | 'blobs' | 'half-moons', readonly Point[]>
