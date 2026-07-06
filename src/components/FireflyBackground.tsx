import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

// The chosen background: a dark purple + emerald gradient field (.bg-mesh, in
// index.css) with a dense swarm of prominent fireflies drifting up across it.
// Each mote has a bright white core and a colored glow halo so it reads clearly
// against the dark field. Renders a single static frame under prefers-reduced-motion.
type RGB = [number, number, number]

const COUNT = 130
// Firefly hues chosen to glow on dark purple/emerald: sky, violet, mint, gold, lilac.
const PALETTE: RGB[] = [
  [125, 211, 252],
  [167, 139, 250],
  [94, 234, 212],
  [253, 224, 138],
  [209, 196, 255],
]

interface Fly {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  ph: number
  tw: number
  c: RGB
}

export default function FireflyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let w = 0
    let h = 0
    let flies: Fly[] = []
    const rnd = (a: number, b: number) => a + Math.random() * (b - a)
    const pick = (): RGB => PALETTE[(Math.random() * PALETTE.length) | 0]

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      flies = Array.from({ length: COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rnd(1.5, 3.9),
        vx: rnd(-0.15, 0.15),
        vy: rnd(-0.65, -0.15),
        ph: Math.random() * 7,
        tw: rnd(0.6, 2.3),
        c: pick(),
      }))
    }

    let t = 0
    const drawFrame = (animate: boolean) => {
      ctx.clearRect(0, 0, w, h)
      for (const f of flies) {
        if (animate) {
          f.x += f.vx
          f.y += f.vy
          if (f.y < -6) {
            f.y = h + 6
            f.x = Math.random() * w
          }
          if (f.x < -6) f.x = w + 6
          if (f.x > w + 6) f.x = -6
        }
        const a = 0.4 + 0.55 * Math.sin(t * f.tw + f.ph)
        // colored glow halo
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 4.2)
        g.addColorStop(0, `rgba(${f.c[0]},${f.c[1]},${f.c[2]},${0.55 * a})`)
        g.addColorStop(1, `rgba(${f.c[0]},${f.c[1]},${f.c[2]},0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(f.x, f.y, f.r * 4.2, 0, Math.PI * 2)
        ctx.fill()
        // bright core
        ctx.fillStyle = `rgba(255,255,255,${0.95 * a})`
        ctx.shadowBlur = 16
        ctx.shadowColor = `rgb(${f.c[0]},${f.c[1]},${f.c[2]})`
        ctx.beginPath()
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }

    const loop = () => {
      t += 0.035
      drawFrame(true)
      raf = requestAnimationFrame(loop)
    }

    let resizeTimer = 0
    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        build()
        if (reduced) drawFrame(false)
      }, 150)
    }

    build()
    if (reduced) {
      drawFrame(false)
    } else {
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
    }
  }, [reduced])

  return (
    <>
      <div className="bg-mesh" aria-hidden />
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 -z-10 h-full w-full" aria-hidden />
    </>
  )
}
