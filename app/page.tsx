import Link from "next/link";
import { Tilt3DCard } from "@/components/ui/Tilt3DCard";
import { Globe } from "@/components/ui/Globe";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const features = [
  {
    icon: "🪄",
    title: "AI-Powered Itineraries",
    description:
      "Tell us your vibe — adventure, relaxation, culture — and our AI crafts a day-by-day plan tailored just for you.",
  },
  {
    icon: "🗺️",
    title: "Interactive Maps",
    description:
      "See every stop on a beautiful map. Drag, reorder, and discover hidden gems nearby with a single tap.",
  },
  {
    icon: "✏️",
    title: "Fully Editable Plans",
    description:
      "Your trip, your rules. Swap activities, adjust timings, add notes — every detail is in your hands.",
  },
  {
    icon: "⛅",
    title: "Weather & Smart Scheduling",
    description:
      "We check forecasts and local calendars so you never plan a beach day during a monsoon.",
  },
];

const steps = [
  {
    number: "01",
    title: "Tell Us Where & When",
    description:
      "Enter your destination, dates, budget, and travel style. That's all we need to get started.",
    icon: "✈️",
  },
  {
    number: "02",
    title: "AI Builds Your Itinerary",
    description:
      "In seconds, our AI generates a rich day-by-day plan with restaurants, activities, transit, and more.",
    icon: "🤖",
  },
  {
    number: "03",
    title: "Customize & Go",
    description:
      "Fine-tune every detail, export to your calendar, share with friends, and hit the road.",
    icon: "🚀",
  },
];

