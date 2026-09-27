import { useEffect, useRef, useState } from 'react'
import { POINT_LIMIT } from '../dbscan/constants'
import type { Assignment, Point, RadiusCircle } from '../dbscan/types'
import { samplePathSegment } from './drawing'

type CanvasViewProps = {
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

const GRID_CELL_SIZE = 32
const MIN_ZOOM = 0.25
const MAX_ZOOM = 8
const POINT_RADIUS = 0.14
const DRAW_SPACING = 0.45
const ERASE_SPACING = 0.14
const ERASE_RADIUS = 0.3

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
  const pointsRef = useRef(points)
  const pointCountRef = useRef(points.length)
  const limitToastShownRef = useRef(false)
  const interactionRef = useRef({
    activeTool,
    onPointAdd,
    onPointsErase,
    onPointLimitReached,
  })
  const [size, setSize] = useState<CanvasSize>({ width: 0, height: 0, pixelRatio: 1 })
  const [revision, setRevision] = useState(0)
  const [isPanning, setIsPanning] = useState(false)

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

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (canvas === null || context === null || context === undefined || size.width === 0 || size.height === 0) {
      return
    }

    const transform = transformRef.current
    const scale = GRID_CELL_SIZE * transform.zoom
    const colors = {
      surface: getThemeColor(canvas, '--surface'),
      grid: getThemeColor(canvas, '--grid'),
      muted: getThemeColor(canvas, '--text-muted'),
      noise: getThemeColor(canvas, '--noise'),
      primary: getThemeColor(canvas, '--primary'),
      primarySoft: getThemeColor(canvas, '--primary-soft'),
      clusters: Array.from({ length: 6 }, (_, index) =>
        getThemeColor(canvas, `--cluster-${index + 1}`),
      ),
    }

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

    const center = circle === null ? undefined : points[circle.pointIndex]
    if (center !== undefined && circle !== null) {
      context.beginPath()
      context.arc(center.x, center.y, circle.radius, 0, Math.PI * 2)
      context.fillStyle = colors.primarySoft
      context.fill()
      context.strokeStyle = colors.primary
      context.lineWidth = 1.5 / scale
      context.stroke()
    }

    points.forEach((point, index) => {
      const assignment = assignments[index]
      let color = colors.muted
      if (assignment?.kind === 'noise') {
        color = colors.noise
      } else if (assignment?.kind === 'cluster') {
        color = colors.clusters[assignment.clusterId % colors.clusters.length] ?? colors.muted
      }
      context.beginPath()
      context.arc(point.x, point.y, POINT_RADIUS, 0, Math.PI * 2)
      context.fillStyle = color
      context.fill()
    })

    context.restore()
  }, [assignments, circle, points, revision, size])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) {
      return
    }

    const pointers = new Map<number, Position>()
    let previousPan: Position | null = null
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

    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerEnd)
    canvas.addEventListener('pointercancel', onPointerEnd)
    canvas.addEventListener('lostpointercapture', onPointerEnd)

    return () => {
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerEnd)
      canvas.removeEventListener('pointercancel', onPointerEnd)
      canvas.removeEventListener('lostpointercapture', onPointerEnd)
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