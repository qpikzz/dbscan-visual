import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { POINT_LIMIT } from '../dbscan/constants'
import type { ScenarioId } from '../../data'
import type { Assignment, Point, RadiusCircle } from '../dbscan/types'
import { useMotionSettings } from '../../hooks/useMotionSettings'
import { samplePathSegment } from './drawing'

type CanvasViewProps = {
  scenario: ScenarioId
  points: readonly Point[]
  assignments: readonly Assignment[]
  circle: RadiusCircle | null
  activeTool: 'draw' | 'erase' | null
  onPointAdd: (point: Point) => void
  onPointsErase: (points: readonly Point[]) => void
  onPointLimitReached: () => void
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

type Position = {
  x: number
  y: number
}

type CanvasFrameSnapshot = {
  assignments: readonly Assignment[]
  circle: RadiusCircle | null
  points: readonly Point[]
}

type CircleVisual = {
  x: number
  y: number
  radius: number
  opacity: number
}

type FrameTransition = {
  pointColors: readonly string[]
  circles: readonly CircleVisual[]
  startTime: number
}

const GRID_CELL_SIZE = 32
const MIN_ZOOM = 0.1
const MAX_ZOOM = 8
const FIT_PADDING = 40
const POINT_RADIUS = 0.14
const DRAW_SPACING = 0.45
const ERASE_SPACING = 0.14
const ERASE_RADIUS = 0.3

function easeStepProgress(progress: number): number {
  let lowerBound = 0
  let upperBound = 1

  for (let iteration = 0; iteration < 8; iteration += 1) {
    const parameter = (lowerBound + upperBound) / 2
    const inverse = 1 - parameter
    const xPosition =
      3 * inverse ** 2 * parameter * 0.22 +
      3 * inverse * parameter ** 2 * 0.36 +
      parameter ** 3
    if (xPosition < progress) {
      lowerBound = parameter
    } else {
      upperBound = parameter
    }
  }

  const parameter = (lowerBound + upperBound) / 2
  return 3 * parameter * (1 - parameter) + parameter ** 3
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

export function CanvasView({
  scenario,
  points,
  assignments,
  circle,
  activeTool,
  onPointAdd,
  onPointsErase,
  onPointLimitReached,
}: CanvasViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const transformRef = useRef<ViewTransform>({ zoom: 1, x: 0, y: 0 })
  const fittedScenarioRef = useRef<ScenarioId | null>(null)
  const pointsRef = useRef(points)
  const pointCountRef = useRef(points.length)
  const limitToastShownRef = useRef(false)
  const previousFrameRef = useRef<CanvasFrameSnapshot | null>(null)
  const transitionRef = useRef<FrameTransition | null>(null)
  const renderedPointColorsRef = useRef<string[]>([])
  const renderedCirclesRef = useRef<CircleVisual[]>([])
  const animationFrameRef = useRef<number | null>(null)
  const interactionRef = useRef({
    activeTool,
    onPointAdd,
    onPointsErase,
    onPointLimitReached,
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
    if (size.width === 0 || size.height === 0 || fittedScenarioRef.current === scenario) {
      return
    }
    fittedScenarioRef.current = scenario

    if (points.length === 0) {
      transformRef.current = { zoom: 1, x: 0, y: 0 }
      setRevision((value) => value + 1)
      return
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

    transformRef.current = {
      zoom: Math.max(MIN_ZOOM, zoom),
      x: -centerX * scale,
      y: -centerY * scale,
    }
    setRevision((value) => value + 1)
  }, [points, scenario, size.height, size.width])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (canvas === null || context === null || context === undefined || size.width === 0 || size.height === 0) {
      return
    }

    const previousFrame = previousFrameRef.current
    const pointsChanged = previousFrame !== null && previousFrame.points !== points
    const frameChanged = previousFrame !== null &&
      (previousFrame.assignments !== assignments || previousFrame.circle !== circle)

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (frameChanged && !pointsChanged && previousFrame !== null) {
      transitionRef.current = {
        pointColors: [...renderedPointColorsRef.current],
        circles: [...renderedCirclesRef.current],
        startTime: performance.now(),
      }
    } else if (pointsChanged) {
      transitionRef.current = null
      renderedPointColorsRef.current = []
      renderedCirclesRef.current = []
    }

    previousFrameRef.current = { assignments, circle, points }

    const transition = transitionRef.current
    const duration = reduced ? 100 : 600
    const colors = {
      surface: getThemeColor(canvas, '--surface'),
      grid: getThemeColor(canvas, '--grid'),
      muted: getThemeColor(canvas, '--text-muted'),
      noise: Array.from({ length: 5 }, (_, index) =>
        getThemeColor(canvas, `--noise-${index + 1}`),
      ),
      primary: getThemeColor(canvas, '--primary'),
      clusters: Array.from({ length: 6 }, (_, index) =>
        getThemeColor(canvas, `--cluster-${index + 1}`),
      ),
    }
    const assignmentColor = (assignment: Assignment | undefined, point: Point, index: number) => {
      if (assignment?.kind === 'noise') {
        const noiseIndex = Math.abs(
          Math.imul(Math.round(point.x * 1000), 31) ^ Math.round(point.y * 1000) ^ index,
        ) % colors.noise.length
        return colors.noise[noiseIndex] ?? colors.noise[0] ?? colors.muted
      }
      if (assignment?.kind === 'cluster') {
        return colors.clusters[assignment.clusterId % colors.clusters.length] ?? colors.muted
      }
      return colors.muted
    }
    const targetColors = points.map((point, index) =>
      assignmentColor(assignments[index], point, index),
    )
    const fromColors = transition?.pointColors ?? targetColors
    const targetCircle = circle === null ? null : points[circle.pointIndex]
    const targetCircleVisual =
      circle !== null && targetCircle !== null && targetCircle !== undefined
        ? { x: targetCircle.x, y: targetCircle.y, radius: circle.radius, opacity: 1 }
        : null

    const drawCircle = (
      targetCircle: CircleVisual | null,
      opacity: number,
    ) => {
      if (targetCircle === null || opacity <= 0) return
      const visual = { ...targetCircle, opacity }
      renderedCirclesRef.current.push(visual)

      context.save()
      context.globalAlpha = opacity
      context.beginPath()
      context.arc(
        visual.x,
        visual.y,
        visual.radius,
        0,
        Math.PI * 2,
      )
      context.strokeStyle = colors.primary
      context.lineWidth = 1.5 / (GRID_CELL_SIZE * transformRef.current.zoom)
      context.stroke()
      context.restore()
    }

    const draw = (progress: number) => {
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

      renderedCirclesRef.current = []
      if (transition === null) {
        drawCircle(targetCircleVisual, 1)
      } else if (
        reduced &&
        transition.circles.length === 1 &&
        targetCircleVisual !== null &&
        transition.circles[0]?.x === targetCircleVisual.x &&
        transition.circles[0]?.y === targetCircleVisual.y &&
        transition.circles[0]?.radius === targetCircleVisual.radius
      ) {
        const previousCircle = transition.circles[0]
        if (previousCircle !== undefined) {
          drawCircle(
            targetCircleVisual,
            previousCircle.opacity + (1 - previousCircle.opacity) * progress,
          )
        }
      } else if (reduced) {
        transition.circles.forEach((previousCircle) =>
          drawCircle(previousCircle, previousCircle.opacity * (1 - progress)),
        )
        drawCircle(targetCircleVisual, progress)
      } else if (transition.circles.length === 1 && targetCircleVisual !== null) {
        const fromCircle = transition.circles[0]
        if (fromCircle !== undefined) {
          drawCircle(
            {
              x: fromCircle.x + (targetCircleVisual.x - fromCircle.x) * progress,
              y: fromCircle.y + (targetCircleVisual.y - fromCircle.y) * progress,
              radius:
                fromCircle.radius + (targetCircleVisual.radius - fromCircle.radius) * progress,
              opacity: 1,
            },
            fromCircle.opacity + (1 - fromCircle.opacity) * progress,
          )
        }
      } else {
        transition.circles.forEach((previousCircle) =>
          drawCircle(previousCircle, previousCircle.opacity * (1 - progress)),
        )
        drawCircle(targetCircleVisual, progress)
      }

      points.forEach((point, index) => {
        const fromColor = fromColors[index] ?? colors.muted
        const toColor = targetColors[index] ?? colors.muted
        const color = transition === null
          ? toColor
          : mixHexColor(fromColor, toColor, progress)
        renderedPointColorsRef.current[index] = color
        context.beginPath()
        context.arc(point.x, point.y, POINT_RADIUS, 0, Math.PI * 2)
        context.fillStyle = color
        context.fill()
      })

      context.restore()
    }

    if (transition === null) {
      draw(1)
      return
    }

    const animate = (timestamp: number) => {
      const elapsed = Math.min((timestamp - transition.startTime) / duration, 1)
      draw(easeStepProgress(elapsed))
      if (elapsed < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        animationFrameRef.current = null
        transitionRef.current = null
      }
    }
    const elapsed = Math.min((performance.now() - transition.startTime) / duration, 1)
    draw(easeStepProgress(elapsed))
    if (elapsed < 1) {
      animationFrameRef.current = requestAnimationFrame(animate)
    } else {
      transitionRef.current = null
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [assignments, circle, points, reduced, revision, size])

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