export default function Home() {
  return (
    <>
      {/* CSS Animations — inline <style> for server component */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(3deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-20px) translateX(10px); }
          66% { transform: translateY(10px) translateX(-10px); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(1.05); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1); opacity: 0.2; }
          100% { transform: scale(0.8); opacity: 0.5; }
        }
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes glow-breathe {
          0%, 100% { opacity: 0.4; filter: blur(80px); }
          50% { opacity: 0.7; filter: blur(100px); }
        }
        @keyframes border-glow {
          0%, 100% { border-color: rgba(0, 229, 255, 0.15); }
          50% { border-color: rgba(0, 229, 255, 0.35); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float-slow { animation: float-slow 7s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 5s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 3.5s ease-in-out infinite; }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 4s ease infinite;
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out both; }
        .animate-fade-in { animation: fade-in 1s ease-out both; }
        .animate-pulse-ring { animation: pulse-ring 3s ease-in-out infinite; }
        .animate-slide-left { animation: slide-in-left 0.8s ease-out both; }
        .animate-slide-right { animation: slide-in-right 0.8s ease-out both; }
        .animate-glow-breathe { animation: glow-breathe 5s ease-in-out infinite; }
        .animate-border-glow { animation: border-glow 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 25s linear infinite; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-700 { animation-delay: 0.7s; }
        .delay-1000 { animation-delay: 1s; }

        .feature-card {
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                      box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                      border-color 0.35s ease;
        }
        .feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 60px rgba(0, 229, 255, 0.08),
                      0 0 0 1px rgba(0, 229, 255, 0.15);
        }
        .step-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .step-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(139, 92, 246, 0.1);
        }
        .cta-glow {
          transition: box-shadow 0.3s ease, transform 0.2s ease;
        }
        .cta-glow:hover {
          box-shadow: 0 0 30px rgba(0, 229, 255, 0.3),
                      0 0 60px rgba(139, 92, 246, 0.15);
          transform: translateY(-2px);
        }
        .cta-glow:active {
          transform: translateY(0px);
        }
        .nav-blur {
          backdrop-filter: blur(20px) saturate(1.4);
          -webkit-backdrop-filter: blur(20px) saturate(1.4);
        }
      `}</style>

      {/* ─────────────── NAVBAR ─────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-blur bg-void/70 border-b border-subtle/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet flex items-center justify-center text-void font-bold text-sm">
              W
            </div>
            <span className="text-lg font-display font-bold text-bright group-hover:text-primary transition-colors duration-300">
              Wandr.ai
            </span>
          </Link>

          {/* Nav Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="px-5 py-2 text-sm font-medium text-muted hover:text-bright transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-violet text-void text-sm font-semibold hover:opacity-90 transition-opacity duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative overflow-hidden">
        {/* ─────────────── HERO SECTION ─────────────── */}
        <section className="relative min-h-screen flex items-center justify-center px-6 pt-16">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Large primary glow — top right */}
            <div
              className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary/10 animate-glow-breathe"
              style={{ filter: "blur(100px)" }}
            />
            {/* Violet glow — bottom left */}
            <div
              className="absolute -bottom-48 -left-48 w-[600px] h-[600px] rounded-full bg-violet/10 animate-glow-breathe delay-300"
              style={{ filter: "blur(120px)" }}
            />
            {/* Gold accent glow — center */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-gold/5 animate-glow-breathe delay-700"
              style={{ filter: "blur(80px)" }}
            />

            {/* Floating orbs */}
            <div className="absolute top-[18%] left-[12%] w-3 h-3 rounded-full bg-primary/40 animate-float-slow" />
            <div className="absolute top-[25%] right-[18%] w-2 h-2 rounded-full bg-violet/50 animate-float-medium delay-200" />
            <div className="absolute bottom-[30%] left-[22%] w-2.5 h-2.5 rounded-full bg-gold/40 animate-float-fast delay-400" />
            <div className="absolute top-[40%] right-[8%] w-4 h-4 rounded-full bg-primary/20 animate-float-slow delay-500" />
            <div className="absolute bottom-[20%] right-[25%] w-2 h-2 rounded-full bg-violet/30 animate-float-medium delay-100" />

            {/* Decorative ring */}
            <div className="absolute top-[15%] right-[10%] w-40 h-40 rounded-full border border-primary/10 animate-pulse-ring animate-spin-slow" />
            <div className="absolute bottom-[25%] left-[8%] w-56 h-56 rounded-full border border-violet/10 animate-pulse-ring delay-500 animate-spin-slow" />

            {/* Grid pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0,229,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.3) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />
          </div>

          {/* Hero content */}
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            {/* Pill badge */}
            <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/60 border border-subtle/80 text-xs font-medium text-muted mb-8 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Now in Beta — Free to use
            </div>

            {/* Main heading */}
            <h1 className="animate-fade-in-up delay-100 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold leading-[1.05] tracking-tight">
              <span className="text-bright">Your AI</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-violet to-primary bg-clip-text text-transparent animate-gradient-x">
                Travel Companion
              </span>
            </h1>

            {/* Subheading */}
            <p className="animate-fade-in-up delay-300 mt-6 md:mt-8 text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
              Describe your dream trip and watch AI craft a{" "}
              <span className="text-bright font-medium">stunning day-by-day itinerary</span>{" "}
              — complete with restaurants, activities, budgets, and local secrets.
            </p>

            {/* CTA Buttons */}
            <div className="animate-fade-in-up delay-500 mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/register"
                className="cta-glow group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-violet text-void font-semibold text-lg flex items-center gap-2"
              >
                Start Planning
                <svg
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a
                href="#how-it-works"
                className="px-8 py-4 rounded-2xl bg-white/5 text-bright font-medium text-lg border border-subtle hover:bg-white/10 hover:border-primary/30 transition-all duration-300"
              >
                See How It Works
              </a>
            </div>

            {/* 3D Globe in Hero */}
            <div className="animate-fade-in delay-700 mt-16 flex justify-center">
              <Globe markers={[[28.6139, 77.209], [48.8566, 2.3522], [35.6762, 139.6503], [40.7128, -74.006]]} size={280} className="mx-auto" />
            </div>

            {/* Social proof */}
            <div className="animate-fade-in delay-700 mt-14 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-dim">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {["bg-primary", "bg-violet", "bg-gold", "bg-success"].map(
                    (color, i) => (
                      <div
                        key={i}
                        className={`w-7 h-7 rounded-full ${color}/80 border-2 border-void flex items-center justify-center text-[10px] text-void font-bold`}
                      >
                        {["N", "S", "A", "K"][i]}
                      </div>
                    )
                  )}
                </div>
                <span className="text-muted">
                  <span className="text-bright font-medium">2,400+</span> trips
                  planned
                </span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-subtle" />
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-gold"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-muted ml-1">
                  <span className="text-bright font-medium">4.9</span> avg
                  rating
                </span>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in delay-1000">
            <div className="w-6 h-10 rounded-full border-2 border-subtle flex justify-center pt-2">
              <div className="w-1 h-2.5 rounded-full bg-primary/60 animate-float-fast" />
            </div>
          </div>
        </section>

        {/* ─────────────── FEATURES SECTION ─────────────── */}
        <section className="relative py-28 md:py-36 px-6">
          {/* Section glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full animate-glow-breathe" style={{ filter: "blur(120px)" }} />

          <div className="relative z-10 max-w-6xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-16 md:mb-20">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
                Features
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-bright">
                Everything You Need to{" "}
                <span className="bg-gradient-to-r from-primary to-violet bg-clip-text text-transparent">
                  Travel Smarter
                </span>
              </h2>
              <p className="mt-4 text-muted text-lg max-w-xl mx-auto">
                Powerful tools, beautifully simple. Plan trips that feel effortless.
              </p>
            </div>

            {/* Feature cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {features.map((feature, i) => (
                <Tilt3DCard key={i} maxTilt={8} scale={1.03}>
                  <div
                    className="feature-card group relative bg-card/40 backdrop-blur-xl border border-subtle rounded-[2rem] p-7 animate-border-glow h-full"
                    style={{ animationDelay: `${i * 0.6}s` }}
                  >
                    {/* Icon */}
                    <div className="text-4xl mb-5">{feature.icon}</div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-bright mb-2 group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Hover glow accent */}
                    <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>
                </Tilt3DCard>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────── HOW IT WORKS ─────────────── */}
        <section id="how-it-works" className="relative py-28 md:py-36 px-6">
          {/* Accent glow */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet/8 rounded-full animate-glow-breathe delay-200" style={{ filter: "blur(100px)" }} />

          <div className="relative z-10 max-w-5xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-16 md:mb-20">
              <span className="inline-block px-4 py-1.5 rounded-full bg-violet/10 text-violet text-xs font-semibold tracking-wider uppercase mb-4">
                How It Works
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-bright">
                Three Steps to Your{" "}
                <span className="bg-gradient-to-r from-violet to-gold bg-clip-text text-transparent">
                  Dream Trip
                </span>
              </h2>
              <p className="mt-4 text-muted text-lg max-w-xl mx-auto">
                From idea to itinerary in under a minute. It really is that simple.
              </p>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
              {steps.map((step, i) => (
                <div key={i} className="step-card relative group">
                  {/* Connector line (hidden on mobile, between cards on desktop) */}
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-40px)] h-px bg-gradient-to-r from-subtle via-primary/20 to-subtle" />
                  )}

                  <div className="relative bg-card/50 backdrop-blur-xl border border-subtle rounded-3xl p-8 text-center">
                    {/* Step number */}
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet/20 to-primary/20 border border-violet/20 mb-5">
                      <span className="text-sm font-bold bg-gradient-to-r from-primary to-violet bg-clip-text text-transparent">
                        {step.number}
                      </span>
                    </div>

                    {/* Icon */}
                    <div className="text-3xl mb-4">{step.icon}</div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-bright mb-3">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA below steps */}
            <div className="text-center mt-14">
              <Link
                href="/register"
                className="cta-glow inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-violet text-void font-semibold text-lg"
              >
                Start Your First Trip
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ─────────────── TESTIMONIAL / HIGHLIGHT BAND ─────────────── */}
        <section className="relative py-20 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-violet/5 to-primary/5" />
          <div className="absolute inset-0 bg-card/40 backdrop-blur-sm" />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <blockquote className="text-2xl sm:text-3xl md:text-4xl font-display font-medium text-bright leading-snug">
              &ldquo;I planned a 2-week Japan trip in{" "}
              <span className="bg-gradient-to-r from-primary to-violet bg-clip-text text-transparent">
                under 3 minutes
              </span>
              . Wandr.ai knew about festivals I didn&apos;t even know existed.&rdquo;
            </blockquote>
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-primary flex items-center justify-center text-void font-bold text-sm">
                A
              </div>
              <div className="text-left">
                <p className="text-bright text-sm font-medium">Anya K.</p>
                <p className="text-muted text-xs">Solo traveler, 12 countries</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────── FOOTER ─────────────── */}
        <footer className="relative border-t border-subtle/50 py-12 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo & tagline */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-violet flex items-center justify-center text-void font-bold text-xs">
                W
              </div>
              <span className="font-display font-bold text-bright">
                Wandr.ai
              </span>
            </div>

            {/* Middle */}
            <p className="text-muted text-sm">
              Built with <span className="text-danger">❤️</span> for modern travelers
            </p>

            {/* Copyright */}
            <p className="text-dim text-xs">
              © {new Date().getFullYear()} Wandr.ai — All rights reserved
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
