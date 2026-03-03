"use client";

import { useEffect } from "react";
import Script from "next/script";
import {
  Clock,
  ShieldCheck,
  Mail,
  ArrowUpRight,
  Send,
} from "lucide-react";
import { Dock } from "@/components/dock";

export default function Home() {
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
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
              <div
                className="flex items-center gap-3 cursor-pointer group magnetic-target"
                data-strength="20"
              >
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <div className="absolute inset-0 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
                  <div className="w-2.5 h-2.5 bg-white rounded-full z-10" />
                  <div className="absolute w-full h-full border border-white/30 rounded-full animate-[spin_4s_linear_infinite]" />
                </div>
                <span className="text-white font-semibold tracking-tight text-lg group-hover:tracking-widest transition-all duration-300">
                  VALSYS
                </span>
              </div>
              <div className="hidden md:flex items-center gap-10 text-xs font-medium uppercase tracking-widest text-neutral-400">
                <a href="#services" className="hover:text-cyan-400 transition-colors magnetic-target" data-strength="15">
                  Services
                </a>
                <a href="#work" className="hover:text-cyan-400 transition-colors magnetic-target" data-strength="15">
                  Work
                </a>
                <a href="#about" className="hover:text-cyan-400 transition-colors magnetic-target" data-strength="15">
                  About
                </a>
              </div>
              <a
                href="#contact"
                className="hidden md:inline-flex items-center justify-center px-6 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wide rounded-full hover:bg-cyan-400 transition-colors magnetic-target btn-magnetic"
                data-strength="30"
              >
                Start Project
              </a>
            </div>
          </nav>

          <header className="relative z-10 min-h-screen flex flex-col justify-center items-center pt-24 pb-32 px-4 text-center glitch-enter">
            <div className="mb-10 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-cyan-400 uppercase">
                System Operational
              </span>
            </div>
            <h1 className="max-w-5xl text-5xl md:text-7xl lg:text-9xl font-semibold tracking-tighter text-white leading-[0.9] mb-10 select-none">
              <div className="overflow-hidden">
                <span className="scramble-text block" data-value="WE BUILD">
                  WE BUILD
                </span>
              </div>
              <div className="overflow-hidden">
                <span className="scramble-text block" data-value="FLAWLESS">
                  FLAWLESS
                </span>
              </div>
              <div className="overflow-hidden mt-2">
                <span className="liquid-text block italic pr-2">SOFTWARE.</span>
              </div>
            </h1>
            <p className="max-w-xl text-neutral-400 text-sm md:text-base leading-relaxed mb-12 font-light tracking-wide">
              Elite engineering for the next generation of digital products. <br className="hidden md:block" />
              We fuse art, code, and physics into unforgettable experiences.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <button
                className="relative px-10 py-4 bg-cyan-500 rounded-full text-black text-xs font-bold uppercase tracking-widest overflow-hidden group magnetic-target btn-magnetic"
                data-strength="50"
                id="btn-ripple-trigger"
              >
                <span className="relative z-10 flex items-center gap-2 group-hover:gap-4 transition-all">
                  View Portfolio
                  <iconify-icon icon="solar:arrow-right-linear" width="18" height="18" />
                </span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out mix-blend-overlay" />
              </button>
              <button className="px-10 py-4 bg-transparent border border-white/20 rounded-full text-white text-xs font-bold uppercase tracking-widest hover:bg-white/5 hover:border-white/40 transition-all magnetic-target btn-magnetic" data-strength="30">
                Our Services
              </button>
            </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
              <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-cyan-500 to-transparent" />
              <span className="text-[10px] uppercase tracking-widest text-cyan-500">Scroll</span>
            </div>
          </header>

          <div className="py-12 border-y border-white/5 bg-black/50 backdrop-blur-sm relative z-20 overflow-hidden">
            <div className="marquee-wrapper w-full">
              <div className="marquee-track gap-16 md:gap-32 px-4">
                <div className="flex items-center gap-3 text-neutral-500 hover:text-white transition-colors cursor-none">
                  <iconify-icon icon="solar:atom-linear" width="24" /> <span className="text-xl font-bold tracking-tight">AXIOM</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-500 hover:text-white transition-colors cursor-none">
                  <iconify-icon icon="solar:infinite-linear" width="24" /> <span className="text-xl font-bold tracking-tight">VERIDA</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-500 hover:text-white transition-colors cursor-none">
                  <iconify-icon icon="solar:black-hole-linear" width="24" /> <span className="text-xl font-bold tracking-tight">ORBITRA</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-500 hover:text-white transition-colors cursor-none">
                  <iconify-icon icon="solar:ufo-linear" width="24" /> <span className="text-xl font-bold tracking-tight">NOVA</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-500 hover:text-white transition-colors cursor-none">
                  <iconify-icon icon="solar:planet-linear" width="24" /> <span className="text-xl font-bold tracking-tight">COSMOS</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-500 hover:text-white transition-colors cursor-none">
                  <iconify-icon icon="solar:atom-linear" width="24" /> <span className="text-xl font-bold tracking-tight">AXIOM</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-500 hover:text-white transition-colors cursor-none">
                  <iconify-icon icon="solar:infinite-linear" width="24" /> <span className="text-xl font-bold tracking-tight">VERIDA</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-500 hover:text-white transition-colors cursor-none">
                  <iconify-icon icon="solar:black-hole-linear" width="24" /> <span className="text-xl font-bold tracking-tight">ORBITRA</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-500 hover:text-white transition-colors cursor-none">
                  <iconify-icon icon="solar:ufo-linear" width="24" /> <span className="text-xl font-bold tracking-tight">NOVA</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-500 hover:text-white transition-colors cursor-none">
                  <iconify-icon icon="solar:planet-linear" width="24" /> <span className="text-xl font-bold tracking-tight">COSMOS</span>
                </div>
              </div>
            </div>
          </div>

          <section id="services" className="relative z-10 py-32 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-24 spring-up">
                <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter text-white mb-6">
                  Designed for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Velocity.</span>
                </h2>
                <p className="text-neutral-400 text-lg max-w-2xl font-light">
                  We don&apos;t just write code. We architect scalable, fault-tolerant systems that power the future of industry.
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
                      Full-Stack
                      <br />
                      Engineering
                    </h3>
                    <p className="text-neutral-400 text-sm leading-7">
                      React, Next.js, and Node.js architectures built for millions of concurrent users. Performance is not a feature; it&apos;s a requirement.
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
                      Automated
                      <br />
                      Quality Assurance
                    </h3>
                    <p className="text-neutral-400 text-sm leading-7">
                      Zero-defect policy. We implement rigorous Playwright and Cypress end-to-end testing pipelines that catch regressions before they exist.
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
                      AI &amp; Intelligent
                      <br />
                      Agents
                    </h3>
                    <p className="text-neutral-400 text-sm leading-7">
                      LLM integration, RAG pipelines, and autonomous agents. We give your software a brain, enabling capabilities that were impossible yesterday.
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
                      Platform
                      <br />
                      Infrastructure
                    </h3>
                    <p className="text-neutral-400 text-sm leading-7">
                      Kubernetes orchestration, IaC, and observability. We build the bedrock that allows your application to scale infinitely without downtime.
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

          <section id="work" className="relative z-10 py-32 px-4 md:px-8 border-t border-white/5">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 spring-up">
                <div>
                  <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4 block">Featured Work</span>
                  <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter text-white">
                    Projects that <span className="text-neutral-500">define industries.</span>
                  </h2>
                </div>
                <a
                  href="#"
                  className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white hover:text-cyan-400 transition-colors mt-8 md:mt-0"
                >
                  View all projects <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className="group relative aspect-[4/3] rounded-3xl overflow-hidden holo-card magnetic-target spring-up cursor-pointer"
                  data-strength="15"
                >
                  <div className="absolute inset-0 bg-neutral-900">
                    <img
                      src="https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=2000&auto=format&fit=crop"
                      alt="Finance Dashboard"
                      className="w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:mix-blend-normal group-hover:scale-105 group-hover:opacity-80 transition-all duration-700 ease-out project-card-img"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="holo-glare" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-between holo-content z-20">
                    <div className="flex justify-between items-start">
                      <span className="px-3 py-1 rounded-full border border-white/10 bg-black/40 backdrop-blur-md text-[10px] uppercase tracking-wider text-white">Fintech Platform</span>
                    </div>
                    <div>
                      <div className="flex items-end justify-between mb-2">
                        <h3 className="text-2xl font-semibold text-white">Apex Finance</h3>
                        <div className="text-right">
                          <div className="text-cyan-400 font-bold text-xl tracking-tight">2M+</div>
                          <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Data Points/Sec</div>
                        </div>
                      </div>
                      <p className="text-neutral-400 text-sm mb-6 line-clamp-2">
                        Real-time trading dashboard with sub-100ms latency. Built with Next.js, WebSockets, and a custom charting engine.
                      </p>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-neutral-400">Next.js</span>
                        <span className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-neutral-400">WebSockets</span>
                        <span className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-neutral-400">PostgreSQL</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="group relative aspect-[4/3] rounded-3xl overflow-hidden holo-card magnetic-target spring-up cursor-pointer"
                  data-strength="15"
                >
                  <div className="absolute inset-0 bg-neutral-900">
                    <img
                      src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2000&auto=format&fit=crop"
                      alt="Medical AI"
                      className="w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:mix-blend-normal group-hover:scale-105 group-hover:opacity-80 transition-all duration-700 ease-out project-card-img"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="holo-glare" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-between holo-content z-20">
                    <div className="flex justify-between items-start">
                      <span className="px-3 py-1 rounded-full border border-white/10 bg-black/40 backdrop-blur-md text-[10px] uppercase tracking-wider text-white">Healthcare / AI</span>
                    </div>
                    <div>
                      <div className="flex items-end justify-between mb-2">
                        <h3 className="text-2xl font-semibold text-white">MedVault AI</h3>
                        <div className="text-right">
                          <div className="text-cyan-400 font-bold text-xl tracking-tight">60%</div>
                          <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Faster Diagnosis</div>
                        </div>
                      </div>
                      <p className="text-neutral-400 text-sm mb-6 line-clamp-2">
                        HIPAA-compliant AI diagnostic assistant with natural language processing for medical records.
                      </p>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-neutral-400">Python</span>
                        <span className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-neutral-400">LLM</span>
                        <span className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-neutral-400">HIPAA</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="group relative aspect-[4/3] rounded-3xl overflow-hidden holo-card magnetic-target spring-up cursor-pointer"
                  data-strength="15"
                >
                  <div className="absolute inset-0 bg-neutral-900">
                    <img
                      src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000&auto=format&fit=crop"
                      alt="Fashion Ecommerce"
                      className="w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:mix-blend-normal group-hover:scale-105 group-hover:opacity-80 transition-all duration-700 ease-out project-card-img"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="holo-glare" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-between holo-content z-20">
                    <div className="flex justify-between items-start">
                      <span className="px-3 py-1 rounded-full border border-white/10 bg-black/40 backdrop-blur-md text-[10px] uppercase tracking-wider text-white">E-Commerce</span>
                    </div>
                    <div>
                      <div className="flex items-end justify-between mb-2">
                        <h3 className="text-2xl font-semibold text-white">Luxe Commerce</h3>
                        <div className="text-right">
                          <div className="text-cyan-400 font-bold text-xl tracking-tight">99.99%</div>
                          <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Uptime</div>
                        </div>
                      </div>
                      <p className="text-neutral-400 text-sm mb-6 line-clamp-2">
                        High-performance headless commerce platform serving 500K+ daily active users with AI-powered recommendations.
                      </p>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-neutral-400">React</span>
                        <span className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-neutral-400">GraphQL</span>
                        <span className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-neutral-400">AWS</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="group relative aspect-[4/3] rounded-3xl overflow-hidden holo-card magnetic-target spring-up cursor-pointer"
                  data-strength="15"
                >
                  <div className="absolute inset-0 bg-neutral-900">
                    <img
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop"
                      alt="Analytics Dashboard"
                      className="w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:mix-blend-normal group-hover:scale-105 group-hover:opacity-80 transition-all duration-700 ease-out project-card-img"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="holo-glare" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-between holo-content z-20">
                    <div className="flex justify-between items-start">
                      <span className="px-3 py-1 rounded-full border border-white/10 bg-black/40 backdrop-blur-md text-[10px] uppercase tracking-wider text-white">SaaS / Analytics</span>
                    </div>
                    <div>
                      <div className="flex items-end justify-between mb-2">
                        <h3 className="text-2xl font-semibold text-white">Sentinel Analytics</h3>
                        <div className="text-right">
                          <div className="text-cyan-400 font-bold text-xl tracking-tight">500+</div>
                          <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Enterprise Clients</div>
                        </div>
                      </div>
                      <p className="text-neutral-400 text-sm mb-6 line-clamp-2">
                        Enterprise-grade analytics platform with real-time dashboards, anomaly detection, and automated reporting.
                      </p>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-neutral-400">TypeScript</span>
                        <span className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-neutral-400">Kafka</span>
                        <span className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-neutral-400">ML</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="contact" className="relative z-10 py-32 px-4 md:px-8 border-t border-white/5 bg-gradient-to-b from-black to-neutral-950">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32">
                <div className="spring-up">
                  <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4 block">Let&apos;s work together</span>
                  <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter text-white mb-6">
                    Ready to build <br />
                    <span className="text-neutral-500">something extraordinary?</span>
                  </h2>
                  <p className="text-neutral-400 text-lg font-light mb-12 max-w-md">
                    Tell us about your project and we&apos;ll respond within 24 hours with a detailed proposal. No commitment required.
                  </p>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 text-sm text-neutral-300">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-cyan-400">
                        <Clock className="w-5 h-5" />
                      </div>
                      <span>24-hour response time</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-neutral-300">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-purple-400">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <span>NDA available on request</span>
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
                  <form className="relative z-10 flex flex-col gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Name</label>
                      <input
                        type="text"
                        placeholder="Your name"
                        className="w-full p-4 rounded-lg mag-input text-white text-sm placeholder:text-neutral-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Email</label>
                      <input
                        type="email"
                        placeholder="you@company.com"
                        className="w-full p-4 rounded-lg mag-input text-white text-sm placeholder:text-neutral-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Tell us about your project</label>
                      <textarea
                        rows={4}
                        placeholder="Describe your project, timeline, and budget..."
                        className="w-full p-4 rounded-lg mag-input text-white text-sm placeholder:text-neutral-600 resize-none"
                      />
                    </div>
                    <button
                      type="button"
                      className="mt-4 w-full py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all active:scale-[0.98] magnetic-target btn-magnetic flex items-center justify-center gap-2"
                      data-strength="20"
                    >
                      Send Message
                      <Send className="w-4 h-4" />
                    </button>
                    <p className="text-[10px] text-neutral-600 text-center">We respect your privacy. No spam, ever.</p>
                  </form>
                </div>
              </div>
            </div>
          </section>

          <footer className="py-20 px-4 border-t border-white/10 bg-black">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white rounded-full" />
                <span className="text-white font-bold tracking-tight">VALSYS</span>
              </div>
              <div className="flex gap-8 text-xs font-medium uppercase tracking-widest text-neutral-500">
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-white transition-colors">Twitter</a>
                <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              </div>
              <div className="text-neutral-600 text-xs">© 2024 VALSYS ENGINEERING</div>
            </div>
          </footer>
        </div>
      </div>
      <Dock />
    </>
  );
}
