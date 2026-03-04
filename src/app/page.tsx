"use client";

import { useEffect, Fragment, useState } from "react";
import Script from "next/script";
import {
  Clock,
  ShieldCheck,
  Mail,
  ArrowUpRight,
  Send,
  Globe,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { Dock } from "@/components/dock";
import { Projects } from "@/components/projects";
import { sendEmailAction } from "@/actions/send-email";
import { useLanguage } from "@/context/language-context";
import { translations, Lang } from "@/i18n/translations";

const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
]

export default function Home() {
  const { lang, setLang, t } = useLanguage();

  // --- FORM STATES ---
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{success?: boolean, message?: string} | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- FORM SUBMIT HANDLER ---
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Custom validation
    const errors: { name?: string; email?: string; message?: string } = {};
    if (!formState.name.trim()) errors.name = t.contact.fieldRequired;
    if (!formState.email.trim()) {
      errors.email = t.contact.fieldRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      errors.email = t.contact.emailInvalid;
    }
    if (!formState.message.trim()) errors.message = t.contact.fieldRequired;
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const res = await sendEmailAction(formState);
      if (res?.success) {
        setSubmitStatus({ success: true, message: t.contact.successMsg });
        setFormState({ name: "", email: "", message: "" });
      } else {
        setSubmitStatus({ success: false, message: res?.error || t.contact.errorMsg });
      }
    } catch (err) {
      setSubmitStatus({ success: false, message: t.contact.unexpectedError });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const canvas = document.getElementById("particle-canvas") as HTMLCanvasElement | null;
    const cursorDot = document.getElementById("cursor-dot");
    const cursorTrail = document.getElementById("cursor-trail");
    const content = document.getElementById("smooth-content");

    let width: number, height: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
    }> = [];
    const mouse = { x: -1000, y: -1000 };
    let cursorX = 0,
      cursorY = 0;
    let trailX = 0,
      trailY = 0;
    let currentScroll = 0;
    let targetScroll = 0;

    let rafCanvas: number;
    let rafCursor: number;
    let rafSkew: number;
    const scrambleIntervals: ReturnType<typeof setInterval>[] = [];
    const observerRef: IntersectionObserver[] = [];
    const magneticMoveHandlers = new Map<Element, (e: Event) => void>();
    const magneticLeaveHandler = (e: Event) => {
      const t = e.currentTarget as HTMLElement;
      if (t) t.style.transform = "translate(0, 0)";
      document.body.classList.remove("hover-active");
    };
    const cardMoveHandlers = new Map<Element, (e: Event) => void>();
    const cardLeaveHandler = (e: Event) => {
      const card = e.currentTarget as HTMLElement;
      if (card) card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    };
    const btnEnterHandlers = new Map<Element, (e: Event) => void>();

    function initCanvas() {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      particles = [];
      const particleCount = Math.floor((width * height) / 15000);
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          color: Math.random() > 0.5 ? "rgba(34, 211, 238, " : "rgba(168, 85, 247, ",
        });
      }
    }

    function animateCanvas() {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repelDist = 150;
        if (dist < repelDist) {
          const force = (repelDist - dist) / repelDist;
          const angle = Math.atan2(dy, dx);
          p.x -= Math.cos(angle) * force * 2;
          p.y -= Math.sin(angle) * force * 2;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + "0.5)";
        ctx.fill();
        if (dist < 200) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = p.color + (1 - dist / 200) * 0.4 + ")";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
      rafCanvas = requestAnimationFrame(animateCanvas);
    }

    function animateCursor() {
      const dx = cursorX - trailX;
      const dy = cursorY - trailY;
      trailX += dx * 0.15;
      trailY += dy * 0.15;
      if (cursorTrail) {
        cursorTrail.style.transform = `translate(${trailX}px, ${trailY}px) translate(-50%, -50%)`;
      }
      rafCursor = requestAnimationFrame(animateCursor);
    }

    function animateScrollDistortion() {
      const diff = targetScroll - currentScroll;
      const skew = diff * 0.005;
      const clampedSkew = Math.min(Math.max(skew, -5), 5);
      if (content) {
        content.style.transform = Math.abs(diff) < 0.1 ? "skewY(0deg)" : `skewY(${clampedSkew}deg)`;
      }
      currentScroll += diff * 0.1;
      rafSkew = requestAnimationFrame(animateScrollDistortion);
    }

    const handleResize = () => initCanvas();
    const handleScroll = () => {
      targetScroll = window.scrollY;
    };

    const onMagneticMove = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      const me = e as MouseEvent;
      const rect = target.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const strength = target.getAttribute("data-strength") || "30";
      const deltaX = (me.clientX - centerX) / rect.width;
      const deltaY = (me.clientY - centerY) / rect.height;
      target.style.transform = `translate(${Number(deltaX) * Number(strength)}px, ${Number(deltaY) * Number(strength)}px)`;
      document.body.classList.add("hover-active");
    };
    const onMagneticLeave = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      target.style.transform = "translate(0, 0)";
      document.body.classList.remove("hover-active");
    };

    const onCardMove = (e: Event) => {
      const card = e.currentTarget as HTMLElement;
      const me = e as MouseEvent;
      const rect = card.getBoundingClientRect();
      const x = me.clientX - rect.left;
      const y = me.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -3;
      const rotateY = ((x - centerX) / centerX) * 3;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      const angle = (Math.atan2(y - centerY, x - centerX) * 180) / Math.PI;
      card.style.setProperty("--angle", `${angle + 90}deg`);
    };
    const onCardLeave = (e: Event) => {
      const card = e.currentTarget as HTMLElement;
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    };

    const onBtnEnter = (e: Event) => {
      const btn = e.currentTarget as HTMLElement;
      const me = e as MouseEvent;
      const rect = btn.getBoundingClientRect();
      const x = me.clientX - rect.left;
      const y = me.clientY - rect.top;
      const ripple = document.createElement("span");
      ripple.style.left = x + "px";
      ripple.style.top = y + "px";
      ripple.style.position = "absolute";
      ripple.style.background = "rgba(255, 255, 255, 0.3)";
      ripple.style.transform = "translate(-50%, -50%)";
      ripple.style.pointerEvents = "none";
      ripple.style.borderRadius = "50%";
      ripple.style.animation = "ripple 0.8s linear infinite";
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 1000);
    };

    const handleMouseMove = (e: MouseEvent) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (cursorDot) {
        cursorDot.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
      }
    };

    if (canvas) {
      initCanvas();
      rafCanvas = requestAnimationFrame(animateCanvas);
    }
    rafCursor = requestAnimationFrame(animateCursor);
    rafSkew = requestAnimationFrame(animateScrollDistortion);

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousemove", handleMouseMove);

    const magneticTargets: Element[] = [];
    document.querySelectorAll(".magnetic-target").forEach((target) => {
      const moveHandler = (e: Event) => onMagneticMove(e);
      magneticMoveHandlers.set(target, moveHandler);
      magneticTargets.push(target);
      target.addEventListener("mousemove", moveHandler);
      target.addEventListener("mouseleave", magneticLeaveHandler);
    });

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    document.querySelectorAll(".scramble-text").forEach((el) => {
      const originalText = (el as HTMLElement).getAttribute("data-value") || "";
      let iterations = 0;
      const interval = setInterval(() => {
        (el as HTMLElement).innerText = originalText
          .split("")
          .map((char, index) => {
            if (index < iterations) return originalText[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("");
        if (iterations >= originalText.length) clearInterval(interval);
        iterations += 1 / 3;
      }, 30);
      scrambleIntervals.push(interval);
    });

    const holoCards: Element[] = [];
    document.querySelectorAll(".holo-card").forEach((card) => {
      const moveHandler = (e: Event) => onCardMove(e);
      cardMoveHandlers.set(card, moveHandler);
      holoCards.push(card);
      card.addEventListener("mousemove", moveHandler);
      card.addEventListener("mouseleave", cardLeaveHandler);
    });

    const scrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("in-view");
        });
      },
      { threshold: 0.1 }
    );
    observerRef.push(scrollObserver);
    document.querySelectorAll(".spring-up").forEach((el) => scrollObserver.observe(el));

    document.querySelectorAll(".btn-magnetic").forEach((btn) => {
      const enterHandler = (e: Event) => onBtnEnter(e);
      btnEnterHandlers.set(btn, enterHandler);
      btn.addEventListener("mouseenter", enterHandler);
    });

    return () => {
      cancelAnimationFrame(rafCanvas);
      cancelAnimationFrame(rafCursor);
      cancelAnimationFrame(rafSkew);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousemove", handleMouseMove);
      document.body.classList.remove("hover-active");
      scrambleIntervals.forEach((id) => clearInterval(id));
      observerRef.forEach((obs) => obs.disconnect());
      magneticMoveHandlers.forEach((handler, el) => el.removeEventListener("mousemove", handler));
      magneticTargets.forEach((el) => el.removeEventListener("mouseleave", magneticLeaveHandler));
      cardMoveHandlers.forEach((handler, el) => el.removeEventListener("mousemove", handler));
      holoCards.forEach((el) => el.removeEventListener("mouseleave", cardLeaveHandler));
      btnEnterHandlers.forEach((handler, el) => el.removeEventListener("mouseenter", handler));
    };
  }, []);

  return (
    <>
      <Script
        src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"
        strategy="lazyOnload"
      />
      <div className="relative selection:bg-cyan-500/30 selection:text-cyan-200">
        <div id="cursor-dot" />
        <div id="cursor-trail" />
        <canvas id="particle-canvas" />
        <div id="smooth-content">
          <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 h-20 grid grid-cols-3 items-center">
              {/* Col izquierda: logo (desktop) | hamburger (mobile) */}
              <div className="flex items-center">
                <div className="hidden md:flex items-center gap-3 cursor-pointer group magnetic-target" data-strength="20">
                  <img src="/icon.png" alt="Valsys" className="h-10 w-10 object-contain" />
                  <span className="text-white font-semibold tracking-tight text-lg group-hover:tracking-widest transition-all duration-300">VALSYS</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg text-neutral-400 hover:text-white transition-colors"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
              {/* Col centro: nav links (desktop) | logo (mobile) */}
              <div className="flex items-center justify-center">
                <div className="hidden md:flex items-center gap-10 text-xs font-medium uppercase tracking-widest text-neutral-400">
                  <a href="#services" className="hover:text-cyan-400 transition-colors magnetic-target" data-strength="15">{t.nav.services}</a>
                  <a href="#work" className="hover:text-cyan-400 transition-colors magnetic-target" data-strength="15">{t.nav.work}</a>
                  <a href="#about" className="hover:text-cyan-400 transition-colors magnetic-target" data-strength="15">{t.nav.about}</a>
                </div>
                <div className="flex md:hidden items-center gap-3 cursor-pointer group" >
                  <img src="/icon.png" alt="Valsys" className="h-10 w-10 object-contain" />
                  <span className="text-white font-semibold tracking-tight text-lg">VALSYS</span>
                </div>
              </div>
              {/* Col derecha: language switcher + CTA (desktop) | language switcher (mobile) */}
              <div className="flex items-center justify-end gap-3">
                <div className="relative">
                  <button
                    onClick={() => setLangOpen(!langOpen)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-white/10 bg-white/5 text-xs font-bold uppercase tracking-wide text-neutral-300 hover:border-white/30 hover:text-white transition-all"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {lang.toUpperCase()}
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
                  </button>
                  {langOpen && (
                    <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-white/10 bg-black/90 backdrop-blur-md shadow-xl z-50 overflow-hidden">
                      {LANGUAGES.map((l) => (
                        <button
                          key={l.code}
                          onClick={() => { setLang(l.code); setLangOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left transition-colors hover:bg-white/10 ${lang === l.code ? "text-cyan-400 bg-white/5" : "text-neutral-300"}`}
                        >
                          <span>{l.flag}</span>
                          <span className="font-medium">{l.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <a
                  href="#contact"
                  className="hidden md:inline-flex items-center justify-center px-6 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wide rounded-full hover:bg-cyan-400 transition-colors magnetic-target btn-magnetic"
                  data-strength="30"
                >
                  {t.nav.startProject}
                </a>
              </div>
            </div>
            {/* Mobile menu */}
            {mobileMenuOpen && (
              <div className="md:hidden border-t border-white/5 bg-black/90 backdrop-blur-md px-6 py-4 flex flex-col gap-3">
                <a href="#services" onClick={() => setMobileMenuOpen(false)} className="text-xs font-medium uppercase tracking-widest text-neutral-400 hover:text-cyan-400 py-2 transition-colors">{t.nav.services}</a>
                <a href="#work" onClick={() => setMobileMenuOpen(false)} className="text-xs font-medium uppercase tracking-widest text-neutral-400 hover:text-cyan-400 py-2 transition-colors">{t.nav.work}</a>
                <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-xs font-medium uppercase tracking-widest text-neutral-400 hover:text-cyan-400 py-2 transition-colors">{t.nav.about}</a>
              </div>
            )}
          </nav>

          <header className="relative z-10 min-h-screen flex flex-col justify-center items-center pt-24 pb-32 px-4 text-center glitch-enter">
            <div className="mb-10 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-cyan-400 uppercase">
                {t.hero.badge}
              </span>
            </div>
            <h1 className="max-w-5xl text-5xl md:text-7xl lg:text-9xl font-semibold tracking-tighter text-white leading-[0.9] mb-10 select-none">
              <div className="overflow-hidden">
                <span className="scramble-text block" data-value={t.hero.line1}>
                  {t.hero.line1}
                </span>
              </div>
              <div className="overflow-hidden">
                <span className="scramble-text block" data-value={t.hero.line2}>
                  {t.hero.line2}
                </span>
              </div>
              <div className="overflow-hidden mt-2">
                <span className="liquid-text block italic pr-2">{t.hero.line3}</span>
              </div>
            </h1>
            <p className="max-w-xl text-neutral-400 text-sm md:text-base leading-relaxed mb-12 font-light tracking-wide">
              {t.hero.tagline}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {/* Solo mobile: Start a Project (blanco) arriba */}
              <a
                href="#contact"
                className="sm:hidden w-64 text-center px-6 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-full hover:bg-cyan-400 transition-colors"
              >
                {t.nav.startProject}
              </a>
              {/* Siempre visible: View Portfolio */}
              <a
                href="#work"
                className="relative w-64 sm:w-auto text-center px-6 py-2.5 sm:px-10 sm:py-4 bg-cyan-500 rounded-full text-black text-xs font-bold uppercase tracking-widest overflow-hidden group magnetic-target btn-magnetic"
                data-strength="50"
                id="btn-ripple-trigger"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 group-hover:gap-4 transition-all">
                  {t.hero.viewPortfolio}
                  <iconify-icon icon="solar:arrow-right-linear" width="18" height="18" />
                </span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out mix-blend-overlay" />
              </a>
              {/* Siempre visible: Our Services */}
              <a href="#services" className="w-64 sm:w-auto text-center px-6 py-2.5 sm:px-10 sm:py-4 bg-transparent border border-white/20 rounded-full text-white text-xs font-bold uppercase tracking-widest hover:bg-white/5 hover:border-white/40 transition-all magnetic-target btn-magnetic" data-strength="30">
                {t.hero.ourServices}
              </a>
            </div>
            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 hidden tall:flex flex-col items-center gap-2 opacity-50">
              <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-cyan-500 to-transparent" />
              <span className="text-[10px] uppercase tracking-widest text-cyan-500">{t.hero.scroll}</span>
            </div>
          </header>

          <div className="py-12 border-y border-white/5 bg-black/50 backdrop-blur-sm relative z-20 overflow-hidden">
            <div className="marquee-wrapper w-full">
              <div className="marquee-track gap-16 md:gap-32 px-4">
                {[1, 2, 3, 4].map((n) => (
                  <Fragment key={n}>
                    <div className="flex items-center gap-3 text-neutral-500 hover:text-white transition-colors cursor-none shrink-0">
                      <iconify-icon icon="solar:atom-linear" width="24" /> <span className="text-xl font-bold tracking-tight">AXIOM</span>
                    </div>
                    <div className="flex items-center gap-3 text-neutral-500 hover:text-white transition-colors cursor-none shrink-0">
                      <iconify-icon icon="solar:infinite-linear" width="24" /> <span className="text-xl font-bold tracking-tight">VERIDA</span>
                    </div>
                    <div className="flex items-center gap-3 text-neutral-500 hover:text-white transition-colors cursor-none shrink-0">
                      <iconify-icon icon="solar:black-hole-linear" width="24" /> <span className="text-xl font-bold tracking-tight">ORBITRA</span>
                    </div>
                    <div className="flex items-center gap-3 text-neutral-500 hover:text-white transition-colors cursor-none shrink-0">
                      <iconify-icon icon="solar:ufo-linear" width="24" /> <span className="text-xl font-bold tracking-tight">NOVA</span>
                    </div>
                    <div className="flex items-center gap-3 text-neutral-500 hover:text-white transition-colors cursor-none shrink-0">
                      <iconify-icon icon="solar:planet-linear" width="24" /> <span className="text-xl font-bold tracking-tight">COSMOS</span>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>

          <section id="services" className="relative z-10 py-32 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-24 spring-up">
                <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter text-white mb-6">
                  {t.services.heading} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">{t.services.headingAccent}</span>
                </h2>
                <p className="text-neutral-400 text-lg max-w-2xl font-light">
                  {t.services.description}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div
                  className="holo-card rounded-3xl p-10 relative overflow-hidden group min-h-[400px] flex flex-col justify-between magnetic-target spring-up"
                  data-strength="10"
                >
                  <div className="holo-glare" />
                  <div className="holo-content relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center mb-8 backdrop-blur-sm shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                      <iconify-icon icon="solar:code-circle-linear" className="text-cyan-400 text-3xl" />
                    </div>
                    <h3 className="text-3xl font-semibold text-white mb-4 tracking-tight">
                      {t.services.fullStack.title1}
                      <br />
                      {t.services.fullStack.title2}
                    </h3>
                    <p className="text-neutral-400 text-sm leading-7">
                      {t.services.fullStack.desc}
                    </p>
                  </div>
                  <div className="holo-content flex gap-2 mt-8">
                    <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase tracking-wider text-neutral-300">Next.js</span>
                    <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase tracking-wider text-neutral-300">TS</span>
                  </div>
                </div>
                <div
                  className="holo-card rounded-3xl p-10 relative overflow-hidden group min-h-[400px] flex flex-col justify-between magnetic-target spring-up"
                  data-strength="10"
                >
                  <div className="holo-glare" />
                  <div className="holo-content relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 flex items-center justify-center mb-8 backdrop-blur-sm shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                      <iconify-icon icon="solar:shield-check-linear" className="text-purple-400 text-3xl" />
                    </div>
                    <h3 className="text-3xl font-semibold text-white mb-4 tracking-tight">
                      {t.services.qa.title1}
                      <br />
                      {t.services.qa.title2}
                    </h3>
                    <p className="text-neutral-400 text-sm leading-7">
                      {t.services.qa.desc}
                    </p>
                  </div>
                  <div className="holo-content flex gap-2 mt-8">
                    <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase tracking-wider text-neutral-300">Playwright</span>
                    <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase tracking-wider text-neutral-300">CI/CD</span>
                  </div>
                </div>
                <div
                  className="holo-card rounded-3xl p-10 relative overflow-hidden group min-h-[400px] flex flex-col justify-between magnetic-target spring-up"
                  data-strength="10"
                >
                  <div className="holo-glare" />
                  <div className="holo-content relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center mb-8 backdrop-blur-sm shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                      <iconify-icon icon="solar:magic-stick-3-linear" className="text-amber-400 text-3xl" />
                    </div>
                    <h3 className="text-3xl font-semibold text-white mb-4 tracking-tight">
                      {t.services.ai.title1}
                      <br />
                      {t.services.ai.title2}
                    </h3>
                    <p className="text-neutral-400 text-sm leading-7">
                      {t.services.ai.desc}
                    </p>
                  </div>
                  <div className="holo-content flex gap-2 mt-8">
                    <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase tracking-wider text-neutral-300">OpenAI</span>
                    <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase tracking-wider text-neutral-300">LangChain</span>
                  </div>
                </div>
                <div
                  className="holo-card rounded-3xl p-10 relative overflow-hidden group min-h-[400px] flex flex-col justify-between magnetic-target spring-up"
                  data-strength="10"
                >
                  <div className="holo-glare" />
                  <div className="holo-content relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 flex items-center justify-center mb-8 backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                      <iconify-icon icon="solar:server-square-linear" className="text-emerald-400 text-3xl" />
                    </div>
                    <h3 className="text-3xl font-semibold text-white mb-4 tracking-tight">
                      {t.services.platform.title1}
                      <br />
                      {t.services.platform.title2}
                    </h3>
                    <p className="text-neutral-400 text-sm leading-7">
                      {t.services.platform.desc}
                    </p>
                  </div>
                  <div className="holo-content flex gap-2 mt-8">
                    <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase tracking-wider text-neutral-300">K8s</span>
                    <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase tracking-wider text-neutral-300">Terraform</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Projects />

          <section id="contact" className="relative z-10 py-32 px-4 md:px-8 border-t border-white/5 bg-gradient-to-b from-black to-neutral-950">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32">
                <div className="spring-up">
                  <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4 block">{t.contact.label}</span>
                  <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter text-white mb-6">
                    {t.contact.heading} <br />
                    <span className="text-neutral-500">{t.contact.headingMuted}</span>
                  </h2>
                  <p className="text-neutral-400 text-lg font-light mb-12 max-w-md">
                    {t.contact.description}
                  </p>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-4 text-sm text-neutral-300">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-cyan-400">
                        <Clock className="w-5 h-5" />
                      </div>
                      <span>{t.contact.responseTime}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-neutral-300">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-purple-400">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <span>{t.contact.nda}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-neutral-300">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white">
                        <Mail className="w-5 h-5" />
                      </div>
                      <span>hello@valsys.dev</span>
                    </div>
                  </div>
                </div>
                <div className="holo-card rounded-3xl p-8 md:p-10 border border-white/10 bg-white/2 spring-up">
                  <div className="holo-glare" />
                  
                  <form onSubmit={handleFormSubmit} className="relative z-10 flex flex-col gap-6">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold pl-1">{t.contact.formName}</label>
                      <input
                        type="text"
                        value={formState.name}
                        onChange={(e) => { setFormState({ ...formState, name: e.target.value }); setFormErrors((prev) => ({ ...prev, name: undefined })); }}
                        placeholder={t.contact.namePlaceholder}
                        className={`w-full p-4 rounded-lg mag-input text-white text-sm placeholder:text-neutral-600 ${formErrors.name ? "border border-red-500/60" : ""}`}
                      />
                      {formErrors.name && <p className="text-xs text-red-400 mt-1">{formErrors.name}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold pl-1">{t.contact.formEmail}</label>
                      <input
                        type="text"
                        value={formState.email}
                        onChange={(e) => { setFormState({ ...formState, email: e.target.value }); setFormErrors((prev) => ({ ...prev, email: undefined })); }}
                        placeholder={t.contact.emailPlaceholder}
                        className={`w-full p-4 rounded-lg mag-input text-white text-sm placeholder:text-neutral-600 ${formErrors.email ? "border border-red-500/60" : ""}`}
                      />
                      {formErrors.email && <p className="text-xs text-red-400 mt-1">{formErrors.email}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold pl-1">{t.contact.formProject}</label>
                      <textarea
                        rows={4}
                        value={formState.message}
                        onChange={(e) => { setFormState({ ...formState, message: e.target.value }); setFormErrors((prev) => ({ ...prev, message: undefined })); }}
                        placeholder={t.contact.messagePlaceholder}
                        className={`w-full p-4 rounded-lg mag-input text-white text-sm placeholder:text-neutral-600 resize-none ${formErrors.message ? "border border-red-500/60" : ""}`}
                      />
                      {formErrors.message && <p className="text-xs text-red-400 mt-1">{formErrors.message}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="mt-4 w-full py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all active:scale-[0.98] magnetic-target btn-magnetic flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      data-strength="20"
                    >
                      {isSubmitting ? t.contact.submitting : t.contact.submit}
                      {!isSubmitting && <Send className="w-4 h-4" />}
                    </button>
                    
                    {/* Glowing status message matching the theme */}
                    {submitStatus && (
                      <div
                        className={`px-4 py-3 mt-2 rounded-lg border text-sm text-center font-medium tracking-wide transition-all ${
                          submitStatus.success
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                            : "bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                        }`}
                      >
                        {submitStatus.message}
                      </div>
                    )}

                    <p className="text-[10px] text-neutral-600 text-center">{t.contact.privacyNote}</p>
                  </form>
                </div>
              </div>
            </div>
          </section>

          <footer className="py-20 px-4 border-t border-white/10 bg-black">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-2">
                <img src="/icon.png" alt="Valsys" className="h-8 w-8 object-contain" />
                <span className="text-white font-bold tracking-tight">VALSYS</span>
              </div>
              <div className="flex items-center gap-8 text-xs font-medium uppercase tracking-widest text-neutral-500 md:ml-auto md:pr-0">
                <a href="#" className="hover:text-white transition-colors">{t.footer.privacy}</a>
                <a href="#" className="hover:text-white transition-colors">{t.footer.terms}</a>
                <span className="text-neutral-600 normal-case tracking-normal">{t.footer.copyright}</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
      <Dock />
    </>
  );
}