"use client"

import {
  createContext,
  forwardRef,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import { calculatePosition } from "@/lib/calculate-position"
import { parsePathToVertices } from "@/lib/svg-path-to-vertices"
import { debounce } from "lodash"
import Matter, {
  Bodies,
  Body,
  Common,
  Engine,
  Events,
  Mouse,
  Query,
  Render,
  Runner,
  Vector,
  World,
} from "matter-js"

import { cn } from "@/lib/utils"

type GravityProps = {
  children: ReactNode
  debug?: boolean
  gravity?: { x: number; y: number }
  resetOnResize?: boolean
  grabCursor?: boolean
  addTopWall?: boolean
  autoStart?: boolean
  className?: string
  repulsionRadius?: number
  repulsionStrength?: number
}

type PhysicsBody = {
  element: HTMLElement
  body: Matter.Body
  props: MatterBodyProps
}

type MatterBodyProps = {
  children: ReactNode
  matterBodyOptions?: Matter.IBodyDefinition
  isDraggable?: boolean
  bodyType?: "rectangle" | "circle" | "svg"
  sampleLength?: number
  x?: number | string
  y?: number | string
  angle?: number
  className?: string
}

export type GravityRef = {
  start: () => void
  stop: () => void
  reset: () => void
}

const GravityContext = createContext<{
  registerElement: (
    id: string,
    element: HTMLElement,
    props: MatterBodyProps
  ) => void
  unregisterElement: (id: string) => void
} | null>(null)

export const MatterBody = ({
  children,
  className,
  matterBodyOptions = {
    friction: 0.1,
    restitution: 0.1,
    density: 0.001,
    isStatic: false,
  },
  bodyType = "rectangle",
  isDraggable = true,
  sampleLength = 15,
  x = 0,
  y = 0,
  angle = 0,
  ...props
}: MatterBodyProps) => {
  const elementRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(Math.random().toString(36).substring(7))
  const context = useContext(GravityContext)

  useEffect(() => {
    if (!elementRef.current || !context) return
    context.registerElement(idRef.current, elementRef.current, {
      children,
      matterBodyOptions,
      bodyType,
      sampleLength,
      isDraggable,
      x,
      y,
      angle,
      ...props,
    })

    return () => context.unregisterElement(idRef.current)
  }, [context, children, matterBodyOptions, bodyType, sampleLength, isDraggable, x, y, angle, className, props])

  return (
    <div
      ref={elementRef}
      className={cn(
        "absolute",
        className,
        isDraggable && "pointer-events-none"
      )}
    >
      {children}
    </div>
  )
}

const Gravity = forwardRef<GravityRef, GravityProps>(
  (
    {
      children,
      debug = false,
      gravity = { x: 0, y: 1 },
      grabCursor = true,
      resetOnResize = true,
      addTopWall = true,
      autoStart = true,
      className,
      repulsionRadius = 80,
      repulsionStrength = 0.002,
      ...props
    },
    ref
  ) => {
    const canvas = useRef<HTMLDivElement>(null)
    const engine = useRef(Engine.create())
    const render = useRef<Render>(null)
    const runner = useRef<Runner>(null)
    const bodiesMap = useRef(new Map<string, PhysicsBody>())
    const frameId = useRef<number>(null)
    const mouse = useRef<Matter.Mouse>(null)
    const mousePosition = useRef({ x: 0, y: 0 })
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

    const isRunning = useRef(false)

    const registerElement = useCallback(
      (id: string, element: HTMLElement, props: MatterBodyProps) => {
        if (!canvas.current) return
        const width = element.offsetWidth
        const height = element.offsetHeight
        const canvasRect = canvas.current!.getBoundingClientRect()

        const angle = (props.angle || 0) * (Math.PI / 180)

        const x = calculatePosition(props.x, canvasRect.width, width)
        const y = calculatePosition(props.y, canvasRect.height, height)

        let body
        if (props.bodyType === "circle") {
          const radius = Math.max(width, height) / 2
          body = Bodies.circle(x, y, radius, {
            ...props.matterBodyOptions,
            angle: angle,
            render: {
              fillStyle: debug ? "#888888" : "#00000000",
              strokeStyle: debug ? "#333333" : "#00000000",
              lineWidth: debug ? 3 : 0,
            },
          })
        } else if (props.bodyType === "svg") {
          const paths = element.querySelectorAll("path")
          const vertexSets: Matter.Vector[][] = []

          paths.forEach((path) => {
            const d = path.getAttribute("d")
            const p = parsePathToVertices(d!, props.sampleLength)
            vertexSets.push(p)
          })

          body = Bodies.fromVertices(x, y, vertexSets, {
            ...props.matterBodyOptions,
            angle: angle,
            render: {
              fillStyle: debug ? "#888888" : "#00000000",
              strokeStyle: debug ? "#333333" : "#00000000",
              lineWidth: debug ? 3 : 0,
            },
          })
        } else {
          body = Bodies.rectangle(x, y, width, height, {
            ...props.matterBodyOptions,
            angle: angle,
            render: {
              fillStyle: debug ? "#888888" : "#00000000",
              strokeStyle: debug ? "#333333" : "#00000000",
              lineWidth: debug ? 3 : 0,
            },
          })
        }

        if (body) {
          Body.setVelocity(body, { 
            x: (Math.random() - 0.5) * 2, 
            y: (Math.random() - 0.5) * 2 
          })
          
          World.add(engine.current.world, [body])
          bodiesMap.current.set(id, { element, body, props })
        }
      },
      [debug]
    )
    const unregisterElement = useCallback((id: string) => {
      const body = bodiesMap.current.get(id)
      if (body) {
        World.remove(engine.current.world, body.body)
        bodiesMap.current.delete(id)
      }
    }, [])

    const updateElements = useCallback(() => {
      bodiesMap.current.forEach(({ element, body }) => {
        const { x, y } = body.position
        const rotation = body.angle * (180 / Math.PI)

        element.style.transform = `translate(${
          x - element.offsetWidth / 2
        }px, ${y - element.offsetHeight / 2}px) rotate(${rotation}deg)`
      })

      frameId.current = requestAnimationFrame(updateElements)
    }, [])

    const applyRepulsiveForce = useCallback(() => {
      if (!mouse.current) return

      const mousePos = mousePosition.current
      
      bodiesMap.current.forEach(({ body }) => {
        if (body.isStatic) return

        const distance = Vector.magnitude(Vector.sub(body.position, mousePos))
        
        if (distance < repulsionRadius && distance > 0) {
          const direction = Vector.normalise(Vector.sub(body.position, mousePos))
          
          const forceMagnitude = repulsionStrength * (repulsionRadius - distance) / distance
          
          const force = Vector.mult(direction, forceMagnitude)
          Body.applyForce(body, body.position, force)
        }
        
        const randomForce = {
          x: (Math.random() - 0.5) * 0.0001,
          y: (Math.random() - 0.5) * 0.0001
        }
        Body.applyForce(body, body.position, randomForce)
      })
    }, [repulsionRadius, repulsionStrength])

    const initializeRenderer = useCallback(() => {
      if (!canvas.current) return

      const height = canvas.current.offsetHeight
      const width = canvas.current.offsetWidth

      Common.setDecomp(require("poly-decomp"))

      engine.current.gravity.x = gravity.x
      engine.current.gravity.y = gravity.y

      render.current = Render.create({
        element: canvas.current,
        engine: engine.current,
        options: {
          width,
          height,
          wireframes: false,
          background: "#00000000",
        },
      })

      mouse.current = Mouse.create(render.current.canvas)

      render.current.canvas.addEventListener('mousemove', (event) => {
        const rect = render.current!.canvas.getBoundingClientRect()
        mousePosition.current = { 
          x: event.clientX - rect.left, 
          y: event.clientY - rect.top 
        }
      })

      Events.on(engine.current, 'beforeUpdate', () => {
        applyRepulsiveForce()
      })

      const walls = [
        Bodies.rectangle(width / 2, height + 10, width, 20, {
          isStatic: true,
          friction: 1,
          render: {
            visible: debug,
          },
        }),

        Bodies.rectangle(width + 10, height / 2, 20, height, {
          isStatic: true,
          friction: 1,
          render: {
            visible: debug,
          },
        }),

        Bodies.rectangle(-10, height / 2, 20, height, {
          isStatic: true,
          friction: 1,
          render: {
            visible: debug,
          },
        }),
      ]

      const topWall = addTopWall
        ? Bodies.rectangle(width / 2, -10, width, 20, {
            isStatic: true,
            friction: 1,
            render: {
              visible: debug,
            },
          })
        : null

      if (topWall) {
        walls.push(topWall)
      }

      World.add(engine.current.world, walls)

      render.current.mouse = mouse.current

      runner.current = Runner.create()
      Render.run(render.current)
      updateElements()
      runner.current.enabled = false

      if (autoStart) {
        runner.current.enabled = true
        startEngine()
      }
    }, [updateElements, debug, autoStart, applyRepulsiveForce])

    const clearRenderer = useCallback(() => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current)
      }

      if (render.current) {
        Mouse.clearSourceEvents(render.current.mouse)
        Render.stop(render.current)
        render.current.canvas.remove()
      }

      if (runner.current) {
        Runner.stop(runner.current)
      }

      if (engine.current) {
        World.clear(engine.current.world, false)
        Engine.clear(engine.current)
      }

      bodiesMap.current.clear()
    }, [])

    const handleResize = useCallback(() => {
      if (!canvas.current || !resetOnResize) return

      const newWidth = canvas.current.offsetWidth
      const newHeight = canvas.current.offsetHeight

      setCanvasSize({ width: newWidth, height: newHeight })

      clearRenderer()
      initializeRenderer()
    }, [clearRenderer, initializeRenderer, resetOnResize])

    const startEngine = useCallback(() => {
      if (runner.current) {
        runner.current.enabled = true

        Runner.run(runner.current, engine.current)
      }
      if (render.current) {
        Render.run(render.current)
      }
      frameId.current = requestAnimationFrame(updateElements)
      isRunning.current = true
    }, [updateElements, canvasSize])

    const stopEngine = useCallback(() => {
      if (!isRunning.current) return

      if (runner.current) {
        Runner.stop(runner.current)
      }
      if (render.current) {
        Render.stop(render.current)
      }
      if (frameId.current) {
        cancelAnimationFrame(frameId.current)
      }
      isRunning.current = false
    }, [])

    const reset = useCallback(() => {
      stopEngine()
      bodiesMap.current.forEach(({ element, body, props }) => {
        body.angle = props.angle || 0

        const x = calculatePosition(
          props.x,
          canvasSize.width,
          element.offsetWidth
        )
        const y = calculatePosition(
          props.y,
          canvasSize.height,
          element.offsetHeight
        )
        body.position.x = x
        body.position.y = y
      })
      updateElements()
      handleResize()
    }, [])

    useImperativeHandle(
      ref,
      () => ({
        start: startEngine,
        stop: stopEngine,
        reset,
      }),
      [startEngine, stopEngine]
    )

    useEffect(() => {
      if (!resetOnResize) return

      const debouncedResize = debounce(handleResize, 500)
      window.addEventListener("resize", debouncedResize)

      return () => {
        window.removeEventListener("resize", debouncedResize)
        debouncedResize.cancel()
      }
    }, [handleResize, resetOnResize])

    useEffect(() => {
      initializeRenderer()
      return clearRenderer
    }, [initializeRenderer, clearRenderer])

    return (
      <GravityContext.Provider value={{ registerElement, unregisterElement }}>
        <div
          ref={canvas}
          className={cn(className, "absolute top-0 left-0 w-full h-full")}
          {...props}
        >
          {children}
        </div>
      </GravityContext.Provider>
    )
  }
)

Gravity.displayName = "Gravity"
export default Gravity
