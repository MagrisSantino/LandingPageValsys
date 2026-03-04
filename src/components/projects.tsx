// components/projects.tsx
"use client"

import { useRef, useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, ExternalLink } from "lucide-react"
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "framer-motion"
import { useLanguage } from "@/context/language-context"

const spring = { type: "spring" as const, stiffness: 150, damping: 15, mass: 0.5 }
const springSnappy = { type: "spring" as const, stiffness: 300, damping: 25, mass: 0.5 }

const DEMO_BASE = "https://valsysdemo.vercel.app"

const projectsBase = [
  { title: "Aegis",    tKey: "aegis"    as const, image: "/images/project-1.png", url: `${DEMO_BASE}/aegis` },
  { title: "Kinetix",  tKey: "kinetix"  as const, image: "/images/project-2.png", url: `${DEMO_BASE}/kinetix` },
  { title: "NovaPay",  tKey: "novapay"  as const, image: "/images/project-3.png", url: `${DEMO_BASE}/novapay` },
  { title: "OmniStock",tKey: "omnistock"as const, image: "/images/project-4.png", url: `${DEMO_BASE}/omnistock` },
]

type ProjectItem = { title: string; category: string; description: string; image: string; url: string }

/* ---------------------------------------------------------- */
/*  Project Card with 3D tilt, glowing image, equal height    */
/* ---------------------------------------------------------- */
function ProjectCard({ project, index, viewLabel }: { project: ProjectItem; index: number; viewLabel: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  const [hovered, setHovered] = useState(false)

  /* Inner image parallax -- transform only */
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const rawImageY = useTransform(scrollYProgress, [0, 1], [15, -15])
  const imageY = useSpring(rawImageY, { stiffness: 80, damping: 20, mass: 0.5 })

  /* 3D Tilt (max ~5deg, spring-driven) */
  const mouseXCard = useMotionValue(0.5)
  const mouseYCard = useMotionValue(0.5)
  const rawRotateX = useTransform(mouseYCard, [0, 1], [5, -5])
  const rawRotateY = useTransform(mouseXCard, [0, 1], [-5, 5])
  const rotateX = useSpring(rawRotateX, { stiffness: 200, damping: 25, mass: 0.4 })
  const rotateY = useSpring(rawRotateY, { stiffness: 200, damping: 25, mass: 0.4 })

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const r = e.currentTarget.getBoundingClientRect()
      mouseXCard.set((e.clientX - r.left) / r.width)
      mouseYCard.set((e.clientY - r.top) / r.height)
    },
    [mouseXCard, mouseYCard]
  )

  const onLeave = useCallback(() => {
    mouseXCard.set(0.5)
    mouseYCard.set(0.5)
    setHovered(false)
  }, [mouseXCard, mouseYCard])

  return (
    <motion.div
      ref={ref}
      className="group relative gpu"
      style={{ perspective: 800 }}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ delay: index * 0.15, ...spring }}
    >
      <motion.div
        className="relative flex h-full flex-col rounded-2xl gpu"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={{ y: -8, scale: 1.01, transition: springSnappy }}
        onMouseMove={onMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={onLeave}
      >
        <Link href={project.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10 block" aria-label={`Ver demo de ${project.title}`} />
        {/* Vibrant gradient border on hover */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-400"
          style={{
            opacity: hovered ? 1 : 0,
            background:
              "linear-gradient(135deg, rgba(0,212,255,0.45), rgba(124,58,237,0.35), transparent 70%)",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            padding: "1px",
            borderRadius: "inherit",
          }}
        />

        <div className="glass relative flex h-full flex-col overflow-hidden rounded-2xl transition-colors duration-300 group-hover:border-primary/15">
          {/* Image container with glowing shadow behind it */}
          <div
            className="relative aspect-[16/10] overflow-hidden"
            style={{
              boxShadow: hovered
                ? "0 10px 50px rgba(0,212,255,0.12), 0 4px 25px rgba(124,58,237,0.1)"
                : "none",
              transition: "box-shadow 0.5s ease",
            }}
          >
            <motion.div className="absolute inset-[-15px] gpu" style={{ y: imageY }}>
              <Image
                src={project.image}
                alt={`${project.title} - ${project.category} case study`}
                fill
                className="object-cover gpu"
                style={{
                  transform: `scale(${hovered ? 1.06 : 1}) translateZ(0)`,
                  transition: "transform 0.7s cubic-bezier(0.22,1,0.36,1)",
                }}
              />
            </motion.div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />

            {/* Shimmer sweep */}
            <motion.div
              className="absolute inset-0 gpu"
              style={{
                background:
                  "linear-gradient(105deg,transparent 40%,rgba(0,212,255,0.06) 50%,transparent 60%)",
              }}
              animate={hovered ? { x: ["-100%", "100%"] } : { x: "-100%" }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
            />

            {/* Arrow -- spring entrance */}
            <motion.div
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full glass gpu"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={hovered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
              transition={springSnappy}
            >
              <ArrowUpRight className="h-4 w-4 text-primary" />
            </motion.div>

            {/* Category */}
            <div className="absolute top-4 left-4">
              <span className="rounded-full glass px-3 py-1 text-xs font-medium text-foreground">
                {project.category}
              </span>
            </div>
          </div>

          {/* Content -- flex-1 pushes footer down for equal height */}
          <div className="flex flex-1 flex-col p-6">
            <h3 className="mb-3 text-xl font-bold text-foreground group-hover:text-primary">
              {project.title}
            </h3>

            <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
              {project.description}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <motion.span
                className="inline-flex items-center gap-1 text-xs font-medium text-primary gpu"
                initial={{ opacity: 0, x: -8 }}
                animate={hovered ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                transition={springSnappy}
              >
                {viewLabel} <ExternalLink className="h-3 w-3" />
              </motion.span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ---------------------------------------------------------- */
/*  Projects Section                                          */
/* ---------------------------------------------------------- */
export function Projects() {
  const headRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(headRef, { once: true, margin: "-100px" })
  const { t } = useLanguage()

  const projects: ProjectItem[] = projectsBase.map((p) => ({
    title: p.title,
    image: p.image,
    url: p.url,
    category: t.projects[p.tKey].category,
    description: t.projects[p.tKey].desc,
  }))

  return (
    <section id="work" className="relative py-32">
      {/* Divider glow */}
      <motion.div
        className="pointer-events-none absolute top-0 left-1/2 h-px w-2/3 -translate-x-1/2 gpu"
        style={{
          background:
            "linear-gradient(90deg,transparent,rgba(0,212,255,0.2),transparent)",
        }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        viewport={{ once: true }}
      />

      {/* Floating bg orb */}
      <motion.div
        className="pointer-events-none absolute top-1/2 right-0 h-[600px] w-[600px] rounded-full gpu"
        style={{
          background:
            "radial-gradient(circle,rgba(124,58,237,0.03),transparent 70%)",
        }}
        animate={{ x: [0, -25, 0], y: [0, 15, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div
          ref={headRef}
          className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end"
        >
          <div>
            <motion.p
              className="mb-4 text-xs font-medium tracking-widest text-primary uppercase"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={spring}
            >
              {t.projects.label}
            </motion.p>
            <motion.h2
              className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              initial={{ opacity: 0, y: 25 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.08, ...spring }}
            >
              {t.projects.heading}{" "}
              <span className="text-muted-foreground">{t.projects.headingAccent}</span>
            </motion.h2>
          </div>
          <motion.a
            href="#contact"
            className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary gpu"
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, ...spring }}
            whileHover={{ x: 4, transition: springSnappy }}
          >
            {t.projects.viewAll}
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </motion.a>
        </div>

        {/* Equal-height grid */}
        <div className="grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2">
          {projects.map((p, i) => (
            <ProjectCard key={p.title} project={p} index={i} viewLabel={t.projects.viewDemo} />
          ))}
        </div>
      </div>
    </section>
  )
}
