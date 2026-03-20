import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="gradient-mesh noise-overlay min-h-screen">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/30 rounded-full text-accent text-xs font-mono tracking-widest mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          AI-POWERED VOCAL ANALYSIS
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-6">
          Hear what your
          <br />
          <span className="text-accent">voice is doing.</span>
        </h1>

        <p className="text-xl text-muted max-w-2xl mx-auto leading-relaxed mb-10">
          Record a song. Get specific, evidence-based coaching on pitch, breath,
          phonation, resonance, and technique — in under 90 seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {session ? (
            <Link
              href="/record"
              className="px-8 py-4 bg-accent text-bg font-black text-lg rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent/20"
            >
              Start Recording →
            </Link>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="px-8 py-4 bg-accent text-bg font-black text-lg rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent/20"
              >
                Get Started Free
              </Link>
              <Link
                href="#how-it-works"
                className="px-8 py-4 border border-border text-muted rounded-xl hover:border-accent/50 hover:text-text transition-all"
              >
                How it works
              </Link>
            </>
          )}
        </div>

        {/* Animated waveform decoration */}
        <div className="mt-16 flex items-end justify-center gap-1 h-16 opacity-30">
          {Array.from({ length: 48 }).map((_, i) => {
            const h = 20 + Math.sin(i * 0.5) * 15 + Math.sin(i * 1.2) * 10;
            return (
              <div
                key={i}
                className="w-1.5 bg-accent rounded-full"
                style={{
                  height: `${h}px`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 py-20 border-t border-border">
        <h2 className="text-3xl font-bold text-center mb-12">
          From recording to coaching in{" "}
          <span className="text-accent">90 seconds</span>
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "Record",
              desc: "Press record and sing naturally. Works on any device, no app download needed.",
              color: "var(--accent)",
            },
            {
              step: "02",
              title: "Separate",
              desc: "AI isolates your vocals from any backing track using state-of-the-art source separation.",
              color: "var(--accent2)",
            },
            {
              step: "03",
              title: "Measure",
              desc: "16 acoustic features extracted: pitch, jitter, shimmer, spectral data, and more.",
              color: "var(--accent3)",
            },
            {
              step: "04",
              title: "Coach",
              desc: "Seven Pillars framework analysis with specific exercises tailored to your voice.",
              color: "var(--accent4)",
            },
          ].map((item) => (
            <div key={item.step} className="relative">
              <div
                className="text-5xl font-black font-mono mb-3 opacity-20"
                style={{ color: item.color }}
              >
                {item.step}
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: item.color }}>
                {item.title}
              </h3>
              <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Seven Pillars */}
      <section className="max-w-5xl mx-auto px-4 py-20 border-t border-border">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">The Seven Pillars Framework</h2>
          <p className="text-muted max-w-xl mx-auto">
            Every analysis examines your voice across seven dimensions of vocal technique,
            grounded in professional pedagogy.
          </p>
        </div>

        <div className="grid md:grid-cols-7 gap-3">
          {[
            { label: "Breath & Support", icon: "💨", color: "#00e5ff" },
            { label: "Phonation", icon: "🎵", color: "#7c3aed" },
            { label: "Passaggio", icon: "🌉", color: "#f97316" },
            { label: "Vowel Mod.", icon: "👄", color: "#10b981" },
            { label: "Resonance", icon: "🔊", color: "#f59e0b" },
            { label: "Tension", icon: "⚡", color: "#ef4444" },
            { label: "Expression", icon: "🎭", color: "#ec4899" },
          ].map((p, i) => (
            <div
              key={p.label}
              className="border border-border rounded-xl p-4 text-center hover:border-opacity-60 transition-colors"
              style={{ borderColor: `${p.color}30` }}
            >
              <div className="text-2xl mb-2">{p.icon}</div>
              <div
                className="text-xs font-mono font-bold leading-tight"
                style={{ color: p.color }}
              >
                {p.label}
              </div>
              <div
                className="text-xs text-muted mt-1 font-mono"
                style={{ color: `${p.color}60` }}
              >
                P{i + 1}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-4 py-20 border-t border-border">
        <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              tier: "Free",
              price: "0",
              analyses: "3 / month",
              features: ["Full Seven Pillars report", "Acoustic measurements", "Prescribed exercises"],
              cta: "Start Free",
              href: "/auth/signin",
              highlight: false,
            },
            {
              tier: "Basic",
              price: "5",
              analyses: "10 / month",
              features: ["Everything in Free", "Pitch timeline chart", "Stems playback", "Phrase-by-phrase breakdown"],
              cta: "Upgrade",
              href: "/subscription",
              highlight: true,
            },
            {
              tier: "Pro",
              price: "12",
              analyses: "50 / month",
              features: ["Everything in Basic", "Mel spectrogram", "Piano roll view", "Priority processing"],
              cta: "Go Pro",
              href: "/subscription",
              highlight: false,
            },
          ].map((plan) => (
            <div
              key={plan.tier}
              className={`rounded-2xl border p-6 relative ${
                plan.highlight
                  ? "border-accent/50 bg-accent/5"
                  : "border-border bg-surface"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-bg text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
              )}
              <div className="mb-4">
                <div className="text-sm text-muted font-mono">{plan.tier}</div>
                <div className="text-4xl font-black mt-1">
                  ${plan.price}
                  <span className="text-muted text-sm font-normal"> AUD/mo</span>
                </div>
                <div className="text-sm text-accent font-mono mt-1">
                  {plan.analyses}
                </div>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-muted">
                    <span className="text-accent flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 ${
                  plan.highlight
                    ? "bg-accent text-bg shadow-lg shadow-accent/20"
                    : "border border-border text-muted hover:border-accent/50 hover:text-text"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
