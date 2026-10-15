import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Search, Menu, X, ShieldCheck, Sun } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0B0D14] text-slate-100 flex flex-col font-sans selection:bg-purple-500/20 selection:text-purple-300">
      
      {/* Top Navigation Bar Matching Stitch Design */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0D14]/90 border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Left Brand: Starburst / Spoke Icon + OUTBREAK AI */}
          <Link to="/" className="flex items-center gap-3 group">
            {/* Circular Spoke Icon from Stitch screenshot */}
            <div className="w-8 h-8 rounded-full border border-slate-700/80 bg-slate-900/80 flex items-center justify-center text-slate-300 group-hover:border-purple-400 group-hover:text-purple-300 transition-colors">
              <Sun className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-sm tracking-[0.2em] text-white uppercase group-hover:text-purple-300 transition-colors">
              OUTBREAK AI
            </span>
          </Link>

          {/* Center Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wider uppercase text-slate-300">
            <Link to="/" className="relative text-white py-1 transition-colors">
              <span>HOME</span>
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
            </Link>

            <Link to="/dashboard" className="hover:text-white transition-colors text-slate-400">
              INTELLIGENCE
            </Link>

            <Link to="/regions" className="flex items-center gap-1.5 hover:text-white transition-colors text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_#A855F7]" />
              <span>SURVEILLANCE</span>
            </Link>

            <button 
              onClick={() => {
                const el = document.getElementById('how-it-works');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else window.location.hash = '#how-it-works';
              }} 
              className="hover:text-white transition-colors text-slate-400 uppercase text-xs font-semibold tracking-wider"
            >
              HOW IT WORKS
            </button>
          </nav>

          {/* Right Actions: Search Icon + EXPLORE PLATFORM Button + MENU */}
          <div className="hidden md:flex items-center gap-5">
            <button
              onClick={() => alert('Search across surveillance regions, indicators, and alerts')}
              className="text-slate-400 hover:text-white transition-colors p-1"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            <Link to="/dashboard">
              <button className="px-5 py-2.5 rounded-full bg-[#141824] hover:bg-slate-800 text-white text-xs uppercase font-semibold tracking-wider border border-slate-700/80 hover:border-slate-500 transition-all shadow-md">
                EXPLORE PLATFORM
              </button>
            </Link>

            <Link to="/login" className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-mono tracking-wider">
              <span>MENU</span>
              <div className="flex flex-col gap-1">
                <span className="w-4 h-0.5 bg-white rounded-full" />
                <span className="w-4 h-0.5 bg-white rounded-full" />
              </div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Link to="/dashboard">
              <button className="px-3 py-1.5 rounded-full bg-[#141824] border border-slate-700 text-white text-[11px] uppercase font-semibold">
                Explore
              </button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0F121C] border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-semibold tracking-wider uppercase text-white hover:bg-slate-800"
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-semibold tracking-wider uppercase text-slate-300 hover:text-white hover:bg-slate-800"
            >
              Intelligence Dashboard
            </Link>
            <Link
              to="/regions"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-semibold tracking-wider uppercase text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Surveillance Map
            </Link>
            <a
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-semibold tracking-wider uppercase text-slate-300 hover:text-white hover:bg-slate-800"
            >
              How It Works
            </a>
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full py-2.5 rounded-full border border-slate-700 text-white text-xs uppercase font-semibold">
                  Sign In
                </button>
              </Link>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full py-2.5 rounded-full bg-purple-600 text-white text-xs uppercase font-semibold">
                  Explore Platform
                </button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Modern Footer */}
      <footer className="border-t border-white/10 bg-[#08090E] pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center text-slate-300">
                  <Sun className="w-3.5 h-3.5" />
                </div>
                <span className="font-display font-bold text-sm tracking-[0.2em] text-white uppercase">
                  OUTBREAK AI
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Next-generation early-warning community outbreak intelligence engine. Connecting multi-source syndromic telemetry with explainable statistical AI.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" /> De-Identified Telemetry Standard
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4 font-mono">Surveillance Console</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Intelligence Dashboard</Link></li>
                <li><Link to="/regions" className="hover:text-white transition-colors">Regional Surveillance Map</Link></li>
                <li><Link to="/alerts" className="hover:text-white transition-colors">Early-Warning Signals</Link></li>
                <li><Link to="/investigations" className="hover:text-white transition-colors">Field Investigations</Link></li>
                <li><Link to="/data-sources" className="hover:text-white transition-colors">Data Ingestion Feeds</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4 font-mono">Methodology</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="/#how-it-works" className="hover:text-white transition-colors">5-Stage Anomaly Pipeline</a></li>
                <li><a href="/#architecture" className="hover:text-white transition-colors">FastAPI + React Stack</a></li>
                <li><a href="/#responsible-ai" className="hover:text-white transition-colors">Ethical AI Safeguards</a></li>
                <li><span className="text-slate-500">Z-score Rolling Baselines</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4 font-mono">Problem Statement</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                PS-021: Early-Warning Community Outbreak Engine (SYNAPSE '26).
              </p>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
                <div>Backend: <span className="text-purple-400">FastAPI (Python)</span></div>
                <div>Frontend: <span className="text-cyan-400">React + TS + Tailwind</span></div>
                <div>Cartography: <span className="text-emerald-400">Leaflet Dark Matter</span></div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 Outbreak AI. All rights reserved. Designed from Stitch specifications.</p>
            <span className="text-slate-400">Built for Public Health Human Review</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
