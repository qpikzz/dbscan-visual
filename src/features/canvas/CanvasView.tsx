import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { POINT_LIMIT } from '../dbscan/constants'
import type { ScenarioId } from '../../data'
import type { Assignment, FrameEvent, Point, RadiusCircle } from '../dbscan/types'
import { useMotionSettings } from '../../hooks/useMotionSettings'
import { samplePathSegment } from './drawing'
import {
  CAPTURE_FADE_DURATION,
  easeStepProgress,
  MAX_STEP_ANIMATION_DURATION,
  MIN_STEP_DURATION,
  NOISE_FADE_DURATION,
  PARAMETER_VISUAL_DURATION,
  PULSE_CYCLE_DURATION,
  RADIUS_RETRACT_DURATION,
} from './animation'
import {
  matchScenarioPoints,
  type ScenarioTransitionRequest,
} from './scenarioTransition'

type CanvasViewProps = {
  scenario: ScenarioId
  points: readonly Point[]
  assignments: readonly Assignment[]
  circle: RadiusCircle | null
  probeHighlights: readonly number[]
  events: readonly FrameEvent[]
  captureIntervals: readonly (readonly number[])[]
  frameStep: number
  currentPointIndex: number | null
  r: number
  activeTool: 'draw' | 'erase' | null
  captureFadeDurations: readonly (readonly number[])[]
  selectionDurations: readonly number[]
  radiusDurations: readonly number[]
  scenarioTransition: ScenarioTransitionRequest | null
  onPointAdd: (point: Point) => void
  onPointsErase: (points: readonly Point[]) => void
  onPointLimitReached: () => void
  onScenarioTransitionComplete: (id: number) => void
}

type CanvasSize = {
  width: number
  height: number
  pixelRatio: number
}

type ViewTransform = {
  zoom: number
  x: number
  y: number
}

type CameraFlight = {
  startTime: number
  duration: number
  fromZoom: number
  fromX: number
  fromY: number
  toZoom: number
  toX: number
  toY: number
}

type Position = {
  x: number
  y: number
}

type ScenarioFlight = {
  from: Point
  to: Point
  delay: number
  fade: 'in' | 'out' | null
}

type ScenarioFlightPlayback = {
  id: number
  startTime: number
  duration: number
  reduced: boolean
  flights: readonly ScenarioFlight[]
  fromPositions: readonly Position[]
  toPositions: readonly Position[]
}

type CanvasFrameSnapshot = {
  assignments: readonly Assignment[]
  circle: RadiusCircle | null
  points: readonly Point[]
  step: number
  currentPointIndex: number | null
  probeHighlights: readonly number[]
}

type CircleVisual = {
  pointIndex: number
  x: number
  y: number
  radius: number
}

type ColorMotion = {
  pointIndex: number
  fromColor: string
  toColor: string
  start: number
  duration: number
  mode: 'blend' | 'fade'
}

type CircleMotion = {
  pointIndex: number
  fromRadius: number
  toRadius: number
  start: number
  duration: number
}

type RingMotion = {
  pointIndex: number
  start: number
  duration: number
}

type CurrentMotion = {
  start: number
  pointIndex: number | null
  pulseStart: number | null
}

type ProbeMotion = {
  start: number
  duration: number
  centerIndices: readonly number[]
  highlightedIndices: readonly number[]
  showCircle: boolean
}

type FramePlayback = {
  startTime: number
  duration: number
  reduced: boolean
  colorMotions: readonly ColorMotion[]
  circleMotions: readonly CircleMotion[]
  ringMotions: readonly RingMotion[]
  currentMotions: readonly CurrentMotion[]
  probeMotions: readonly ProbeMotion[]
  startColors: readonly string[]
  startCircle: CircleVisual | null
  startCurrentPointIndex: number | null
  startPulseTime: number | null
  targetColors: readonly string[]
  targetCircle: CircleVisual | null
  targetCurrentPointIndex: number | null
}

const GRID_CELL_SIZE = 32
const SCENARIO_FLIGHT_DURATION = 1400
const SCENARIO_FLIGHT_STAGGER = 24
const SCENARIO_MAX_STAGGER = 96
const SCENARIO_REDUCED_FADE_DURATION = 180
const MIN_ZOOM = 0.1
const MAX_ZOOM = 8
const FIT_PADDING = 40
const POINT_RADIUS = 0.14
const DRAW_SPACING = 0.45
const ERASE_SPACING = 0.14
const ERASE_RADIUS = 0.3
const SCENARIO_TRAIL_COLLAPSE_DURATION = 150
const TRAIL_MAX_LENGTH_WORLD = POINT_RADIUS * 4
const TRAIL_MIN_SCREEN_TRAVEL = 0.75
const TRAIL_ALPHA_MAX = 0.5
const TRAIL_ALPHA_EXPONENT = 1.8
const TRAIL_MIN_ALPHA = 0.04
const TRAIL_END_SCALE = 0.7
const TRAIL_SMALL_COPY_COUNT = 5
const TRAIL_MEDIUM_COPY_COUNT = 3
const TRAIL_SMALL_LIMIT = 500
const TRAIL_MEDIUM_LIMIT = 1200
const TRAIL_VIEWPORT_MARGIN = 8
const TRAIL_BAND_HEAD_ALPHA = 0.16
const TRAIL_BAND_TAIL_ALPHA = 0.06

function easeInOutProgress(progress: number): number {
  return (1 - Math.cos(Math.PI * progress)) / 2
}

function projectPoint(
  point: Point,
  transform: ViewTransform,
  size: CanvasSize,
): Position {
  const scale = GRID_CELL_SIZE * transform.zoom
  return {
    x: size.width / 2 + transform.x + point.x * scale,
    y: size.height / 2 + transform.y + point.y * scale,
  }
}

function unprojectPosition(
  position: Position,
  transform: ViewTransform,
  size: CanvasSize,
): Point {
  const scale = GRID_CELL_SIZE * transform.zoom
  return {
    x: (position.x - size.width / 2 - transform.x) / scale,
    y: (position.y - size.height / 2 - transform.y) / scale,
  }
}

type TrailLayer = {
  scale: number
  color: string
}

function buildTrailLayers(color: string, count: number): readonly TrailLayer[] {
  const layers: TrailLayer[] = []
  for (let index = 0; index < count; index += 1) {
    const t = count <= 1 ? 0 : index / (count - 1)
    const alpha = Math.max(
      TRAIL_ALPHA_MAX * (1 - t) ** TRAIL_ALPHA_EXPONENT,
      TRAIL_MIN_ALPHA,
    )
    layers.push({
      scale: 1 - (1 - TRAIL_END_SCALE) * t,
      color: getRgbaColor(color, alpha),
    })
  }
  return layers
}

function getFlightProgress(flight: ScenarioFlight, flightElapsed: number): number {
  const raw = (flightElapsed - flight.delay) / SCENARIO_FLIGHT_DURATION
  if (raw <= 0) {
    return 0
  }
  if (raw >= 1) {
    return 1
  }
  return easeInOutProgress(raw)
}

function getFlightOpacity(flight: ScenarioFlight, eased: number): number {
  if (flight.fade === 'in') {
    return easeInOutProgress(Math.min(eased / 0.24, 1))
  }
  if (flight.fade === 'out') {
    return 1 - easeInOutProgress(Math.max((eased - 0.72) / 0.28, 0))
  }
  return 1
}

function getCopyProgress(
  flight: ScenarioFlight,
  eased: number,
  lag: number,
  shrink: number,
): number {
  const segmentX = flight.to.x - flight.from.x
  const segmentY = flight.to.y - flight.from.y
  const segmentLength = Math.sqrt(segmentX * segmentX + segmentY * segmentY)
  const trailLimit = Math.min(TRAIL_MAX_LENGTH_WORLD / segmentLength, eased)
  return eased - lag * shrink * trailLimit
}

