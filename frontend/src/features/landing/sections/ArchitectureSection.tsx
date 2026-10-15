import React from 'react';
import { 
  Code2, 
  Server, 
  Database, 
  Cloud, 
  ArrowRight, 
  Layers, 
  Cpu, 
  Monitor, 
  Lock,
  GitBranch
} from 'lucide-react';

export const ArchitectureSection: React.FC = () => {
  return (
    <section id="architecture" className="py-24 bg-[#0B0F19] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-mono mb-4">
            <Cpu className="w-3.5 h-3.5" />
            <span>PRODUCTION-READY SYSTEM ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-display">
            Built on a High-Performance Modern Stack
          </h2>
          <p className="text-base text-slate-400 mt-3 leading-relaxed">
            Architected according to the PS-021 technical specification with clear boundaries between statistical anomaly detection, FastAPI REST services, and reactive React analytics.
          </p>
        </div>

        {/* 4 Technology Stack Pillars (From Stitch Infographic) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          
          {/* Frontend */}
          <div className="glass-card rounded-2xl p-6 border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-brand-cyan">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Frontend</h3>
                <p className="text-[11px] text-slate-400">User Interface & Dashboard</p>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 font-mono">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" /> React (UI Library)</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" /> TypeScript (Safety)</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" /> Vite (Build Tool)</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" /> Tailwind CSS (Styling)</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" /> Recharts (Data Viz)</li>
            </ul>
          </div>

          {/* Backend */}
          <div className="glass-card rounded-2xl p-6 border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Backend</h3>
                <p className="text-[11px] text-slate-400">API & Business Logic</p>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 font-mono">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> FastAPI (High-Speed REST)</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Pydantic (Schema Validation)</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> SQLAlchemy (Database ORM)</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Pandas (Aggregations)</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Python 3.11+</li>
            </ul>
          </div>

          {/* Database */}
          <div className="glass-card rounded-2xl p-6 border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Database</h3>
                <p className="text-[11px] text-slate-400">Persistent Storage</p>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 font-mono">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> PostgreSQL (Relational DB)</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Alembic (Migrations)</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Partitioned Observations</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Audit Logs & Timelines</li>
            </ul>
          </div>

          {/* Tools & Cloud */}
          <div className="glass-card rounded-2xl p-6 border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Cloud & Tools</h3>
                <p className="text-[11px] text-slate-400">Deployment & CI/CD</p>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 font-mono">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> GitHub (Source Control)</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Vercel / Netlify (Frontend)</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Render / Railway (Backend)</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Cloud PostgreSQL</li>
            </ul>
          </div>

        </div>

        {/* End-to-End Pipeline Visualization Flow */}
        <div className="p-8 rounded-3xl bg-[#0F1527] border border-white/5">
          <div className="text-center mb-8">
            <h3 className="text-lg font-bold text-white">End-to-End Early-Warning Data Pipeline</h3>
            <p className="text-xs text-slate-400 mt-1">From raw community telemetry to validated public health interventions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative text-center">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400">Step 1</span>
              <h4 className="text-sm font-semibold text-white mt-1">Data Sources</h4>
              <p className="text-[11px] text-slate-400 mt-1">Pharmacies, Clinics, Labs</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400">Step 2</span>
              <h4 className="text-sm font-semibold text-white mt-1">Ingestion & ETL</h4>
              <p className="text-[11px] text-slate-400 mt-1">Cleaning, Aggregation, Validation</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-brand-cyan/40 shadow-glow-cyan">
              <span className="text-[10px] font-mono uppercase text-brand-cyan font-semibold">Step 3 (AI)</span>
              <h4 className="text-sm font-semibold text-brand-cyan mt-1">Detection Engine</h4>
              <p className="text-[11px] text-slate-300 mt-1">Z-score Baseline Anomaly Models</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400">Step 4</span>
              <h4 className="text-sm font-semibold text-white mt-1">FastAPI REST</h4>
              <p className="text-[11px] text-slate-400 mt-1">JSON APIs, Auth, Business Logic</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/40">
              <span className="text-[10px] font-mono uppercase text-purple-400 font-semibold">Step 5</span>
              <h4 className="text-sm font-semibold text-purple-300 mt-1">React Dashboard</h4>
              <p className="text-[11px] text-slate-300 mt-1">Surveillance Map & Investigations</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
