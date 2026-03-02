// components/dock.tsx
"use client"

import { useRef, useState } from "react"
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  type MotionValue,
} from "framer-motion"
import { Linkedin } from "lucide-react"

/* ---------------------------------------------------------- */
/*  Spring config -- Screen Studio feel                       */
/* ---------------------------------------------------------- */
const springElastic = { stiffness: 150, damping: 15, mass: 0.5 }

/* ---------------------------------------------------------- */
/*  Custom SVG icons for missing lucide icons                 */
/* ---------------------------------------------------------- */
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function UpworkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 9a3 3 0 1 0 0 6c2.5 0 4-2.5 5-5l1 8" />
      <path d="M18 9v2a3 3 0 0 1-6 0" />
      <circle cx="18" cy="7" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

/* ---------------------------------------------------------- */
/*  Dock items config                                         */
/* ---------------------------------------------------------- */
const dockItems = [
  { label: "TikTok", href: "#", icon: TikTokIcon, color: "#e8eaed" },
  { label: "Instagram", href: "#", icon: InstagramIcon, color: "#e8eaed" },
  { label: "LinkedIn", href: "#", icon: Linkedin, color: "#e8eaed" },
  { label: "Upwork", href: "#", icon: UpworkIcon, color: "#e8eaed" },
]

/* ---------------------------------------------------------- */
/*  Constants for magnification math                          */
/* ---------------------------------------------------------- */
const BASE_SIZE = 48
const MAX_SIZE = 80
const MAGNIFY_DISTANCE = 150

/* ---------------------------------------------------------- */
/*  DockIcon -- the heart of the magnification                */
/* ---------------------------------------------------------- */
function DockIcon({
  item,
  mouseX,
  mouseOnDock,
}: {
  item: (typeof dockItems)[0]
  mouseX: MotionValue<number>
  mouseOnDock: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)

  /* Distance from mouse to this icon's center */
  const distance = useTransform(mouseX, (val: number) => {
    if (!ref.current) return MAGNIFY_DISTANCE + 1
    const rect = ref.current.getBoundingClientRect()
    const center = rect.left + rect.width / 2
    return val - center
  })

  /* Map distance -> size: 0 distance = MAX_SIZE, > MAGNIFY_DISTANCE = BASE_SIZE */
  const rawSize = useTransform(distance, (d: number) => {
    if (!mouseOnDock) return BASE_SIZE
    const abs = Math.abs(d)
    if (abs >= MAGNIFY_DISTANCE) return BASE_SIZE
    // Cosine curve for smooth falloff
    const ratio = 1 - abs / MAGNIFY_DISTANCE
    const eased = (Math.cos((1 - ratio) * Math.PI) + 1) / 2
    return BASE_SIZE + (MAX_SIZE - BASE_SIZE) * eased
  })

  /* Buttery spring for elastic grow/shrink */
  const size = useSpring(rawSize, springElastic)

  /* Icon dimensions derived from size (hooks at top level) */
  const iconWidth = useTransform(size, (s) => s * 0.45)
  const iconHeight = useTransform(size, (s) => s * 0.45)

  const Icon = item.icon

  return (
    <motion.div
      ref={ref}
      className="relative flex items-end justify-center gpu"
      style={{ width: size, height: size }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="pointer-events-none absolute -top-10 left-1/2 whitespace-nowrap rounded-lg bg-card/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-lg backdrop-blur-md gpu"
            style={{ x: "-50%" }}
            initial={{ opacity: 0, y: 8, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.3 }}
          >
            {item.label}
            {/* Tooltip arrow */}
            <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-card/90" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon button */}
      <motion.a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-full w-full items-center justify-center rounded-xl bg-secondary/80 text-foreground/80 transition-colors duration-200 hover:bg-primary/15 hover:text-primary gpu"
        style={{
          boxShadow: hovered
            ? "0 0 20px rgba(0,212,255,0.15), 0 0 60px rgba(0,212,255,0.05)"
            : "0 0 0px transparent",
        }}
        aria-label={item.label}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <motion.div
          className="gpu"
          style={{
            width: iconWidth,
            height: iconHeight,
          }}
        >
          <Icon className="h-full w-full" />
        </motion.div>
      </motion.a>
    </motion.div>
  )
}

/* ---------------------------------------------------------- */
/*  Dock                                                      */
/* ---------------------------------------------------------- */
export function Dock() {
  const mouseX = useMotionValue(0)
  const [mouseOnDock, setMouseOnDock] = useState(false)

  return (
    <motion.nav
      className="fixed bottom-6 left-1/2 z-50 gpu"
      initial={{ opacity: 0, y: 60, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      transition={{ delay: 1.5, type: "spring", stiffness: 150, damping: 20, mass: 0.6 }}
      aria-label="Social links dock"
    >
      <motion.div
        className="relative flex items-end gap-2 rounded-2xl px-3 pb-2.5 pt-2.5 gpu"
        style={{
          background: "rgba(17, 17, 19, 0.75)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseEnter={() => setMouseOnDock(true)}
        onMouseLeave={() => setMouseOnDock(false)}
      >
        {/* Subtle gradient border overlay */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(0,212,255,0.08), transparent 50%, rgba(124,58,237,0.08))",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            padding: "1px",
            borderRadius: "inherit",
          }}
        />

        {/* Ambient glow underneath */}
        <div
          className="pointer-events-none absolute -bottom-2 left-1/2 h-8 w-3/4 -translate-x-1/2 rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(0,212,255,0.08), transparent 70%)",
            filter: "blur(12px)",
          }}
          aria-hidden="true"
        />

        {dockItems.map((item) => (
          <DockIcon
            key={item.label}
            item={item}
            mouseX={mouseX}
            mouseOnDock={mouseOnDock}
          />
        ))}
      </motion.div>
    </motion.nav>
  )
}
