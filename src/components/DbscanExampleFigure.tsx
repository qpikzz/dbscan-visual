import { useId } from 'react'
import { motion } from 'motion/react'
import type { TheoryTextKey } from '../data/theory'
import {
  analyzeTheoryExample,
  theoryExampleColorClass,
  theoryExampleLabelOffsets,
  theoryExamplePlot,
  theoryExamplePosition,
  theoryExampleViewBox,
} from '../data/theoryExample'
import type {
  TheoryExampleGroup,
  TheoryExampleLabelOffset,
  TheoryExamplePoint,
} from '../data/theoryExample'
import { useMotionSettings } from '../hooks/useMotionSettings'
import { useLanguage } from '../i18n'

type DbscanExampleFigureProps = {
  points: readonly TheoryExamplePoint[]
  radius: number
  minPts: number
  captionKey: TheoryTextKey
  compact?: boolean
  bridgePointId?: string
}

function xPosition(point: TheoryExamplePoint): number {
  return theoryExamplePosition(point).x
}

function yPosition(point: TheoryExamplePoint): number {
  return theoryExamplePosition(point).y
}

function groupColorClass(
  group: TheoryExampleGroup | undefined,
  point?: TheoryExamplePoint,
  pointIndex?: number,
) {
  return group
    ? theoryExampleColorClass(group, point, pointIndex)
    : 'theory-example-color--noise-1'
}

export function DbscanExampleFigure({
  points,
  radius,
  minPts,
  captionKey,
  compact = false,
  bridgePointId,
}: DbscanExampleFigureProps) {
  const { t } = useLanguage()
  const { reduced, transition } = useMotionSettings()
  const analysis = analyzeTheoryExample(points, radius, minPts)
  const id = useId()
  const titleId = `${id}-title`
  const descId = `${id}-description`
  const clusterDescription = analysis.groups
    .filter((group) => group.clusterNumber !== null)
    .map((group) => {
      const members = group.pointIndices.map((pointIndex) => points[pointIndex]?.id)
      return `${t.theoryExampleClusterLabel} ${group.clusterNumber}: ${members.join(', ')}`
    })
  const noiseMembers = analysis.groups
    .filter((group) => group.clusterNumber === null)
    .flatMap((group) => group.pointIndices.map((pointIndex) => points[pointIndex]?.id))
  const description = [
    ...clusterDescription,
    `${t.theoryExampleNoiseLabel}: ${noiseMembers.join(', ')}`,
  ].join('; ')
  const initialLines = reduced ? false : { pathLength: 0, opacity: 0 }
  const edgeTransition = (index: number) =>
    reduced ? { duration: 0 } : transition(0.7, index * 0.035)

  return (
    <figure
      className={`theory-example-figure${compact ? ' theory-example-figure--compact' : ''}`}
    >
      <svg
        className="theory-example-figure__svg"
        viewBox={`0 0 ${theoryExampleViewBox.width} ${theoryExampleViewBox.height}`}
        role="img"
        aria-labelledby={`${titleId} ${descId}`}
      >
        <title id={titleId}>{t.theoryExampleFigureTitle}</title>
        <desc id={descId}>{description}</desc>
        <g aria-hidden="true">
          <rect
            className="theory-example-figure__background"
            x="0"
            y="0"
            width={theoryExampleViewBox.width}
            height={theoryExampleViewBox.height}
          />
          {Array.from({ length: 13 }, (_, value) => {
            const x = theoryExamplePlot.left +
              (value * (theoryExamplePlot.right - theoryExamplePlot.left)) / 12
            return (
              <g key={`x-${value}`}>
                <line
                  className="theory-example-figure__grid"
                  x1={x}
                  y1={theoryExamplePlot.top}
                  x2={x}
                  y2={theoryExamplePlot.bottom}
                />
                <text
                  className="theory-example-figure__axis-label"
                  x={x}
                  y="22"
                  textAnchor="middle"
                >
                  {value}
                </text>
              </g>
            )
          })}
          {Array.from({ length: 11 }, (_, value) => {
            const y = theoryExamplePlot.bottom -
              (value * (theoryExamplePlot.bottom - theoryExamplePlot.top)) / 10
            return (
              <g key={`y-${value}`}>
                <line
                  className="theory-example-figure__grid"
                  x1={theoryExamplePlot.left}
                  y1={y}
                  x2={theoryExamplePlot.right}
                  y2={y}
                />
                <text
                  className="theory-example-figure__axis-label"
                  x="30"
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {value}
                </text>
              </g>
            )
          })}
        </g>

        {points.flatMap((point, pointIndex) =>
          (analysis.neighborsByPoint[pointIndex] ?? [])
            .filter((neighborIndex) => neighborIndex > pointIndex)
            .flatMap((neighborIndex) => {
              const neighbor = points[neighborIndex]
              const groupIndex = analysis.groupIndexByPoint[pointIndex]
              const group = analysis.groups[groupIndex]
              if (!neighbor || !group || analysis.groupIndexByPoint[neighborIndex] !== groupIndex) {
                return []
              }
              const isBridgeEdge =
                bridgePointId !== undefined &&
                (point.id === bridgePointId || neighbor.id === bridgePointId)
              return [
                <motion.line
                  key={`${point.id}-${neighbor.id}`}
                  className={`theory-example-figure__edge ${groupColorClass(group, point, pointIndex)}${isBridgeEdge ? ' theory-example-figure__edge--bridge' : ''}`}
                  x1={xPosition(point)}
                  y1={yPosition(point)}
                  x2={xPosition(neighbor)}
                  y2={yPosition(neighbor)}
                  initial={initialLines}
                  whileInView={{ pathLength: 1, opacity: 0.62 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={edgeTransition(pointIndex)}
                />,
              ]
            }),
        )}

        {points.map((point, pointIndex) => {
          const group = analysis.groups[analysis.groupIndexByPoint[pointIndex] ?? -1]
          const offset: TheoryExampleLabelOffset = theoryExampleLabelOffsets[point.id] ?? {
            dx: 8,
            dy: -8,
            anchor: 'start',
          }
          const colorClass = groupColorClass(group, point, pointIndex)
          return (
            <g key={point.id}>
              <motion.circle
                className={`theory-example-figure__point ${colorClass}`}
                cx={xPosition(point)}
                cy={yPosition(point)}
                r="5.5"
                initial={reduced ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={reduced ? { duration: 0 } : transition(0.45, pointIndex * 0.04)}
              />
              <text
                className="theory-example-figure__point-label"
                x={xPosition(point) + offset.dx}
                y={yPosition(point) + offset.dy}
                textAnchor={offset.anchor}
              >
                {point.id}
              </text>
            </g>
          )
        })}

        {bridgePointId ? (
          <text
            className="theory-example-figure__annotation"
            x="235"
            y="120"
            aria-hidden="true"
          >
            {t.theoryExampleBridgeLabel} {bridgePointId}
          </text>
        ) : null}
      </svg>

      <figcaption className="theory-example-figure__caption">
        {t[captionKey]}
      </figcaption>
    </figure>
  )
}
