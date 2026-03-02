// components/navbar.tsx
"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import {
  motion,
  AnimatePresence,
  useMotionValueEvent,
  useScroll,
} from "framer-motion"

const spring = { type: "spring" as const, stiffness: 300, damping: 25, mass: 0.5 }

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 20))

  return (
    <motion.header
      className={`fixed inset-x-0 top-0 z-50 gpu ${
        scrolled ? "glass-strong" : "bg-transparent"
      }`}
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, stiffness: 200 }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <motion.a
          href="#"
          className="group flex items-center gap-2 gpu"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          transition={spring}
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 group-hover:glow-cyan">
            <motion.div
              className="h-3 w-3 rounded-sm bg-primary gpu"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary">
            NEXUS
          </span>
        </motion.a>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link, i) => (
            <motion.a
              key={link.href}
              href={link.href}
              className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground gpu"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.3, ...spring }}
              whileHover={{ y: -2, transition: spring }}
            >
              {link.label}
            </motion.a>
          ))}
        </div>

        {/* CTA */}
        <motion.a
          href="#contact"
          className="hidden rounded-lg border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-medium text-primary hover:border-primary/40 hover:bg-primary/10 hover:glow-cyan md:block gpu"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, ...spring }}
          whileHover={{ scale: 1.05, transition: spring }}
          whileTap={{ scale: 0.97, transition: spring }}
        >
          Start a Project
        </motion.a>

        {/* Mobile toggle */}
        <motion.button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden gpu"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          whileTap={{ scale: 0.9, transition: spring }}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </motion.button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0.95 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0.95 }}
            transition={{ ...spring, stiffness: 200 }}
            style={{ transformOrigin: "top" }}
            className="overflow-hidden md:hidden"
          >
            <div className="glass-strong mx-4 mt-2 rounded-xl p-4">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, ...spring }}
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.a
                href="#contact"
                onClick={() => setMobileOpen(false)}
                className="mt-2 block rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-center text-sm font-medium text-primary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, ...spring }}
              >
                Start a Project
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
