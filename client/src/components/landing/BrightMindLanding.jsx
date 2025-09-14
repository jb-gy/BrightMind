import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Play, Pause, RotateCcw } from "lucide-react";

/**
 * BrightMind Landing (revamped)
 * - Clean imports, no duplicates
 * - No Research section (per request)
 * - Multipurpose positioning (education, personal/learning leisure, productivity, accessibility)
 * - Accessible controls, semantic structure, responsive layout
 * - TailwindCSS utility classes
 */

// -----------------------------
// Navigation
// -----------------------------
function Navigation({ onSignIn }) {
  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
            <Brain className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <span className="text-2xl font-bold text-white">BrightMind</span>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
          <a href="#use-cases" className="text-slate-300 hover:text-white transition-colors">Use Cases</a>
          <a href="#cta" className="text-slate-300 hover:text-white transition-colors">Get Started</a>
          <button
            onClick={onSignIn}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    </nav>
  );
}

// -----------------------------
// Live Reading Demo
// -----------------------------
function LiveReadingDemo() {
  const [currentWord, setCurrentWord] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const demoText =
    "The young adventurer discovered a hidden pathway through the ancient forest where mystical creatures danced beneath the moonlit canopy creating an enchanting symphony of nature.";
  const words = useMemo(() => demoText.split(" "), [demoText]);

  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 800);
    return () => window.clearInterval(id);
  }, [isPlaying, words.length]);

  const progress = Math.round((currentWord / words.length) * 100);
  const wordsLeft = Math.max(words.length - currentWord, 0);

  return (
    <section aria-label="Live reading demo" className="bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-lg overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex space-x-2 mr-4" aria-hidden="true">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <div className="w-3 h-3 bg-green-500 rounded-full" />
          </div>
          <span className="text-slate-300 text-sm font-mono">Reading Session · Sample</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
            aria-label={isPlaying ? "Pause demo" : "Play demo"}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={() => setCurrentWord(0)}
            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
            aria-label="Restart demo"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-lg leading-relaxed" aria-live="polite">
          {words.map((word, i) => (
            <span
              key={i}
              className={`mr-2 transition-all duration-300 ${
                i === currentWord
                  ? "bg-blue-500/30 text-blue-300 px-1 rounded font-semibold shadow-lg"
                  : i < currentWord
                  ? "text-slate-500"
                  : "text-slate-300"
              }`}
            >
              {word}
            </span>
          ))}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{progress}%</div>
            <div className="text-xs text-slate-500">Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{wordsLeft}</div>
            <div className="text-xs text-slate-500">Words Left</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${isPlaying ? "text-green-400" : "text-slate-400"}`}>{
              isPlaying ? "LIVE" : "PAUSED"
            }</div>
            <div className="text-xs text-slate-500">Status</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// -----------------------------
// Live Stats pill
// -----------------------------
function LiveStats({ readersCount }) {
  return (
    <div className="inline-flex items-center px-6 py-3 bg-slate-800/50 rounded-full border border-slate-700/50 backdrop-blur-lg">
      <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse" aria-hidden="true" />
      <span className="text-white font-semibold mr-2">LIVE NOW</span>
      <span className="text-slate-300">{readersCount.toLocaleString()} readers active</span>
    </div>
  );
}

// -----------------------------
// Feature Grid (multipurpose)
// -----------------------------
function FeatureGrid() {
  const features = [
    {
      title: "Guided Reading",
      description:
        "Smart highlighting and pacing to stay focused across articles, papers, and books.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Voice & Timing",
      description:
        "Natural narration with adjustable speed and pause cues for deep work or leisure.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Comprehension Tools",
      description:
        "Inline summaries, key-point extraction, and glossary lookups when you need them.",
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div id="features" className="grid md:grid-cols-3 gap-6">
      {features.map((f, i) => (
        <div
          key={i}
          className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30 hover:border-slate-600/50 transition-all group"
        >
          <div className={`w-12 h-12 bg-gradient-to-r ${f.gradient} rounded-lg mb-4 opacity-80 group-hover:opacity-100 transition-opacity`} />
          <h3 className="text-xl font-semibold text-white mb-3">{f.title}</h3>
          <p className="text-slate-400 leading-relaxed">{f.description}</p>
        </div>
      ))}
    </div>
  );
}

// -----------------------------
// Use Cases (broader than education only)
// -----------------------------
function UseCasesPanel() {
  const [activeCase, setActiveCase] = useState(0);
  const cases = [
    { title: "Education", stat: "85%", metric: "Focus Gains" },
    { title: "Personal Leisure", stat: "3x", metric: "Session Length" },
    { title: "Productivity", stat: "2.1x", metric: "Reading Speed" },
    { title: "Accessibility", stat: "90%", metric: "Task Completion" },
  ];

  useEffect(() => {
    const id = window.setInterval(() => setActiveCase((p) => (p + 1) % cases.length), 2400);
    return () => window.clearInterval(id);
  }, [cases.length]);

  return (
    <section id="use-cases" className="bg-slate-800/30 rounded-xl p-8 border border-slate-700/30">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold text-white mb-2">Works Wherever You Read</h3>
        <p className="text-slate-400">Academic study, articles, novels, reports, and more</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cases.map((c, i) => (
          <button
            key={i}
            type="button"
            className={`p-4 rounded-lg text-center transition-all ${
              activeCase === i ? "bg-blue-500/20 border border-blue-500/50" : "bg-slate-700/30 hover:bg-slate-700/50"
            }`}
            onClick={() => setActiveCase(i)}
            aria-pressed={activeCase === i}
          >
            <div className={`text-3xl font-bold mb-2 ${activeCase === i ? "text-blue-400" : "text-slate-300"}`}>{
              c.stat
            }</div>
            <div className="text-sm text-slate-400">{c.metric}</div>
            <div className="text-xs text-slate-500 mt-1">{c.title}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

// -----------------------------
// Footer
// -----------------------------
function Footer() {
  return (
    <footer className="bg-slate-900/50 border-t border-slate-700/50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-center mb-6">
          <Brain className="w-8 h-8 text-blue-400 mr-3" aria-hidden="true" />
          <span className="text-2xl font-bold text-white">BrightMind</span>
        </div>
        <p className="text-center text-slate-400 mb-8">
          Read better while you're studying, relaxing, or getting work done.
        </p>
        <div className="text-center text-slate-500 text-sm">© {new Date().getFullYear()} BrightMind. All rights reserved.</div>
      </div>
    </footer>
  );
}

// -----------------------------
// Main Page
// -----------------------------
export default function BrightMindLanding() {
  const navigate = useNavigate();
  const [readersCount, setReadersCount] = useState(1247);

  useEffect(() => {
    const id = window.setInterval(() => {
      setReadersCount((prev) => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  const handleStart = () => navigate("/reader");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation onSignIn={handleStart} />

      {/* Hero */}
      <header className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="text-white">
              <div className="mb-8">
                <LiveStats readersCount={readersCount} />
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                Reading
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  for Every Context
                </span>
              </h1>

              <p className="text-lg lg:text-xl text-slate-300 mb-8 leading-relaxed max-w-xl">
                An adaptive reading experience that supports studying, personal learning, and focused work. Guided pacing, voice, and comprehension tools help you retain more with less effort.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={handleStart}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-2xl"
                >
                  Start Reading
                </button>
                <a href="#features" className="text-slate-300 hover:text-white underline underline-offset-4">
                  Explore features
                </a>
              </div>

              {/* Quick Stats */}
              <dl className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-slate-700/50" aria-label="Quick stats">
                <div>
                  <dt className="text-sm text-slate-400">Better Focus</dt>
                  <dd className="text-3xl font-bold text-white">85%</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-400">Faster Reading</dt>
                  <dd className="text-3xl font-bold text-white">3×</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-400">User Satisfaction</dt>
                  <dd className="text-3xl font-bold text-white">92%</dd>
                </div>
              </dl>
            </div>

            {/* Right */}
            <div className="relative">
              <LiveReadingDemo />
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">What Makes It Different</h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Tools that adapt to your pace and purpose—whether you’re preparing for exams, enjoying a novel, or powering through reports.
            </p>
          </div>
          <FeatureGrid />
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <UseCasesPanel />
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Read Better?</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands using an adaptive assistant to focus, understand, and enjoy reading across any context.
          </p>
          <button
            onClick={handleStart}
            className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-2xl text-lg"
          >
            Launch Application
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
