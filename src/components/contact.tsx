// components/contact.tsx
"use client"

import { useRef, useState, useCallback } from "react"
import { Send, Mail, Clock, Shield } from "lucide-react"
import { motion, useInView, useMotionValue, useSpring } from "framer-motion"
import { toast } from "sonner"
import { sendEmailAction } from "@/actions/send-email"

const spring = { type: "spring" as const, stiffness: 150, damping: 15, mass: 0.5 }
const springSnappy = { type: "spring" as const, stiffness: 300, damping: 25, mass: 0.5 }

const features = [
  { icon: Clock, label: "24-hour response" },
  { icon: Shield, label: "NDA on request" },
  { icon: Mail, label: "hello@valsys.dev" },
]

/* ---------------------------------------------------------- */
/* Neon Input -- outer glow ring + glowing label on focus    */
/* ---------------------------------------------------------- */
function NeonInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  isTextarea = false,
  focused,
  onFocus,
  onBlur,
  delay,
  isInView,
}: {
  id: string
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  isTextarea?: boolean
  focused: boolean
  onFocus: () => void
  onBlur: () => void
  delay: number
  isInView: boolean
}) {
  const baseClass =
    "w-full rounded-xl border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all duration-300"
  const focusClass = focused
    ? "border-primary/50 bg-primary/5 ring-[3px] ring-primary/15 shadow-[0_0_15px_rgba(0,212,255,0.12),0_0_30px_rgba(0,212,255,0.05)]"
    : "border-border ring-0 shadow-none"

  const Tag = isTextarea ? "textarea" : "input"

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, ...spring }}
    >
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-medium tracking-wider uppercase transition-all duration-300"
        style={{
          color: focused ? "var(--primary)" : "var(--muted-foreground)",
          textShadow: focused
            ? "0 0 12px rgba(0,212,255,0.4), 0 0 24px rgba(0,212,255,0.15)"
            : "none",
        }}
      >
        {label}
      </label>
      <Tag
        id={id}
        type={isTextarea ? undefined : type}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
          onChange(e.target.value)
        }
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={isTextarea ? 4 : undefined}
        className={`${baseClass} ${focusClass} ${isTextarea ? "resize-none" : ""}`}
      />
    </motion.div>
  )
}

/* ---------------------------------------------------------- */
/* Magnetic Submit -- energy-burst hover                     */
/* ---------------------------------------------------------- */
function MagneticSubmit({ isLoading }: { isLoading?: boolean }) {
  const ref = useRef<HTMLButtonElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, spring)
  const sy = useSpring(my, spring)
  const [btnHovered, setBtnHovered] = useState(false)

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current || isLoading) return
      const r = ref.current.getBoundingClientRect()
      mx.set((e.clientX - r.left - r.width / 2) * 0.25)
      my.set((e.clientY - r.top - r.height / 2) * 0.25)
    },
    [mx, my, isLoading]
  )

  const onLeave = useCallback(() => {
    mx.set(0)
    my.set(0)
    setBtnHovered(false)
  }, [mx, my])

  return (
    <motion.button
      ref={ref}
      type="submit"
      disabled={isLoading}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseEnter={() => setBtnHovered(true)}
      onMouseLeave={onLeave}
      whileHover={!isLoading ? { scale: 1.03 } : {}}
      whileTap={!isLoading ? { scale: 0.97 } : {}}
      transition={springSnappy}
      className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground gpu disabled:opacity-70 disabled:cursor-not-allowed"
    >
      <span className="relative z-10">
        {isLoading ? "Sending..." : "Send Message"}
      </span>
      {!isLoading && (
        <Send className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      )}

      {/* Bright animated gradient overlay -- energy burst */}
      <motion.div
        className="absolute inset-0 gpu"
        style={{
          background:
            "linear-gradient(105deg, var(--primary) 0%, var(--accent) 40%, var(--primary) 70%, var(--accent) 100%)",
          backgroundSize: "200% 100%",
        }}
        animate={
          btnHovered && !isLoading
            ? { backgroundPosition: ["0% center", "100% center"] }
            : { backgroundPosition: "0% center" }
        }
        transition={
          btnHovered && !isLoading
            ? { duration: 1.2, repeat: Infinity, ease: "linear" }
            : { duration: 0.3 }
        }
        initial={{ opacity: 0 }}
        whileHover={!isLoading ? { opacity: 1 } : {}}
      />

      {/* Outer neon glow on hover */}
      <div
        className="pointer-events-none absolute -inset-1 rounded-xl transition-all duration-400"
        style={{
          boxShadow: btnHovered && !isLoading
            ? "0 0 20px rgba(0,212,255,0.25), 0 0 50px rgba(124,58,237,0.15), 0 0 80px rgba(0,212,255,0.08)"
            : "none",
        }}
      />

      {/* Shine sweep */}
      {!isLoading && (
        <motion.div
          className="absolute inset-0 gpu"
          style={{
            background:
              "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.15) 50%,transparent 60%)",
          }}
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6 }}
        />
      )}
    </motion.button>
  )
}

