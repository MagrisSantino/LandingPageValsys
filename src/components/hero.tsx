// components/hero.tsx
"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { ArrowRight, ChevronDown } from "lucide-react"
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "framer-motion"

/* ---------------------------------------------------------- */
/*  Shared spring config -- buttery Screen Studio feel        */
/* ---------------------------------------------------------- */
const spring = { type: "spring" as const, stiffness: 150, damping: 15, mass: 0.5 }
const springSnappy = { type: "spring" as const, stiffness: 300, damping: 25, mass: 0.5 }

/* ---------------------------------------------------------- */
/*  Floating Orbs (continuous breathing, GPU-composited)      */
/* ---------------------------------------------------------- */
function FloatingOrbs() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf: number
    let w = 0
    let h = 0

    interface Orb {
      x: number; y: number; r: number
      vx: number; vy: number; color: string
      alpha: number; phase: number; speed: number
    }

    const orbs: Orb[] = []

    function resize() {
      w = window.innerWidth; h = window.innerHeight
      canvas!.width = w; canvas!.height = h
    }

    function seed() {
      const colors = ["0,212,255", "124,58,237", "6,182,212", "139,92,246"]
      for (let i = 0; i < 7; i++) {
        orbs.push({
          x: Math.random() * w, y: Math.random() * h,
          r: 140 + Math.random() * 260,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          color: colors[i % colors.length],
          alpha: 0.025 + Math.random() * 0.035,
          phase: Math.random() * Math.PI * 2,
          speed: 0.004 + Math.random() * 0.008,
        })
      }
    }

    let t = 0
    function draw() {
      t++
      ctx!.clearRect(0, 0, w, h)
      for (const o of orbs) {
        o.x += o.vx + Math.sin(t * 0.003 + o.phase) * 0.25
        o.y += o.vy + Math.cos(t * 0.002 + o.phase) * 0.25
        if (o.x < -o.r) o.x = w + o.r
        if (o.x > w + o.r) o.x = -o.r
        if (o.y < -o.r) o.y = h + o.r
        if (o.y > h + o.r) o.y = -o.r

        const a = o.alpha * (0.7 + 0.3 * Math.sin(t * o.speed + o.phase))
        const rr = o.r * (0.92 + 0.08 * Math.sin(t * o.speed * 0.5 + o.phase))

        const g = ctx!.createRadialGradient(o.x, o.y, 0, o.x, o.y, rr)
        g.addColorStop(0, `rgba(${o.color},${a})`)
        g.addColorStop(1, `rgba(${o.color},0)`)
        ctx!.fillStyle = g
        ctx!.fillRect(o.x - rr, o.y - rr, rr * 2, rr * 2)
      }
      raf = requestAnimationFrame(draw)
    }

    resize(); seed(); draw()
    window.addEventListener("resize", resize)
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf) }
  }, [])

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 gpu" aria-hidden="true" />
}

/* ---------------------------------------------------------- */
/*  Magnetic Button (only transform + opacity, spring)        */
/* ---------------------------------------------------------- */
function MagneticButton({
  children,
  href,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode
  href: string
  variant?: "primary" | "secondary"
  className?: string
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, spring)
  const sy = useSpring(my, spring)

  const onMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    mx.set((e.clientX - r.left - r.width / 2) * 0.3)
    my.set((e.clientY - r.top - r.height / 2) * 0.3)
  }, [mx, my])

  const onLeave = useCallback(() => { mx.set(0); my.set(0) }, [mx, my])

  const base =
    variant === "primary"
      ? "group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground gpu"
      : "group inline-flex items-center gap-2 rounded-xl border border-border bg-secondary px-7 py-3.5 text-sm font-semibold text-foreground gpu"

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      transition={springSnappy}
      className={`${base} ${className}`}
    >
      {children}
    </motion.a>
  )
}