function getOutsidePosition(
  point: Position,
  width: number,
  height: number,
  index: number,
  outward: boolean,
): Position {
  const centerX = width / 2
  const centerY = height / 2
  let dx = point.x - centerX
  let dy = point.y - centerY
  if (Math.hypot(dx, dy) < 0.001) {
    const angle = index * 2.399963229728653
    dx = Math.cos(angle)
    dy = Math.sin(angle)
  }
  const length = Math.hypot(dx, dy)
  const unitX = dx / length
  const unitY = dy / length
  const edgeDistance = Math.min(
    (width / 2) / Math.max(Math.abs(unitX), 0.0001),
    (height / 2) / Math.max(Math.abs(unitY), 0.0001),
  )
  const pointDistance = (point.x - centerX) * unitX + (point.y - centerY) * unitY
  const distance = outward
    ? Math.max(edgeDistance + 24, pointDistance + 24)
    : edgeDistance + 24
  return {
    x: centerX + unitX * distance,
    y: centerY + unitY * distance,
  }
}

function mixHexColor(fromColor: string, toColor: string, progress: number): string {
  const fromHex = fromColor.slice(1)
  const toHex = toColor.slice(1)
  const channels = [0, 2, 4].map((offset) => {
    const fromChannel = Number.parseInt(fromHex.slice(offset, offset + 2), 16)
    const toChannel = Number.parseInt(toHex.slice(offset, offset + 2), 16)
    return Math.round(fromChannel + (toChannel - fromChannel) * progress)
      .toString(16)
      .padStart(2, '0')
  })
  return `#${channels.join('')}`
}

function getThemeColor(element: HTMLElement, token: string): string {
  return getComputedStyle(element).getPropertyValue(token).trim()
}

