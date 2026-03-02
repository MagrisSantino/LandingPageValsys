// components/footer.tsx
"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const spring = { type: "spring" as const, stiffness: 150, damping: 15, mass: 0.5 }
const springSnappy = { type: "spring" as const, stiffness: 300, damping: 25, mass: 0.5 }

const links = [
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
]

export function Footer() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-40px" })

  return (
    <footer ref={ref} className="relative border-t border-border">
      {/* Animated border glow */}
      <motion.div
        className="pointer-events-none absolute top-0 left-1/2 h-px w-1/3 -translate-x-1/2 gpu"
        style={{ background: "linear-gradient(90deg,transparent,rgba(0,212,255,0.15),transparent)" }}
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <motion.div
          className="flex flex-col items-center justify-between gap-8 md:flex-row"
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={spring}
        >
          {/* Logo + copyright — left */}
          <div className="flex items-center gap-6">
            <motion.a
              href="#"
              className="group flex items-center gap-2 gpu"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              transition={springSnappy}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
              </div>
              <span className="text-sm font-bold tracking-tight text-foreground">NEXUS</span>
            </motion.a>
            <span className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Nexus Agency. All rights reserved.
            </span>
          </div>

          {/* Nav links — right */}
          <div className="flex items-center gap-6">
            {links.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                className="text-xs text-muted-foreground hover:text-foreground gpu"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.2 + i * 0.08, ...spring }}
                whileHover={{ y: -2, transition: springSnappy }}
              >
                {link.label}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