/* ---------------------------------------------------------- */
/*  Scan-lines (animate only transform, GPU)                  */
/* ---------------------------------------------------------- */
function ScanLines() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden gpu" aria-hidden="true">
      <motion.div
        className="absolute left-0 h-px w-full"
        style={{ background: "linear-gradient(90deg,transparent,rgba(0,212,255,0.06),transparent)" }}
        animate={{ y: [0, typeof window !== "undefined" ? window.innerHeight : 1000] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute top-0 h-full w-px"
        style={{ background: "linear-gradient(180deg,transparent,rgba(124,58,237,0.06),transparent)" }}
        animate={{ x: [0, typeof window !== "undefined" ? window.innerWidth : 1400] }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
}

/* ---------------------------------------------------------- */
/*  Floating Particles (transform + opacity only)             */
/*  Generated only on client mount to avoid hydration mismatch */
/* ---------------------------------------------------------- */
function Particles() {
  const [pts, setPts] = useState<Array<{ id: number; left: string; top: string; size: number; dur: number; delay: number }>>([])

  useEffect(() => {
    setPts(
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 1 + Math.random() * 2,
        dur: 5 + Math.random() * 7,
        delay: Math.random() * 5,
      }))
    )
  }, [])

  if (pts.length === 0) {
    return <div className="pointer-events-none absolute inset-0 overflow-hidden gpu" aria-hidden="true" />
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden gpu" aria-hidden="true">
      {pts.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/20"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
          animate={{ y: [0, -25, 0], opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  )
}

/* ---------------------------------------------------------- */
/*  Hero Section                                              */
/* ---------------------------------------------------------- */
export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })

  // Scroll-linked parallax (transform only)
  const rawY = useTransform(scrollYProgress, [0, 1], [0, -120])
  const rawOp = useTransform(scrollYProgress, [0, 0.65], [1, 0])
  const rawScale = useTransform(scrollYProgress, [0, 1], [1, 1.15])

  // Smooth with springs for Screen Studio feel
  const contentY = useSpring(rawY, { stiffness: 80, damping: 20, mass: 0.5 })
  const contentOp = useSpring(rawOp, { stiffness: 80, damping: 20, mass: 0.5 })
  const bgScale = useSpring(rawScale, { stiffness: 60, damping: 20, mass: 0.5 })

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { ...spring, stiffness: 120 } },
  }

  return (
    <section ref={ref} className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Parallax BG layer -- only scale transform */}
      <motion.div className="absolute inset-0 gpu" style={{ scale: bgScale }}>
        <div className="absolute inset-0 grid-bg" />
        <FloatingOrbs />
        <ScanLines />
        <Particles />
      </motion.div>

      {/* Radial vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 50%,transparent 0%,#0a0a0a 70%)" }}
        aria-hidden="true"
      />

      {/* Content -- parallax translateY + opacity only */}
      <motion.div
        className="relative z-10 mx-auto max-w-5xl px-6 text-center gpu"
        style={{ y: contentY, opacity: contentOp }}
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium tracking-widest text-primary uppercase">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Now accepting new projects
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="text-balance text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl"
        >
          We Build Flawless
          <br />
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-[gradient-shift_4s_ease_infinite]">
            Software. Faster.
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg lg:text-xl"
        >
          An elite engineering agency specializing in full-stack development,
          rigorous QA automation, and AI-powered solutions for the most
          demanding teams on the planet.
        </motion.p>

        {/* Buttons */}
        <motion.div variants={fadeUp} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <MagneticButton href="#work" variant="primary">
            <span className="relative z-10">View Our Work</span>
            <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </MagneticButton>
          <MagneticButton href="#contact" variant="secondary" className="hover:border-primary/30 hover:bg-primary/5 hover:text-primary">
            Start a Project
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </MagneticButton>
        </motion.div>

        {/* Trust bar */}
        <motion.div variants={fadeUp} className="mt-16 flex flex-col items-center gap-4">
          <p className="text-xs tracking-widest text-muted-foreground uppercase">Trusted by innovative teams worldwide</p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground/40">
            {["Axiom", "Verida", "Pulse AI", "Dataflux", "Orbitra"].map((n, i) => (
              <motion.span
                key={n}
                className="text-sm font-semibold tracking-wider hover:text-muted-foreground gpu"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + i * 0.08, ...spring }}
              >
                {n}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.a
        href="#services"
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground/40 hover:text-primary gpu"
        aria-label="Scroll down"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
      >
        <span className="text-[10px] tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.a>
    </section>
  )
}
