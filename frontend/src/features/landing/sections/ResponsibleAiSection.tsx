import React from 'react';
import { ShieldCheck, UserCheck, Eye, Lock, FileCheck, AlertCircle } from 'lucide-react';

export const ResponsibleAiSection: React.FC = () => {
  const principles = [
    {
      icon: AlertCircle,
      title: 'Preliminary Signals vs Confirmed Outbreaks',
      description: 'Anomalies detected by statistical models are strictly classified as preliminary indicators. No community alert is declared a confirmed outbreak without official epidemiologist investigation and microbiological verification.',
      color: 'text-rose-400',
    },
    {
      icon: Lock,
      title: 'Zero Patient Personal Health Information (PHI)',
      description: 'OutbreakIQ operates exclusively on authorized, anonymized, and geographically aggregated volume counts. No individual medical records, names, birthdates, or patient identifiers are ever ingested or stored.',
      color: 'text-brand-cyan',
    },
    {
      icon: Eye,
      title: 'Explainable Anomaly Attribution',
      description: 'Every alert is accompanied by full mathematical provenance—including z-score standard deviation, rolling median baseline comparisons, and supporting multi-source correlation scores—ensuring transparent algorithmic reasoning.',
      color: 'text-brand-violet',
    },
    {
      icon: UserCheck,
      title: 'Human-in-the-Loop Governance',
      description: 'AI assists and accelerates detection, but licensed public health officers retain full authority over status transitions, field task allocations, and official health department advisories.',
      color: 'text-emerald-400',
    },
  ];

  return (
    <section id="responsible-ai" className="py-24 bg-[#080C14] border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ETHICAL SURVEILLANCE & AI SAFETY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-display">
            Responsible AI & Community Privacy Safeguards
          </h2>
          <p className="text-base text-slate-400 mt-3 leading-relaxed">
            Public health intelligence demands the highest standards of epidemiological rigor, community trust, and data privacy.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {principles.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="p-6 rounded-2xl bg-[#0F1527] border border-white/5 flex gap-4">
                <div className={`w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center flex-shrink-0 ${item.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust & Compliance Badge Bar */}
        <div className="mt-12 p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-around gap-4 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-2"><FileCheck className="w-4 h-4 text-emerald-400" /> HIPAA De-Identification Compliant</span>
          <span className="flex items-center gap-2"><FileCheck className="w-4 h-4 text-emerald-400" /> GDPR Pseudonymization Adherent</span>
          <span className="flex items-center gap-2"><FileCheck className="w-4 h-4 text-brand-cyan" /> Algorithmic Audit Logging</span>
          <span className="flex items-center gap-2"><FileCheck className="w-4 h-4 text-purple-400" /> End-to-End Cryptographic Encryption</span>
        </div>

      </div>
    </section>
  );
};
