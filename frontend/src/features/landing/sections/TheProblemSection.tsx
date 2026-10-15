import React from 'react';
import { 
  ShoppingBag, 
  Building2, 
  FileText, 
  Layers, 
  Clock, 
  AlertTriangle, 
  Network, 
  Lock,
  ArrowDown
} from 'lucide-react';

export const TheProblemSection: React.FC = () => {
  return (
    <section id="problem" className="py-20 bg-[#080C14] border-t border-b border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono mb-4">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>CRITICAL SURVEILLANCE GAP</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-display">
            The Problem: Early Signs Are Scattered & Delayed
          </h2>
          <p className="text-base text-slate-400 mt-3 leading-relaxed">
            Before an epidemic is officially confirmed, the community already leaves digital and physical footprints. Today, these critical indicators live in isolated data silos.
          </p>
        </div>

        {/* 3 Siloed Sources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Pharmacies */}
          <div className="glass-card rounded-2xl p-6 border-slate-700/60 relative group hover:border-slate-500 transition-all">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Community Pharmacies</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Sudden surge in over-the-counter fever medications, paracetamol, and cough syrups purchased days before doctor visits occur.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-mono text-slate-400">
              Latency: Days 1 – 3
            </div>
          </div>

          {/* Clinics & Hospitals */}
          <div className="glass-card rounded-2xl p-6 border-slate-700/60 relative group hover:border-slate-500 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Clinics & Urgent Cares</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Clusters of patients presenting with matching syndromic chief complaints (fever, cough, vomiting) across uncoordinated provider networks.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-mono text-slate-400">
              Latency: Days 4 – 7
            </div>
          </div>

          {/* Public Health Reports */}
          <div className="glass-card rounded-2xl p-6 border-slate-700/60 relative group hover:border-slate-500 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Public Health Reports</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Traditional statutory lab reporting and pathogen sequencing reports arrive 2 to 3 weeks late, often after peak community transmission has passed.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-mono text-slate-400">
              Latency: Days 14 – 21
            </div>
          </div>
        </div>

        {/* Central Convergence Point */}
        <div className="my-8 flex flex-col items-center justify-center">
          <ArrowDown className="w-6 h-6 text-rose-500 animate-bounce mb-2" />
          <div className="px-6 py-2 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-sm font-semibold tracking-wide shadow-sm shadow-rose-950">
            Data Is Scattered and Disconnected
          </div>
        </div>

        {/* 5 Core Challenges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
          <div className="p-4 rounded-xl bg-[#0F1527] border border-white/5 text-center">
            <Layers className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <h4 className="text-xs font-semibold text-slate-200">Scattered Data</h4>
            <p className="text-[11px] text-slate-400 mt-1">Different sources with no unified pipeline.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0F1527] border border-white/5 text-center">
            <Clock className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <h4 className="text-xs font-semibold text-slate-200">Delayed Reporting</h4>
            <p className="text-[11px] text-slate-400 mt-1">Critical signals arrive too late for containment.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0F1527] border border-white/5 text-center">
            <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <h4 className="text-xs font-semibold text-slate-200">False Alarms</h4>
            <p className="text-[11px] text-slate-400 mt-1">Seasonal promotions & weather mislead uncalibrated models.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0F1527] border border-white/5 text-center">
            <Network className="w-6 h-6 text-brand-cyan mx-auto mb-2" />
            <h4 className="text-xs font-semibold text-slate-200">Hidden Patterns</h4>
            <p className="text-[11px] text-slate-400 mt-1">Subtle micro-clusters blend into noise without AI.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0F1527] border border-white/5 text-center col-span-2 md:col-span-1">
            <Lock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <h4 className="text-xs font-semibold text-slate-200">Privacy Concerns</h4>
            <p className="text-[11px] text-slate-400 mt-1">Community health data must maintain strict anonymization.</p>
          </div>
        </div>

        {/* Bottom Impact Callout */}
        <div className="mt-10 p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900/80 to-rose-950/40 border border-rose-500/30 text-center">
          <p className="text-sm sm:text-base text-rose-200 font-medium">
            <strong>Impact:</strong> When disease outbreaks are recognized too late, community spread accelerates, emergency healthcare capacity is compromised, and lives are put at risk.
          </p>
        </div>

      </div>
    </section>
  );
};
