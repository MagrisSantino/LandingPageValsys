// hooks/use-magnetic.ts
"use client"

import { useRef, useCallback } from "react"
import { useMotionValue, useSpring, type MotionValue } from "framer-motion"

interface MagneticReturn {
  ref: React.RefObject<HTMLElement | null>
  x: MotionValue<number>
  y: MotionValue<number>
  handleMouseMove: (e: React.MouseEvent) => void
  handleMouseLeave: () => void
}

/**
 * Magnetic cursor-follow with spring physics.
 * Only drives `x` / `y` transforms -- fully GPU-composited.
 */
export function useMagnetic(strength: number = 0.3): MagneticReturn {
  const ref = useRef<HTMLElement | null>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Buttery spring config -- Screen Studio feel
  const springConfig = { stiffness: 150, damping: 15, mass: 0.5 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      x.set((e.clientX - cx) * strength)
      y.set((e.clientY - cy) * strength)
    },
    [strength, x, y]
  )

  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  return { ref, x: springX, y: springY, handleMouseMove, handleMouseLeave }
}
