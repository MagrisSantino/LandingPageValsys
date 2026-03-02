// components/services.tsx
"use client"

import { useRef, useState, useCallback } from "react"
import { Code2, TestTubeDiagonal, Brain, Layers } from "lucide-react"
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion"

/* ---------------------------------------------------------- */
/*  Spring configs                                            */
/* ---------------------------------------------------------- */
const spring = { type: "spring" as const, stiffness: 150, damping: 15, mass: 0.5 }
const springSnappy = { type: "spring" as const, stiffness: 300, damping: 25, mass: 0.5 }

const services = [
  {
    icon: Code2,
    title: "Full-Stack Development",
    description:
      "End-to-end engineering with React, Next.js, Node.js, and cloud-native architectures. We build scalable systems that handle millions of users.",
    tags: ["React", "Next.js", "Node.js", "Cloud"],
    glow: "cyan" as const,
  },
  {
    icon: TestTubeDiagonal,
    title: "Rigorous QA Automation",
    description:
      "Comprehensive test coverage with Playwright, Cypress, and custom CI/CD pipelines. We catch bugs before they reach production. Zero defect guarantee.",
    tags: ["Playwright", "Cypress", "CI/CD", "E2E"],
    glow: "purple" as const,
  },
  {
    icon: Brain,
    title: "AI Integration",
    description:
      "Custom LLM integrations, RAG pipelines, intelligent agents, and ML-powered features that give your product an unfair competitive advantage.",
    tags: ["LLM", "RAG", "Agents", "ML"],
    glow: "cyan" as const,
  },
  {
    icon: Layers,
    title: "Platform Engineering",
    description:
      "Infrastructure as code, Kubernetes orchestration, and observability stacks. We build the foundations that keep your systems running at peak performance.",
    tags: ["Kubernetes", "IaC", "DevOps", "Monitoring"],
    glow: "purple" as const,
  },
]

/* ---------------------------------------------------------- */
/*  Service Card with 3D tilt + supercharged glow             */
/* ---------------------------------------------------------- */
function ServiceCard({ service, index }: { service: (typeof services)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  /* 3D Tilt — only rotateX / rotateY (GPU-composited) */
  const mouseXCard = useMotionValue(0.5)
  const mouseYCard = useMotionValue(0.5)
  const rawRotateX = useTransform(mouseYCard, [0, 1], [6, -6])
  const rawRotateY = useTransform(mouseXCard, [0, 1], [-6, 6])
  const rotateX = useSpring(rawRotateX, { stiffness: 200, damping: 25, mass: 0.4 })
  const rotateY = useSpring(rawRotateY, { stiffness: 200, damping: 25, mass: 0.4 })

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    mouseXCard.set(x)
    mouseYCard.set(y)
    setMouse({ x: e.clientX - r.left, y: e.clientY - r.top })
  }, [mouseXCard, mouseYCard])

  const onLeave = useCallback(() => {
    mouseXCard.set(0.5)
    mouseYCard.set(0.5)
    setHovered(false)
  }, [mouseXCard, mouseYCard])

  const Icon = service.icon
  const isCyan = service.glow === "cyan"
  const glowRgb = isCyan ? "0,212,255" : "124,58,237"

  return (
    <motion.div
      ref={ref}
      className="group relative rounded-2xl gpu"
      style={{
        perspective: 800,
      }}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ delay: index * 0.12, ...spring }}
    >
      <motion.div
        className="relative h-full rounded-2xl gpu"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ y: -8, scale: 1.015, transition: springSnappy }}
        onMouseMove={onMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={onLeave}
      >
        {/* Mouse-follow radial glow -- MUCH stronger */}
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300"
          style={{
            opacity: hovered ? 1 : 0,
            background: `radial-gradient(450px circle at ${mouse.x}px ${mouse.y}px, rgba(${glowRgb},0.15), transparent 40%)`,
          }}
        />

        {/* Vibrant gradient border -- bright on hover */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-400"
          style={{
            opacity: hovered ? 1 : 0,
            background: `linear-gradient(135deg, rgba(${glowRgb},0.5), rgba(${isCyan ? "124,58,237" : "0,212,255"},0.3), transparent 70%)`,
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            padding: "1px",
            borderRadius: "inherit",
          }}
        />

        <div className="glass relative flex h-full flex-col overflow-hidden rounded-2xl p-8 transition-colors duration-300 group-hover:border-primary/15">
          {/* Corner accent -- bigger, brighter */}
          <div
            className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full transition-all duration-500"
            style={{
              background: `radial-gradient(circle, rgba(${glowRgb},${hovered ? 0.14 : 0.04}), transparent)`,
              transform: `scale(${hovered ? 1.8 : 1}) translateZ(0)`,
            }}
          />

          {/* Icon -- scales up more + strong drop shadow */}
          <motion.div
            className={`mb-6 inline-flex items-center justify-center rounded-xl p-3 gpu ${
              isCyan ? "bg-primary/10 text-primary group-hover:bg-primary/20" : "bg-accent/10 text-accent group-hover:bg-accent/20"
            }`}
            animate={
              hovered
                ? { scale: 1.15 }
                : { scale: 1 }
            }
            transition={springSnappy}
            whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.4 } }}
            style={{
              boxShadow: hovered
                ? `0 0 25px rgba(${glowRgb},0.3), 0 0 60px rgba(${glowRgb},0.12), 0 8px 30px rgba(${glowRgb},0.15)`
                : "0 0 0px transparent",
              filter: hovered ? `drop-shadow(0 0 12px rgba(${glowRgb},0.4))` : "drop-shadow(0 0 0px transparent)",
              transition: "box-shadow 0.4s ease, filter 0.4s ease",
            }}
          >
            <Icon className="h-6 w-6" />
          </motion.div>

          <h3 className="mb-3 text-xl font-bold text-foreground">{service.title}</h3>
          <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">{service.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {service.tags.map((tag, i) => (
              <motion.span
                key={tag}
                className="rounded-md border border-border bg-secondary px-2.5 py-1 font-mono text-xs text-muted-foreground group-hover:border-primary/15 group-hover:text-foreground/70 gpu"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: index * 0.12 + 0.4 + i * 0.05, ...springSnappy }}
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ---------------------------------------------------------- */
/*  Services Section                                          */
/* ---------------------------------------------------------- */
export function Services() {
  const headRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(headRef, { once: true, margin: "-100px" })

  return (
    <section id="services" className="relative py-32">
      {/* Continuous floating ambient orb */}
      <motion.div
        className="pointer-events-none absolute top-1/3 left-0 h-[500px] w-[500px] rounded-full gpu"
        style={{ background: "radial-gradient(circle, rgba(0,212,255,0.03), transparent 70%)" }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div ref={headRef} className="mb-16 max-w-2xl">
          <motion.p
            className="mb-4 text-xs font-medium tracking-widest text-primary uppercase"
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ ...spring }}
          >
            Our Edge
          </motion.p>
          <motion.h2
            className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            initial={{ opacity: 0, y: 25 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.08, ...spring }}
          >
            Engineering excellence,{" "}
            <span className="text-muted-foreground">delivered.</span>
          </motion.h2>
          <motion.p
            className="mt-4 text-base leading-relaxed text-muted-foreground lg:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.16, ...spring }}
          >
            We combine deep technical expertise with a relentless focus on
            quality. Every line of code is tested, every system is built to scale.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {services.map((s, i) => (
            <ServiceCard key={s.title} service={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