/* ---------------------------------------------------------- */
/* Contact Section                                           */
/* ---------------------------------------------------------- */
export function Contact() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [form, setForm] = useState({ name: "", email: "", message: "" })
  const [focused, setFocused] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all fields.")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await sendEmailAction(form)

      if (result?.success) {
        toast.success("Message sent successfully! We'll be in touch soon.")
        setForm({ name: "", email: "", message: "" })
      } else {
        toast.error(result?.error || "Something went wrong. Please try again.")
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please email us directly.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0, transition: { ...spring, stiffness: 120 } },
  }

  return (
    <section id="contact" ref={ref} className="relative py-32">
      {/* Divider glow */}
      <motion.div
        className="pointer-events-none absolute top-0 left-1/2 h-px w-2/3 -translate-x-1/2 gpu"
        style={{
          background:
            "linear-gradient(90deg,transparent,rgba(124,58,237,0.2),transparent)",
        }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        viewport={{ once: true }}
      />

      {/* Breathing ambient orb */}
      <motion.div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full gpu"
        style={{
          background:
            "radial-gradient(circle,rgba(124,58,237,0.05) 0%,transparent 70%)",
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left */}
          <motion.div
            className="flex flex-col justify-center"
            variants={stagger}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
          >
            <motion.p
              variants={fadeUp}
              className="mb-4 text-xs font-medium tracking-widest text-accent uppercase"
            >
              Let{"'"}s Work Together
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            >
              Ready to build{" "}
              <span className="text-muted-foreground">
                something extraordinary?
              </span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-4 text-base leading-relaxed text-muted-foreground lg:text-lg"
            >
              Tell us about your project and we{"'"}ll respond within 24 hours
              with a detailed proposal. No commitment required.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 flex flex-col gap-4">
              {features.map((f, i) => (
                <motion.div
                  key={f.label}
                  className="flex items-center gap-3 text-sm text-muted-foreground gpu"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.08, ...spring }}
                  whileHover={{ x: 5, transition: springSnappy }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <f.icon className="h-4 w-4" />
                  </div>
                  {f.label}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right -- Form */}
          <motion.div
            className="gpu"
            initial={{ opacity: 0, y: 35 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, ...spring }}
          >
            <form
              onSubmit={handleSubmit}
              className="glass relative overflow-hidden rounded-2xl p-8 lg:p-10"
            >
              {/* Gradient border */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-50"
                style={{
                  background:
                    "linear-gradient(135deg,rgba(124,58,237,0.1),transparent,rgba(0,212,255,0.05))",
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "exclude",
                  WebkitMaskComposite: "xor",
                  padding: "1px",
                  borderRadius: "inherit",
                }}
              />

              {/* Focus ambient glow */}
              <div
                className="pointer-events-none absolute -top-32 -right-32 h-64 w-64 rounded-full gpu"
                style={{
                  background:
                    "radial-gradient(circle,rgba(0,212,255,0.06),transparent)",
                  opacity: focused ? 1 : 0.2,
                  transform: `scale(${focused ? 1.3 : 1}) translateZ(0)`,
                  transition: "opacity 0.6s ease, transform 0.6s ease",
                }}
              />

              <div className="space-y-6">
                <NeonInput
                  id="name"
                  label="Name"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  placeholder="Your name"
                  focused={focused === "name"}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused(null)}
                  delay={0.4}
                  isInView={isInView}
                />
                <NeonInput
                  id="email"
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                  placeholder="you@company.com"
                  focused={focused === "email"}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  delay={0.48}
                  isInView={isInView}
                />
                <NeonInput
                  id="message"
                  label="Tell us about your project"
                  value={form.message}
                  onChange={(v) => setForm({ ...form, message: v })}
                  placeholder="Describe your project, timeline, and budget..."
                  isTextarea
                  focused={focused === "message"}
                  onFocus={() => setFocused("message")}
                  onBlur={() => setFocused(null)}
                  delay={0.56}
                  isInView={isInView}
                />

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.64, ...spring }}
                >
                  <MagneticSubmit isLoading={isSubmitting} />
                </motion.div>
              </div>

              <p className="mt-4 text-center text-xs text-muted-foreground/50">
                We respect your privacy. No spam, ever.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}