function getRgbaColor(color: string, alpha: number): string {
  const match = /^#([0-9a-f]{6})$/i.exec(color)
  if (match === null) {
    throw new Error(`Unsupported Canvas theme color: ${color}`)
  }
  const hex = match[1]
  if (hex === undefined) {
    throw new Error(`Invalid Canvas theme color: ${color}`)
  }
  const red = Number.parseInt(hex.slice(0, 2), 16)
  const green = Number.parseInt(hex.slice(2, 4), 16)
  const blue = Number.parseInt(hex.slice(4, 6), 16)
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

function getPinchState(positions: Map<number, Position>) {
  const points = [...positions.values()]
  const first = points[0]
  const second = points[1]
  if (first === undefined || second === undefined) {
    return null
  }
  return {
    center: { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 },
    distance: Math.hypot(second.x - first.x, second.y - first.y),
  }
}

function computeFitTransform(
  points: readonly Point[],
  size: CanvasSize,
): ViewTransform {
  if (points.length === 0) {
    return { zoom: 1, x: 0, y: 0 }
  }

  const bounds = points.reduce(
    (current, point) => ({
      minX: Math.min(current.minX, point.x),
      maxX: Math.max(current.maxX, point.x),
      minY: Math.min(current.minY, point.y),
      maxY: Math.max(current.maxY, point.y),
    }),
    {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    },
  )
  const worldWidth = Math.max(bounds.maxX - bounds.minX, 1)
  const worldHeight = Math.max(bounds.maxY - bounds.minY, 1)
  const availableWidth = Math.max(size.width - FIT_PADDING * 2, 1)
  const availableHeight = Math.max(size.height - FIT_PADDING * 2, 1)
  const zoom = Math.min(
    1,
    availableWidth / (worldWidth * GRID_CELL_SIZE),
    availableHeight / (worldHeight * GRID_CELL_SIZE),
  )
  const scale = GRID_CELL_SIZE * zoom
  const centerX = (bounds.minX + bounds.maxX) / 2
  const centerY = (bounds.minY + bounds.maxY) / 2
  return {
    zoom: Math.max(MIN_ZOOM, zoom),
    x: -centerX * scale,
    y: -centerY * scale,
  }
}

export function CanvasView({
  scenario,
  points,
  assignments,
  circle,
  probeHighlights,
  events,
  captureIntervals,
  frameStep,
  currentPointIndex,
  r,
  activeTool,
  captureFadeDurations,
  selectionDurations,
  radiusDurations,
  scenarioTransition,
  onPointAdd,
  onPointsErase,
  onPointLimitReached,
  onScenarioTransitionComplete,
}: CanvasViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const transformRef = useRef<ViewTransform>({ zoom: 1, x: 0, y: 0 })
  const previousScenarioRef = useRef<ScenarioId | null>(null)
  const pendingFitRef = useRef<ViewTransform | null>(null)
  const cameraFlightRef = useRef<CameraFlight | null>(null)
  const pointsRef = useRef(points)
  const pointCountRef = useRef(points.length)
  const limitToastShownRef = useRef(false)
  const previousFrameRef = useRef<CanvasFrameSnapshot | null>(null)
  const playbackRef = useRef<FramePlayback | null>(null)
  const scenarioFlightRef = useRef<ScenarioFlightPlayback | null>(null)
  const activeScenarioTransitionIdRef = useRef<number | null>(null)
  const renderedPointColorsRef = useRef<string[]>([])
  const renderedCircleRef = useRef<CircleVisual | null>(null)
  const renderedCurrentPointRef = useRef<number | null>(null)
  const renderedPulseTimeRef = useRef<number | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const interactionRef = useRef({
    activeTool,
    onPointAdd,
    onPointsErase,
    onPointLimitReached,
    onScenarioTransitionComplete,
  })
  const [size, setSize] = useState<CanvasSize>({ width: 0, height: 0, pixelRatio: 1 })
  const [revision, setRevision] = useState(0)
  const [isPanning, setIsPanning] = useState(false)
  const { reduced } = useMotionSettings()

  if (pointsRef.current !== points) {
    pointsRef.current = points
    pointCountRef.current = points.length
    if (points.length < POINT_LIMIT) {
      limitToastShownRef.current = false
    }
  }
  interactionRef.current = {
    activeTool,
    onPointAdd,
    onPointsErase,
    onPointLimitReached,
    onScenarioTransitionComplete,
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) {
      return
    }

    const updateSize = () => {
      const bounds = canvas.getBoundingClientRect()
      const pixelRatio = window.devicePixelRatio || 1
      const width = Math.round(bounds.width * pixelRatio)
      const height = Math.round(bounds.height * pixelRatio)
      if (canvas.width === width && canvas.height === height) {
        return
      }
      canvas.width = width
      canvas.height = height
      setSize({ width: bounds.width, height: bounds.height, pixelRatio })
    }

    const observer = new ResizeObserver(updateSize)
    observer.observe(canvas)
    window.addEventListener('resize', updateSize)
    updateSize()

    const themeObserver = new MutationObserver(() => setRevision((value) => value + 1))
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    return () => {
      observer.disconnect()
      themeObserver.disconnect()
      window.removeEventListener('resize', updateSize)
    }
  }, [])

  useLayoutEffect(() => {
    if (previousScenarioRef.current === scenario) {
      return
    }
    if (size.width === 0 || size.height === 0) {
      return
    }

    const isFirstFit = previousScenarioRef.current === null
    previousScenarioRef.current = scenario
    const nextTransform = computeFitTransform(points, size)
    if (isFirstFit) {
      transformRef.current = nextTransform
      setRevision((value) => value + 1)
    } else {
      pendingFitRef.current = nextTransform
    }
  }, [points, scenario, size.height, size.width])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (canvas === null || context === null || context === undefined || size.width === 0 || size.height === 0) {
      return
    }

    const previousFrame = previousFrameRef.current
    const pointsReplaced = previousFrame !== null && previousFrame.points !== points
    const pointsChanged = previousFrame !== null &&
      (pointsReplaced || previousFrame.step > frameStep)
    const frameChanged = previousFrame !== null &&
      (previousFrame.step !== frameStep ||
        previousFrame.assignments !== assignments ||
        previousFrame.circle !== circle ||
        previousFrame.currentPointIndex !== currentPointIndex ||
        previousFrame.probeHighlights !== probeHighlights)

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    const colors = {
      surface: getThemeColor(canvas, '--surface'),
      grid: getThemeColor(canvas, '--grid'),
      muted: getThemeColor(canvas, '--text-muted'),
      text: getThemeColor(canvas, '--text'),
      pulse: getThemeColor(canvas, '--pulse'),
      noise: Array.from({ length: 5 }, (_, index) =>
        getThemeColor(canvas, `--noise-${index + 1}`),
      ),
      primary: getThemeColor(canvas, '--primary'),
      clusters: Array.from({ length: 6 }, (_, index) =>
        getThemeColor(canvas, `--cluster-${index + 1}`),
      ),
    }
    const trailLayersSmall = buildTrailLayers(colors.muted, TRAIL_SMALL_COPY_COUNT)
    const trailLayersMedium = buildTrailLayers(colors.muted, TRAIL_MEDIUM_COPY_COUNT)
    const trailBandColors = [
      getRgbaColor(colors.muted, TRAIL_BAND_HEAD_ALPHA),
      getRgbaColor(colors.muted, TRAIL_BAND_TAIL_ALPHA),
    ]
    const assignmentColor = (assignment: Assignment | undefined, pointIndex: number) => {
      const point = points[pointIndex]
      if (assignment?.kind === 'noise') {
        const noiseIndex = Math.abs(
          Math.imul(Math.round((point?.x ?? 0) * 1000), 31) ^
            Math.round((point?.y ?? 0) * 1000) ^
            pointIndex,
        ) % colors.noise.length
        return colors.noise[noiseIndex] ?? colors.noise[0] ?? colors.muted
      }
      if (assignment?.kind === 'cluster') {
        return colors.clusters[assignment.clusterId % colors.clusters.length] ?? colors.muted
      }
      return colors.muted
    }
    const targetColors = points.map((_, index) => assignmentColor(assignments[index], index))
    if (scenarioTransition === null) {
      activeScenarioTransitionIdRef.current = null
    } else if (
      scenarioTransition.id !== activeScenarioTransitionIdRef.current &&
      previousFrame !== null &&
      previousFrame.points !== points
    ) {
      const destinationCamera = pendingFitRef.current ?? transformRef.current
      const sourceCamera = reduced ? destinationCamera : { ...transformRef.current }
      const flightStartTime = performance.now()
      const sourcePositions = scenarioTransition.fromPoints.map((point) =>
        projectPoint(point, sourceCamera, size),
      )
      const destinationPositions = points.map((point) =>
        projectPoint(point, destinationCamera, size),
      )
      const matches = matchScenarioPoints(sourcePositions, destinationPositions)
      const groupRanks = new Map<number, number>()
      let maximumDelay = 0
      const flights = matches.map((match, index): ScenarioFlight => {
        const rank = groupRanks.get(match.staggerGroup) ?? 0
        groupRanks.set(match.staggerGroup, rank + 1)
        const delay = Math.min(rank * SCENARIO_FLIGHT_STAGGER, SCENARIO_MAX_STAGGER)
        maximumDelay = Math.max(maximumDelay, delay)
        const source = match.sourceIndex === null
          ? null
          : scenarioTransition.fromPoints[match.sourceIndex] ?? null
        const destination = match.destinationIndex === null
          ? null
          : points[match.destinationIndex] ?? null
        const sourcePosition = match.sourceIndex === null
          ? null
          : sourcePositions[match.sourceIndex] ?? null
        const destinationPosition = match.destinationIndex === null
          ? null
          : destinationPositions[match.destinationIndex] ?? null
        const outsideAnchor = destinationPosition ?? sourcePosition ?? {
          x: size.width / 2,
          y: size.height / 2,
        }
        const from = source ?? unprojectPosition(
          getOutsidePosition(
            outsideAnchor,
            size.width,
            size.height,
            index,
            false,
          ),
          sourceCamera,
          size,
        )
        const to = destination ?? unprojectPosition(
          getOutsidePosition(
            outsideAnchor,
            size.width,
            size.height,
            index,
            true,
          ),
          destinationCamera,
          size,
        )
        return {
          from,
          to,
          delay,
          fade: source === null ? 'in' : destination === null ? 'out' : null,
        }
      })
      scenarioFlightRef.current = {
        id: scenarioTransition.id,
        startTime: flightStartTime,
        duration: reduced
          ? SCENARIO_REDUCED_FADE_DURATION
          : SCENARIO_FLIGHT_DURATION + maximumDelay + SCENARIO_TRAIL_COLLAPSE_DURATION,
        reduced,
        flights,
        fromPositions: sourcePositions,
        toPositions: destinationPositions,
      }
      activeScenarioTransitionIdRef.current = scenarioTransition.id

      const pendingFit = pendingFitRef.current
      pendingFitRef.current = null
      if (pendingFit !== null) {
        if (reduced) {
          transformRef.current = pendingFit
        } else {
          cameraFlightRef.current = {
            startTime: flightStartTime,
            duration: SCENARIO_FLIGHT_DURATION + maximumDelay,
            fromZoom: sourceCamera.zoom,
            fromX: sourceCamera.x,
            fromY: sourceCamera.y,
            toZoom: pendingFit.zoom,
            toX: pendingFit.x,
            toY: pendingFit.y,
          }
        }
      }
    }
    const makeCircleVisual = (target: RadiusCircle | null): CircleVisual | null => {
      if (target === null || points[target.pointIndex] === undefined) {
        return null
      }
      const point = points[target.pointIndex]
      if (point === undefined) {
        return null
      }
      return { pointIndex: target.pointIndex, x: point.x, y: point.y, radius: target.radius }
    }
    const targetCircle = makeCircleVisual(circle)
    const drawCircle = (visual: CircleVisual | null, opacity = 1) => {
      if (visual === null || opacity <= 0 || visual.radius <= 0) return
      context.save()
      context.globalAlpha = opacity
      context.beginPath()
      context.arc(visual.x, visual.y, visual.radius, 0, Math.PI * 2)
      context.strokeStyle = colors.primary
      context.lineWidth = 1.5 / (GRID_CELL_SIZE * transformRef.current.zoom)
      context.stroke()
      context.restore()
    }

    const baseColors = points.map((_, index) =>
      renderedPointColorsRef.current[index] ?? targetColors[index] ?? colors.muted,
    )
    const startCircle = pointsChanged ? null : renderedCircleRef.current
    const startCurrentPointIndex = pointsChanged
      ? null
      : renderedCurrentPointRef.current ?? previousFrame?.currentPointIndex ?? null
    const startPulseTime = pointsChanged ? null : renderedPulseTimeRef.current
    const animateForward = frameChanged &&
      !pointsChanged &&
      previousFrame !== null &&
      frameStep === previousFrame.step + 1
    const settleStartCircle = pointsReplaced ? null : renderedCircleRef.current
    const settleStartCurrentPoint = pointsReplaced
      ? null
      : renderedCurrentPointRef.current
    const settleColorsChanged = targetColors.some(
      (targetColor, pointIndex) => (baseColors[pointIndex] ?? colors.muted) !== targetColor,
    )
    const settleCircleChanged =
      (settleStartCircle === null) !== (targetCircle === null) ||
      (settleStartCircle !== null &&
        targetCircle !== null &&
        (settleStartCircle.pointIndex !== targetCircle.pointIndex ||
          settleStartCircle.radius !== targetCircle.radius))
    const canSettle =
      !reduced &&
      frameChanged &&
      !pointsReplaced &&
      (settleColorsChanged || settleCircleChanged)
    const motionModeChanged = playbackRef.current !== null &&
      playbackRef.current.reduced !== reduced
    const existingPlayback =
      !frameChanged && !pointsChanged && !motionModeChanged
        ? playbackRef.current
        : null

    let playback = existingPlayback
    if (animateForward || (reduced && frameChanged && !pointsChanged)) {
      const colorMotions: ColorMotion[] = []
      const circleMotions: CircleMotion[] = []
      const ringMotions: RingMotion[] = []
      const currentMotions: CurrentMotion[] = []
      const probeMotions: ProbeMotion[] = []
      let duration = 0

      if (reduced) {
        targetColors.forEach((targetColor, pointIndex) => {
          const fromColor = baseColors[pointIndex] ?? targetColor
          if (fromColor !== targetColor) {
            colorMotions.push({
              pointIndex,
              fromColor,
              toColor: targetColor,
              start: 0,
              duration: 100,
              mode: 'fade',
            })
          }
        })
        duration = 100
      } else {
        let elapsed = 0
        let scheduledCurrentPoint = startCurrentPointIndex
        const plannedColors = [...baseColors]

        const scheduleColor = (
          pointIndex: number,
          toColor: string,
          start: number,
          durationMs: number,
          mode: ColorMotion['mode'] = 'blend',
        ) => {
          const fromColor = plannedColors[pointIndex] ?? colors.muted
          colorMotions.push({
            pointIndex,
            fromColor,
            toColor,
            start,
            duration: durationMs,
            mode,
          })
          plannedColors[pointIndex] = toColor
        }

        for (let eventIndex = 0; eventIndex < events.length; eventIndex += 1) {
          const event = events[eventIndex]
          const eventCaptureIntervals = captureIntervals[eventIndex]
          const eventCaptureFadeDurations = captureFadeDurations[eventIndex]
          const eventSelectionDuration = selectionDurations[eventIndex]
          const eventRadiusDuration = radiusDurations[eventIndex]
          if (
            event === undefined ||
            eventCaptureIntervals === undefined ||
            eventCaptureFadeDurations === undefined ||
            eventSelectionDuration === undefined ||
            eventRadiusDuration === undefined
          ) {
            throw new Error('Canvas frame animation plan does not match its events')
          }
          if (event.type === 'select-seed' || event.type === 'select-next') {
            const selectionDuration = eventSelectionDuration
            const clusterColor = colors.clusters[event.clusterId % colors.clusters.length] ?? colors.muted
            if (
              (frameStep === 1 || frameStep === 6) &&
              event.type === 'select-seed'
            ) {
              ringMotions.push({
                pointIndex: event.pointIndex,
                start: elapsed,
                duration: selectionDuration,
              })
            }
            scheduleColor(
              event.pointIndex,
              clusterColor,
              elapsed,
              CAPTURE_FADE_DURATION,
              'fade',
            )
            scheduledCurrentPoint = event.pointIndex
            currentMotions.push({
              start: elapsed,
              pointIndex: event.pointIndex,
              pulseStart: elapsed + selectionDuration,
            })
            elapsed += selectionDuration
            if (frameStep === 3 && event.type === 'select-next') {
              const growDuration = eventRadiusDuration
              circleMotions.push({
                pointIndex: event.pointIndex,
                fromRadius: 0,
                toRadius: r,
                start: elapsed,
                duration: growDuration,
              })
              elapsed += growDuration
            }
          } else if (event.type === 'expand') {
            const previousCircleRadius =
              frameStep === 4 && startCircle?.pointIndex === event.centerIndex
                ? startCircle.radius
                : 0
            if (previousCircleRadius < r) {
              const growDuration = eventRadiusDuration
              circleMotions.push({
                pointIndex: event.centerIndex,
                fromRadius: previousCircleRadius,
                toRadius: r,
                start: elapsed,
                duration: growDuration,
              })
              elapsed += growDuration
            }

            const clusterColor = colors.clusters[event.clusterId % colors.clusters.length] ?? colors.muted
            let captureEnd = elapsed
            event.addedIndices.forEach((pointIndex, index) => {
              if (index > 0) {
                const interval = eventCaptureIntervals[index]
                if (interval === undefined) {
                  throw new Error('Canvas capture timing is missing a point interval')
                }
                elapsed += interval
              }
              const fadeDuration = eventCaptureFadeDurations[index]
              if (fadeDuration === undefined) {
                throw new Error('Canvas capture animation plan is missing a fade duration')
              }
              scheduleColor(
                pointIndex,
                clusterColor,
                elapsed,
                fadeDuration,
                'fade',
              )
              captureEnd = Math.max(captureEnd, elapsed + fadeDuration)
            })
            elapsed = captureEnd
          } else if (event.type === 'retract-radius') {
            const retractDuration = eventRadiusDuration
            const currentRadius =
              startCircle?.pointIndex === event.pointIndex ? startCircle.radius : r
            circleMotions.push({
              pointIndex: event.pointIndex,
              fromRadius: currentRadius,
              toRadius: 0,
              start: elapsed,
              duration: retractDuration,
            })
            currentMotions.push({
              start: elapsed,
              pointIndex: scheduledCurrentPoint,
              pulseStart: null,
            })
            elapsed += retractDuration
          } else if (event.type === 'complete-group' && event.isNoise) {
            const noiseFadeDuration = NOISE_FADE_DURATION
            for (const pointIndex of event.memberIndices) {
              scheduleColor(
                pointIndex,
                assignmentColor({ kind: 'noise' }, pointIndex),
                elapsed,
                noiseFadeDuration,
                'fade',
              )
            }
            elapsed += noiseFadeDuration
            if (!event.keepCurrentPoint) {
              scheduledCurrentPoint = null
              currentMotions.push({ start: elapsed, pointIndex: null, pulseStart: null })
            }
          } else if (event.type === 'complete-group' && !event.keepCurrentPoint) {
            scheduledCurrentPoint = null
            currentMotions.push({ start: elapsed, pointIndex: null, pulseStart: null })
          } else if (event.type === 'finalize') {
            scheduledCurrentPoint = null
            currentMotions.push({ start: elapsed, pointIndex: null, pulseStart: null })
          } else if (event.type === 'noise-probe') {
            probeMotions.push({
              start: elapsed,
              duration: event.duration,
              centerIndices: event.centerIndices,
              highlightedIndices: event.highlightedIndices,
              showCircle: event.showCircle,
            })
            elapsed += event.duration
          } else if (event.type === 'noise-recolor') {
            for (const pointIndex of event.pointIndices) {
              scheduleColor(
                pointIndex,
                assignmentColor({ kind: 'noise' }, pointIndex),
                elapsed,
                NOISE_FADE_DURATION,
                'fade',
              )
            }
            elapsed += NOISE_FADE_DURATION
          }
        }

        let plannedCircle = startCircle
        for (const motion of circleMotions) {
          const point = points[motion.pointIndex]
          plannedCircle =
            motion.toRadius <= 0 || point === undefined
              ? null
              : { pointIndex: motion.pointIndex, x: point.x, y: point.y, radius: motion.toRadius }
        }
        if (targetCircle === null && plannedCircle !== null) {
          circleMotions.push({
            pointIndex: plannedCircle.pointIndex,
            fromRadius: plannedCircle.radius,
            toRadius: 0,
            start: elapsed,
            duration: RADIUS_RETRACT_DURATION,
          })
          elapsed += RADIUS_RETRACT_DURATION
        }

        duration = Math.max(elapsed, MIN_STEP_DURATION)
      }

      playback = {
        startTime: performance.now(),
        duration: Math.min(duration, MAX_STEP_ANIMATION_DURATION),
        reduced,
        colorMotions,
        circleMotions,
        ringMotions,
        currentMotions,
        probeMotions,
        startColors: baseColors,
        startCircle,
        startCurrentPointIndex,
        startPulseTime,
        targetColors,
        targetCircle,
        targetCurrentPointIndex: currentPointIndex,
      }
      playbackRef.current = playback
    } else if (canSettle) {
      const colorMotions: ColorMotion[] = targetColors.reduce(
        (motions, targetColor, pointIndex) => {
          const fromColor = baseColors[pointIndex] ?? colors.muted
          if (fromColor !== targetColor) {
            motions.push({
              pointIndex,
              fromColor,
              toColor: targetColor,
              start: 0,
              duration: PARAMETER_VISUAL_DURATION,
              mode: 'fade',
            })
          }
          return motions
        },
        [] as ColorMotion[],
      )
      const circleMotions: CircleMotion[] = []
      if (settleCircleChanged) {
        const endpoint = targetCircle ?? settleStartCircle
        if (endpoint !== null) {
          circleMotions.push({
            pointIndex: endpoint.pointIndex,
            fromRadius: settleStartCircle?.radius ?? 0,
            toRadius: targetCircle?.radius ?? 0,
            start: 0,
            duration: PARAMETER_VISUAL_DURATION,
          })
        }
      }
      const currentMotions: CurrentMotion[] = [
        {
          start: 0,
          pointIndex: currentPointIndex,
          pulseStart: currentPointIndex === null ? null : PARAMETER_VISUAL_DURATION,
        },
      ]
      playback = {
        startTime: performance.now(),
        duration: PARAMETER_VISUAL_DURATION,
        reduced: false,
        colorMotions,
        circleMotions,
        ringMotions: [],
        currentMotions,
        probeMotions: [],
        startColors: baseColors,
        startCircle: settleStartCircle,
        startCurrentPointIndex: settleStartCurrentPoint,
        startPulseTime: null,
        targetColors,
        targetCircle,
        targetCurrentPointIndex: currentPointIndex,
      }
      playbackRef.current = playback
    } else if (frameChanged || pointsChanged || motionModeChanged) {
      playback = null
      playbackRef.current = null
      if (pointsChanged) {
        renderedPointColorsRef.current = []
        renderedCircleRef.current = null
        renderedCurrentPointRef.current = null
        renderedPulseTimeRef.current = null
      } else if ((frameChanged && !animateForward) || motionModeChanged) {
        renderedPulseTimeRef.current =
          reduced || currentPointIndex === null ? null : performance.now()
      }
    }

    previousFrameRef.current = {
      assignments,
      circle,
      points,
      step: frameStep,
      currentPointIndex,
      probeHighlights,
    }

    const draw = (timestamp: number) => {
      const cameraFlight = cameraFlightRef.current
      if (cameraFlight !== null) {
        const cameraElapsed = timestamp - cameraFlight.startTime
        if (cameraElapsed >= cameraFlight.duration) {
          transformRef.current = {
            zoom: cameraFlight.toZoom,
            x: cameraFlight.toX,
            y: cameraFlight.toY,
          }
          cameraFlightRef.current = null
        } else if (cameraElapsed > 0) {
          const cameraProgress = easeInOutProgress(
            Math.min(cameraElapsed / cameraFlight.duration, 1),
          )
          const zoomLog =
            Math.log(cameraFlight.fromZoom) +
            (Math.log(cameraFlight.toZoom) - Math.log(cameraFlight.fromZoom)) * cameraProgress
          transformRef.current.zoom = Math.exp(zoomLog)
          transformRef.current.x =
            cameraFlight.fromX + (cameraFlight.toX - cameraFlight.fromX) * cameraProgress
          transformRef.current.y =
            cameraFlight.fromY + (cameraFlight.toY - cameraFlight.fromY) * cameraProgress
        }
      }

      const transform = transformRef.current
      const scale = GRID_CELL_SIZE * transform.zoom

      context.setTransform(size.pixelRatio, 0, 0, size.pixelRatio, 0, 0)
      context.clearRect(0, 0, size.width, size.height)
      context.fillStyle = colors.surface
      context.fillRect(0, 0, size.width, size.height)

      context.save()
      context.translate(size.width / 2 + transform.x, size.height / 2 + transform.y)
      context.scale(scale, scale)

      const left = (-size.width / 2 - transform.x) / scale
      const right = (size.width / 2 - transform.x) / scale
      const top = (-size.height / 2 - transform.y) / scale
      const bottom = (size.height / 2 - transform.y) / scale
      context.beginPath()
      context.strokeStyle = colors.grid
      context.lineWidth = 1 / scale
      for (let x = Math.floor(left); x <= Math.ceil(right); x += 1) {
        context.moveTo(x, top)
        context.lineTo(x, bottom)
      }
      for (let y = Math.floor(top); y <= Math.ceil(bottom); y += 1) {
        context.moveTo(left, y)
        context.lineTo(right, y)
      }
      context.stroke()

      const scenarioFlight = scenarioFlightRef.current
      if (
        scenarioFlight !== null &&
        timestamp - scenarioFlight.startTime < scenarioFlight.duration
      ) {
        const flightElapsed = Math.max(timestamp - scenarioFlight.startTime, 0)
        const flightRadius = POINT_RADIUS * scale
        const bandWidth = flightRadius * 2
        context.setTransform(size.pixelRatio, 0, 0, size.pixelRatio, 0, 0)

        if (scenarioFlight.reduced) {
          const progress = Math.min(flightElapsed / scenarioFlight.duration, 1)
          const oldOpacity = 1 - progress
          const newOpacity = progress
          context.fillStyle = colors.muted
          context.globalAlpha = oldOpacity
          context.beginPath()
          scenarioFlight.fromPositions.forEach((position) => {
            context.moveTo(position.x + flightRadius, position.y)
            context.arc(position.x, position.y, flightRadius, 0, Math.PI * 2)
          })
          context.fill()
          context.globalAlpha = newOpacity
          context.beginPath()
          scenarioFlight.toPositions.forEach((position) => {
            context.moveTo(position.x + flightRadius, position.y)
            context.arc(position.x, position.y, flightRadius, 0, Math.PI * 2)
          })
          context.fill()
          context.globalAlpha = 1
          context.restore()
          return
        }

        const { flights } = scenarioFlight
        const centerX = size.width / 2 + transform.x
        const centerY = size.height / 2 + transform.y
        const segmentEpsilon = TRAIL_MIN_SCREEN_TRAVEL / scale
        const viewMargin = TRAIL_MAX_LENGTH_WORLD * scale + TRAIL_VIEWPORT_MARGIN
        const viewRight = size.width + viewMargin
        const viewBottom = size.height + viewMargin

        let movingCount = 0
        for (const flight of flights) {
          const segmentX = flight.to.x - flight.from.x
          const segmentY = flight.to.y - flight.from.y
          if (segmentX * segmentX + segmentY * segmentY >= segmentEpsilon * segmentEpsilon) {
            movingCount += 1
          }
        }
        const useBand = movingCount > TRAIL_MEDIUM_LIMIT
        const trailLayers = useBand
          ? null
          : movingCount > TRAIL_SMALL_LIMIT
            ? trailLayersMedium
            : trailLayersSmall

        const collapseWindow = Math.max(
          scenarioFlight.duration - SCENARIO_FLIGHT_DURATION - SCENARIO_TRAIL_COLLAPSE_DURATION,
          0,
        )
        const collapse = flightElapsed > SCENARIO_FLIGHT_DURATION
          ? Math.min(
              (flightElapsed - SCENARIO_FLIGHT_DURATION) /
                (collapseWindow + SCENARIO_TRAIL_COLLAPSE_DURATION),
              1,
            )
          : 0
        const collapseEase = easeInOutProgress(collapse)
        const collapseAlpha = 1 - collapseEase
        const collapseShrink = 1 - collapseEase

        if (!useBand && trailLayers !== null) {
          for (let layerIndex = trailLayers.length - 1; layerIndex >= 0; layerIndex -= 1) {
            const layer = trailLayers[layerIndex]
            const lag = (layerIndex + 1) / trailLayers.length
            const copyRadius = POINT_RADIUS * layer.scale * scale
            if (!Number.isFinite(copyRadius) || copyRadius <= 0) {
              continue
            }

            if (collapse > 0) {
              context.globalAlpha = collapseAlpha
              context.fillStyle = layer.color
              context.beginPath()
              for (const flight of flights) {
                const eased = getFlightProgress(flight, flightElapsed)
                if (getFlightOpacity(flight, eased) !== 1 || eased < 1) {
                  continue
                }
                const segmentX = flight.to.x - flight.from.x
                const segmentY = flight.to.y - flight.from.y
                if (
                  !Number.isFinite(segmentX) ||
                  !Number.isFinite(segmentY) ||
                  segmentX * segmentX + segmentY * segmentY < segmentEpsilon * segmentEpsilon
                ) {
                  continue
                }
                const progress = getCopyProgress(flight, 1, lag, collapseShrink)
                const screenX = centerX + (flight.from.x + segmentX * progress) * scale
                const screenY = centerY + (flight.from.y + segmentY * progress) * scale
                if (screenX < -viewMargin || screenX > viewRight || screenY < -viewMargin || screenY > viewBottom) {
                  continue
                }
                context.moveTo(screenX + copyRadius, screenY)
                context.arc(screenX, screenY, copyRadius, 0, Math.PI * 2)
              }
              context.fill()
              context.globalAlpha = 1
            }

            context.fillStyle = layer.color
            context.beginPath()
            for (const flight of flights) {
              const eased = getFlightProgress(flight, flightElapsed)
              if (getFlightOpacity(flight, eased) !== 1 || eased >= 1 || eased <= 0) {
                continue
              }
              const segmentX = flight.to.x - flight.from.x
              const segmentY = flight.to.y - flight.from.y
              if (
                !Number.isFinite(segmentX) ||
                !Number.isFinite(segmentY) ||
                segmentX * segmentX + segmentY * segmentY < segmentEpsilon * segmentEpsilon
              ) {
                continue
              }
              const progress = getCopyProgress(flight, eased, lag, 1)
              const screenX = centerX + (flight.from.x + segmentX * progress) * scale
              const screenY = centerY + (flight.from.y + segmentY * progress) * scale
              if (screenX < -viewMargin || screenX > viewRight || screenY < -viewMargin || screenY > viewBottom) {
                continue
              }
              context.moveTo(screenX + copyRadius, screenY)
              context.arc(screenX, screenY, copyRadius, 0, Math.PI * 2)
            }
            context.fill()
          }
        } else if (useBand) {
          context.lineWidth = bandWidth
          const drawBandPass = (
            fromLag: number,
            toLag: number,
            color: string,
            shrink: number,
            arrivedOnly: boolean,
            roundCap: boolean,
          ) => {
            context.beginPath()
            for (const flight of flights) {
              const eased = getFlightProgress(flight, flightElapsed)
              if (getFlightOpacity(flight, eased) !== 1) {
                continue
              }
              if (arrivedOnly ? eased < 1 : eased >= 1 || eased <= 0) {
                continue
              }
              const segmentX = flight.to.x - flight.from.x
              const segmentY = flight.to.y - flight.from.y
              if (
                !Number.isFinite(segmentX) ||
                !Number.isFinite(segmentY) ||
                segmentX * segmentX + segmentY * segmentY < segmentEpsilon * segmentEpsilon
              ) {
                continue
              }
              const fromProgress = getCopyProgress(flight, eased, fromLag, shrink)
              const toProgress = getCopyProgress(flight, eased, toLag, shrink)
              const fromX = centerX + (flight.from.x + segmentX * fromProgress) * scale
              const fromY = centerY + (flight.from.y + segmentY * fromProgress) * scale
              const toX = centerX + (flight.from.x + segmentX * toProgress) * scale
              const toY = centerY + (flight.from.y + segmentY * toProgress) * scale
              if (
                (fromX < -viewMargin && toX < -viewMargin) ||
                (fromX > viewRight && toX > viewRight) ||
                (fromY < -viewMargin && toY < -viewMargin) ||
                (fromY > viewBottom && toY > viewBottom)
              ) {
                continue
              }
              context.moveTo(fromX, fromY)
              context.lineTo(toX, toY)
            }
            context.lineCap = roundCap ? 'round' : 'butt'
            context.strokeStyle = color
            context.globalAlpha = shrink < 1 ? collapseAlpha : 1
            context.stroke()
            context.globalAlpha = 1
          }
          drawBandPass(1, 0.5, trailBandColors[1], 1, false, false)
          drawBandPass(1, 0.5, trailBandColors[1], collapseShrink, true, false)
          drawBandPass(0.5, 0, trailBandColors[0], 1, false, true)
          drawBandPass(0.5, 0, trailBandColors[0], collapseShrink, true, true)
        }

        context.globalAlpha = 1
        context.fillStyle = colors.muted
        context.beginPath()
        for (const flight of flights) {
          const eased = getFlightProgress(flight, flightElapsed)
          if (getFlightOpacity(flight, eased) !== 1) {
            continue
          }
          const segmentX = flight.to.x - flight.from.x
          const segmentY = flight.to.y - flight.from.y
          if (!Number.isFinite(segmentX) || !Number.isFinite(segmentY)) {
            continue
          }
          const headX = centerX + (flight.from.x + segmentX * eased) * scale
          const headY = centerY + (flight.from.y + segmentY * eased) * scale
          if (headX < -viewMargin || headX > viewRight || headY < -viewMargin || headY > viewBottom) {
            continue
          }
          context.moveTo(headX + flightRadius, headY)
          context.arc(headX, headY, flightRadius, 0, Math.PI * 2)
        }
        context.fill()

        for (const flight of flights) {
          const eased = getFlightProgress(flight, flightElapsed)
          const opacity = getFlightOpacity(flight, eased)
          if (opacity <= 0 || opacity === 1) {
            continue
          }
          const segmentX = flight.to.x - flight.from.x
          const segmentY = flight.to.y - flight.from.y
          if (!Number.isFinite(segmentX) || !Number.isFinite(segmentY)) {
            continue
          }
          const headX = centerX + (flight.from.x + segmentX * eased) * scale
          const headY = centerY + (flight.from.y + segmentY * eased) * scale
          if (headX < -viewMargin || headX > viewRight || headY < -viewMargin || headY > viewBottom) {
            continue
          }
          context.globalAlpha = opacity
          context.beginPath()
          context.arc(headX, headY, flightRadius, 0, Math.PI * 2)
          context.fillStyle = colors.muted
          context.fill()
          const segmentLength = Math.sqrt(segmentX * segmentX + segmentY * segmentY)
          if (eased > 0 && segmentLength >= segmentEpsilon) {
            const trailLimit = Math.min(TRAIL_MAX_LENGTH_WORLD / segmentLength, eased)
            const far = eased - collapseShrink * trailLimit
            const mid = eased - 0.5 * collapseShrink * trailLimit
            const farX = centerX + (flight.from.x + segmentX * far) * scale
            const farY = centerY + (flight.from.y + segmentY * far) * scale
            const midX = centerX + (flight.from.x + segmentX * mid) * scale
            const midY = centerY + (flight.from.y + segmentY * mid) * scale
            context.lineWidth = bandWidth
            context.lineCap = 'butt'
            context.strokeStyle = trailBandColors[1]
            context.beginPath()
            context.moveTo(farX, farY)
            context.lineTo(midX, midY)
            context.stroke()
            context.lineCap = 'round'
            context.strokeStyle = trailBandColors[0]
            context.beginPath()
            context.moveTo(midX, midY)
            context.lineTo(headX, headY)
            context.stroke()
          }
        }
        context.globalAlpha = 1
        context.restore()
        return
      }

      const activePlayback = playbackRef.current
      const elapsed = activePlayback === null
        ? 0
        : Math.min(timestamp - activePlayback.startTime, activePlayback.duration)
      let visibleColors: readonly string[] = targetColors
      let visibleCircle = targetCircle
      let visibleCurrentPoint = currentPointIndex
      let pulseTime: number | null = reduced ? null : timestamp
      let ring: { pointIndex: number; radius: number; opacity: number } | null = null
      const pointOverlays = new Map<number, { color: string; opacity: number }>()
      const pointOutlines = new Map<number, number>(
        probeHighlights.map((pointIndex) => [pointIndex, 1]),
      )
      const persistentProbeHighlights = new Set(probeHighlights)

      if (activePlayback !== null && elapsed < activePlayback.duration) {
        const animatedColors = [...activePlayback.startColors]
        for (const motion of activePlayback.colorMotions) {
          if (elapsed < motion.start) {
            continue
          }
          const progress = motion.duration <= 0
            ? 1
            : Math.min((elapsed - motion.start) / motion.duration, 1)
          const eased = motion.mode === 'fade'
            ? easeInOutProgress(progress)
            : easeStepProgress(progress)
          if (motion.mode === 'fade' && progress < 1) {
            animatedColors[motion.pointIndex] = motion.fromColor
            pointOverlays.set(motion.pointIndex, {
              color: motion.toColor,
              opacity: eased,
            })
          } else {
            animatedColors[motion.pointIndex] = mixHexColor(
              motion.fromColor,
              motion.toColor,
              eased,
            )
          }
        }
        visibleColors = animatedColors

        if (activePlayback.reduced) {
          const progress = activePlayback.duration === 0
            ? 1
            : elapsed / activePlayback.duration
          drawCircle(activePlayback.startCircle, 1 - progress)
          drawCircle(activePlayback.targetCircle, progress)
          visibleCircle = progress >= 1
            ? activePlayback.targetCircle
            : activePlayback.startCircle
          visibleCurrentPoint = activePlayback.targetCurrentPointIndex
          pulseTime = null
        } else {
          let circleState = activePlayback.startCircle
          for (const motion of activePlayback.circleMotions) {
            if (elapsed < motion.start) {
              break
            }
            const progress = motion.duration <= 0
              ? 1
              : Math.min((elapsed - motion.start) / motion.duration, 1)
            const point = points[motion.pointIndex]
            if (point === undefined) {
              continue
            }
            const radius = motion.fromRadius +
              (motion.toRadius - motion.fromRadius) * easeInOutProgress(progress)
            circleState = radius <= 0
              ? null
              : { pointIndex: motion.pointIndex, x: point.x, y: point.y, radius }
            if (progress < 1) {
              break
            }
          }
          if (elapsed >= activePlayback.duration) {
            circleState = activePlayback.targetCircle
          }
          visibleCircle = circleState

          visibleCurrentPoint = activePlayback.startCurrentPointIndex
          pulseTime = activePlayback.startPulseTime
          for (const motion of activePlayback.currentMotions) {
            if (elapsed < motion.start) {
              break
            }
            visibleCurrentPoint = motion.pointIndex
            pulseTime = motion.pulseStart === null || elapsed < motion.pulseStart
              ? null
              : activePlayback.startTime + motion.pulseStart
          }

          for (const motion of activePlayback.probeMotions) {
            if (elapsed < motion.start || elapsed > motion.start + motion.duration) {
              continue
            }
            const progress = motion.duration <= 0
              ? 1
              : Math.min((elapsed - motion.start) / motion.duration, 1)
            if (motion.showCircle && motion.centerIndices.length > 0) {
              const pathPosition = progress * (motion.centerIndices.length - 1)
              const pathIndex = Math.floor(pathPosition)
              const fromIndex = motion.centerIndices[pathIndex]
              const toIndex = motion.centerIndices[
                Math.min(pathIndex + 1, motion.centerIndices.length - 1)
              ]
              const fromPoint = fromIndex === undefined ? undefined : points[fromIndex]
              const toPoint = toIndex === undefined ? undefined : points[toIndex]
              if (fromPoint !== undefined && toPoint !== undefined) {
                const segmentProgress = pathPosition - pathIndex
                visibleCircle = {
                  pointIndex: fromIndex,
                  x: fromPoint.x + (toPoint.x - fromPoint.x) * segmentProgress,
                  y: fromPoint.y + (toPoint.y - fromPoint.y) * segmentProgress,
                  radius: r,
                }
              }
            } else if (!motion.showCircle && startCircle !== null) {
              visibleCircle = {
                ...startCircle,
                radius: startCircle.radius * (1 - progress),
              }
            }
            const opacity = 1 - easeStepProgress(progress)
            for (const pointIndex of motion.highlightedIndices) {
              if (persistentProbeHighlights.has(pointIndex)) {
                continue
              }
              pointOutlines.set(pointIndex, opacity)
            }
          }

          for (const motion of activePlayback.ringMotions) {
            if (elapsed < motion.start || elapsed > motion.start + motion.duration) {
              continue
            }
            const progress = motion.duration <= 0
              ? 1
              : (elapsed - motion.start) / motion.duration
            ring = {
              pointIndex: motion.pointIndex,
              radius: POINT_RADIUS * (4.5 - 3.5 * easeInOutProgress(progress)),
              opacity: 0.9 * (1 - easeInOutProgress(progress)),
            }
          }
        }
      } else if (activePlayback !== null) {
        visibleColors = activePlayback.targetColors
        visibleCircle = activePlayback.targetCircle
        visibleCurrentPoint = activePlayback.targetCurrentPointIndex
        if (!activePlayback.reduced && visibleCurrentPoint !== null) {
          pulseTime = activePlayback.currentMotions.reduce(
            (last, motion) => motion.pointIndex === visibleCurrentPoint && motion.pulseStart !== null
              ? activePlayback.startTime + motion.pulseStart
              : last,
            activePlayback.startPulseTime,
          )
        } else {
          pulseTime = null
        }
      } else {
        visibleColors = targetColors
        visibleCircle = targetCircle
        visibleCurrentPoint = currentPointIndex
        pulseTime = reduced ? null : renderedPulseTimeRef.current ?? timestamp
      }

      if (activePlayback === null || !activePlayback.reduced || elapsed >= activePlayback.duration) {
        drawCircle(visibleCircle)
      }

      points.forEach((point, index) => {
        if (index === visibleCurrentPoint) {
          return
        }
        context.beginPath()
        context.arc(point.x, point.y, POINT_RADIUS, 0, Math.PI * 2)
        context.fillStyle = visibleColors[index] ?? colors.muted
        context.fill()
        const overlay = pointOverlays.get(index)
        if (overlay !== undefined) {
          context.save()
          context.globalAlpha = overlay.opacity
          context.fillStyle = overlay.color
          context.fill()
          context.restore()
        }
        const outlineOpacity = pointOutlines.get(index) ?? 0
        if (outlineOpacity > 0) {
          context.save()
          context.globalAlpha = outlineOpacity
          context.beginPath()
          context.arc(point.x, point.y, POINT_RADIUS * 1.8, 0, Math.PI * 2)
          context.strokeStyle = colors.primary
          context.lineWidth = 2 / (GRID_CELL_SIZE * transformRef.current.zoom)
          context.stroke()
          context.restore()
        }
      })

      const currentPoint = visibleCurrentPoint === null
        ? undefined
        : points[visibleCurrentPoint]
      if (currentPoint !== undefined && visibleCurrentPoint !== null) {
        if (ring !== null) {
          const ringPoint = points[ring.pointIndex]
          if (ringPoint !== undefined) {
            context.save()
            context.beginPath()
            context.arc(ringPoint.x, ringPoint.y, ring.radius, 0, Math.PI * 2)
            context.globalAlpha = ring.opacity * 0.45
            context.strokeStyle = colors.text
            context.lineWidth = 4 / (GRID_CELL_SIZE * transformRef.current.zoom)
            context.stroke()
            context.globalAlpha = ring.opacity
            context.beginPath()
            context.arc(ringPoint.x, ringPoint.y, ring.radius, 0, Math.PI * 2)
            context.strokeStyle = colors.pulse
            context.lineWidth = 2 / (GRID_CELL_SIZE * transformRef.current.zoom)
            context.stroke()
            context.restore()
          }
        }

        let currentPointRadius = POINT_RADIUS
        if (!reduced && pulseTime !== null) {
          const pulseElapsed = Math.max(timestamp - pulseTime, 0)
          const phase = (pulseElapsed % PULSE_CYCLE_DURATION) / PULSE_CYCLE_DURATION
          const pulseProgress = (1 - Math.cos(phase * Math.PI * 2)) / 2
          currentPointRadius *= 1 + 0.5 * pulseProgress
        }

        if (reduced) {
          context.save()
          context.globalAlpha = 0.38
          context.beginPath()
          context.arc(currentPoint.x, currentPoint.y, POINT_RADIUS * 7.5, 0, Math.PI * 2)
          context.strokeStyle = colors.text
          context.lineWidth = 5 / (GRID_CELL_SIZE * transformRef.current.zoom)
          context.stroke()
          context.globalAlpha = 0.92
          context.beginPath()
          context.arc(currentPoint.x, currentPoint.y, POINT_RADIUS * 7.5, 0, Math.PI * 2)
          context.strokeStyle = colors.pulse
          context.lineWidth = 3 / (GRID_CELL_SIZE * transformRef.current.zoom)
          context.stroke()
          context.restore()
        }
        context.beginPath()
        context.arc(currentPoint.x, currentPoint.y, currentPointRadius, 0, Math.PI * 2)
        context.fillStyle = visibleColors[visibleCurrentPoint] ?? colors.muted
        context.fill()
        const overlay = pointOverlays.get(visibleCurrentPoint)
        if (overlay !== undefined) {
          context.save()
          context.globalAlpha = overlay.opacity
          context.fillStyle = overlay.color
          context.fill()
          context.restore()
        }
      }

      visibleColors.forEach((color, index) => {
        renderedPointColorsRef.current[index] = color ?? colors.muted
      })
      renderedCircleRef.current = visibleCircle
      renderedCurrentPointRef.current = visibleCurrentPoint
      renderedPulseTimeRef.current = pulseTime

      context.restore()
    }

    if (playback === null && !reduced && currentPointIndex !== null) {
      playbackRef.current = null
    }

    draw(performance.now())
    const activePlayback = playbackRef.current
    const needsPulse = !reduced && renderedCurrentPointRef.current !== null
    const needsScenarioTransition =
      scenarioFlightRef.current !== null || cameraFlightRef.current !== null
    if (activePlayback !== null || needsPulse || needsScenarioTransition) {
      const animate = (timestamp: number) => {
        draw(timestamp)
        const currentScenarioFlight = scenarioFlightRef.current
        if (currentScenarioFlight !== null) {
          if (timestamp - currentScenarioFlight.startTime < currentScenarioFlight.duration) {
            animationFrameRef.current = requestAnimationFrame(animate)
            return
          }
          scenarioFlightRef.current = null
          interactionRef.current.onScenarioTransitionComplete(currentScenarioFlight.id)
          draw(timestamp)
        }
        const currentCameraFlight = cameraFlightRef.current
        if (currentCameraFlight !== null) {
          if (timestamp - currentCameraFlight.startTime < currentCameraFlight.duration) {
            animationFrameRef.current = requestAnimationFrame(animate)
            return
          }
          cameraFlightRef.current = null
        }
        const currentPlayback = playbackRef.current
        if (
          currentPlayback !== null &&
          timestamp - currentPlayback.startTime < currentPlayback.duration
        ) {
          animationFrameRef.current = requestAnimationFrame(animate)
          return
        }
        if (currentPlayback !== null) {
          playbackRef.current = null
          draw(timestamp)
        }
        if (!reduced && renderedCurrentPointRef.current !== null) {
          animationFrameRef.current = requestAnimationFrame(animate)
        } else {
          animationFrameRef.current = null
        }
      }
      if (
        (activePlayback !== null && activePlayback.duration > 0) ||
        needsPulse ||
        needsScenarioTransition
      ) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        playbackRef.current = null
      }
    } else {
      playbackRef.current = null
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [
    assignments,
    circle,
    probeHighlights,
    captureIntervals,
    captureFadeDurations,
    selectionDurations,
    radiusDurations,
    currentPointIndex,
    events,
    frameStep,
    points,
    r,
    reduced,
    revision,
    scenarioTransition,
    size,
  ])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) {
      return
    }

    const pointers = new Map<number, Position>()
    let previousPan: Position | null = null
    let middlePanPointerId: number | null = null
    let previousPinch: ReturnType<typeof getPinchState> = null
    let previousDrawPosition: Point | null = null
    let previousErasePosition: Point | null = null
    let drawRemainder = 0
    let eraseRemainder = 0

    const localPosition = (event: PointerEvent | WheelEvent): Position => {
      const bounds = canvas.getBoundingClientRect()
      return { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
    }

    const worldPosition = (position: Position): Point => {
      const view = transformRef.current
      const scale = GRID_CELL_SIZE * view.zoom
      return {
        x: (position.x - size.width / 2 - view.x) / scale,
        y: (position.y - size.height / 2 - view.y) / scale,
      }
    }

    const addPoint = (point: Point) => {
      if (pointCountRef.current >= POINT_LIMIT) {
        if (!limitToastShownRef.current) {
          limitToastShownRef.current = true
          interactionRef.current.onPointLimitReached()
        }
        return
      }
      pointCountRef.current += 1
      interactionRef.current.onPointAdd(point)
    }

    const eraseAt = (position: Point) => {
      const erasedPoints = pointsRef.current.filter(
        (point) => Math.hypot(point.x - position.x, point.y - position.y) <= ERASE_RADIUS,
      )
      if (erasedPoints.length > 0) {
        interactionRef.current.onPointsErase(erasedPoints)
      }
    }

    const zoomAt = (factor: number, anchor: Position) => {
      cameraFlightRef.current = null
      const view = transformRef.current
      const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, view.zoom * factor))
      const oldScale = GRID_CELL_SIZE * view.zoom
      const nextScale = GRID_CELL_SIZE * nextZoom
      const worldX = (anchor.x - size.width / 2 - view.x) / oldScale
      const worldY = (anchor.y - size.height / 2 - view.y) / oldScale
      view.zoom = nextZoom
      view.x = anchor.x - size.width / 2 - worldX * nextScale
      view.y = anchor.y - size.height / 2 - worldY * nextScale
    }

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      zoomAt(Math.exp(-event.deltaY * 0.001), localPosition(event))
      setRevision((value) => value + 1)
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button === 1) {
        event.preventDefault()
        const position = localPosition(event)
        pointers.set(event.pointerId, position)
        canvas.setPointerCapture(event.pointerId)
        middlePanPointerId = event.pointerId
        previousPan = position
        setIsPanning(true)
        return
      }
      if (event.pointerType === 'mouse' && event.button !== 0) {
        return
      }
      const position = localPosition(event)
      pointers.set(event.pointerId, position)
      canvas.setPointerCapture(event.pointerId)
      if (pointers.size >= 2) {
        previousPinch = getPinchState(pointers)
        previousPan = null
        setIsPanning(false)
        return
      }

      const tool = interactionRef.current.activeTool
      const point = worldPosition(position)
      if (tool === 'draw') {
        addPoint(point)
        previousDrawPosition = point
        drawRemainder = 0
      } else if (tool === 'erase') {
        eraseAt(point)
        previousErasePosition = point
        eraseRemainder = 0
      } else {
        previousPan = position
        setIsPanning(true)
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!pointers.has(event.pointerId)) {
        return
      }
      const position = localPosition(event)
      pointers.set(event.pointerId, position)

      if (event.pointerId === middlePanPointerId && previousPan !== null) {
        cameraFlightRef.current = null
        transformRef.current.x += position.x - previousPan.x
        transformRef.current.y += position.y - previousPan.y
        previousPan = position
        setRevision((value) => value + 1)
        return
      }

      if (pointers.size >= 2) {
        const nextPinch = getPinchState(pointers)
        if (nextPinch !== null && previousPinch !== null) {
          if (previousPinch.distance > 0) {
            zoomAt(nextPinch.distance / previousPinch.distance, previousPinch.center)
          }
          transformRef.current.x += nextPinch.center.x - previousPinch.center.x
          transformRef.current.y += nextPinch.center.y - previousPinch.center.y
          setRevision((value) => value + 1)
        }
        previousPinch = nextPinch
        return
      }

      const tool = interactionRef.current.activeTool
      const point = worldPosition(position)
      if (tool === 'draw') {
        if (previousDrawPosition === null) {
          addPoint(point)
          drawRemainder = 0
        } else {
          const samples = samplePathSegment(
            previousDrawPosition,
            point,
            DRAW_SPACING,
            drawRemainder,
          )
          samples.points.forEach(addPoint)
          drawRemainder = samples.remainder
        }
        previousDrawPosition = point
      } else if (tool === 'erase') {
        if (previousErasePosition === null) {
          eraseAt(point)
          eraseRemainder = 0
        } else {
          const samples = samplePathSegment(
            previousErasePosition,
            point,
            ERASE_SPACING,
            eraseRemainder,
          )
          samples.points.forEach(eraseAt)
          eraseRemainder = samples.remainder
        }
        previousErasePosition = point
      } else if (previousPan !== null) {
        cameraFlightRef.current = null
        transformRef.current.x += position.x - previousPan.x
        transformRef.current.y += position.y - previousPan.y
        previousPan = position
        setRevision((value) => value + 1)
      }
    }

    const onPointerEnd = (event: PointerEvent) => {
      pointers.delete(event.pointerId)
      if (event.pointerId === middlePanPointerId) {
        middlePanPointerId = null
        previousPan = null
        setIsPanning(false)
        return
      }
      previousPinch = null
      previousPan = null
      const remainingPosition = [...pointers.values()][0]
      if (remainingPosition !== undefined && pointers.size === 1) {
        if (interactionRef.current.activeTool === null) {
          previousPan = remainingPosition
        } else {
          const remainingPoint = worldPosition(remainingPosition)
          previousDrawPosition = remainingPoint
          previousErasePosition = remainingPoint
        }
      } else {
        previousDrawPosition = null
        previousErasePosition = null
        drawRemainder = 0
        eraseRemainder = 0
      }
      setIsPanning(false)
    }

    const onAuxClick = (event: MouseEvent) => {
      if (event.button === 1) {
        event.preventDefault()
      }
    }

    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerEnd)
    canvas.addEventListener('pointercancel', onPointerEnd)
    canvas.addEventListener('lostpointercapture', onPointerEnd)
    canvas.addEventListener('auxclick', onAuxClick)

    return () => {
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerEnd)
      canvas.removeEventListener('pointercancel', onPointerEnd)
      canvas.removeEventListener('lostpointercapture', onPointerEnd)
      canvas.removeEventListener('auxclick', onAuxClick)
    }
  }, [size.height, size.width])

  return (
    <canvas
      ref={canvasRef}
      className={`canvas-view${activeTool === null ? '' : ' tool-active'}${isPanning ? ' is-panning' : ''}`}
      aria-hidden="true"
    />
  )
}