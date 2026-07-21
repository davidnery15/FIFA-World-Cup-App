"use client";

import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

export default function HomePage() {
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden antialiased">
      {/* Background ambient lighting effects (Glow) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-emerald-600/20 to-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏆</span>
          <span className="font-extrabold tracking-tight text-xl bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            World Cup
          </span>
        </div>

        <nav className="flex items-center gap-4">
          {!isLoading &&
            (isAuthenticated ? (
              <Link
                href="/album"
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all duration-200 active:scale-95"
              >
                Go to Album ({user?.name})
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all duration-200 active:scale-95"
                >
                  Get Started
                </Link>
              </>
            ))}
        </nav>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 my-12">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-8 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>The 2026 Collector Platform</span>
        </div>

        {/* Main Headline */}
        <h1 className="max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
          Complete Your Album Without the{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">Guesswork.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl text-base sm:text-lg text-slate-400 font-normal leading-relaxed">
          Track your collection, list your duplicates, and let our smart matchmaking engine instantly find collectors who have exactly the
          stickers you need.
        </p>

        {/* Dynamic CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          {isAuthenticated ? (
            <Link
              href="/album"
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500 transition-all duration-200 active:scale-98 text-center"
            >
              Open My Dashboard ⚽
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500 transition-all duration-200 active:scale-98 text-center"
              >
                Start Collecting Now
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 px-8 py-4 text-base font-semibold text-slate-200 transition-all duration-200 text-center backdrop-blur-md"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-left">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl mb-4">
              📖
            </div>
            <h3 className="text-lg font-bold text-white">Digital Inventory</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Keep an accurate real-time count of every sticker in your collection and manage your available duplicates from any device.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-xl mb-4">
              🤝
            </div>
            <h3 className="text-lg font-bold text-white">Smart Matchmaking</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Our automated algorithm scans the community inventory to prioritize mutual matches where both collectors benefit
              simultaneously.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl mb-4">
              🔄
            </div>
            <h3 className="text-lg font-bold text-white">Atomic Swaps</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Send proposals and execute direct sticker exchanges with double-verification security at the exact moment of acceptance.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 py-8 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} World Cup Trading Platform.</p>
      </footer>
    </div>
  );
}
