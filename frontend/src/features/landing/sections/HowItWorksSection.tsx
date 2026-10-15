import React from 'react';
import { 
  Database, 
  TrendingUp, 
  AlertOctagon, 
  BellRing, 
  CheckSquare, 
  ArrowRight,
  Zap,
  Users,
  ShieldCheck,
  Heart
} from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      step: '1',
      title: 'Collect Data',
      icon: Database,
      color: 'text-brand-cyan',
      bg: 'bg-cyan-500/10 border-cyan-500/30',
      description: 'Continuously ingest authorized, aggregated, and anonymized counts from pharmacies, clinics, and public health telemetry.',
      detail: 'Encrypted daily telemetry batching'
    },
    {
      step: '2',
      title: 'Analyze Trends',
      icon: TrendingUp,
      color: 'text-brand-blue',
      bg: 'bg-blue-500/10 border-blue-500/30',
      description: 'Compare current observations against 28-day and seasonal rolling baselines for each sub-region using statistical models.',
      detail: 'Dynamic moving medians & IQR'
    },
    {
      step: '3',
      title: 'Detect Anomalies',
      icon: AlertOctagon,
      color: 'text-brand-magenta',
      bg: 'bg-rose-500/10 border-rose-500/30',
      description: 'Flag statistically anomalous spikes in health indicators (fever complaints, antitussives, ILI clinic visits) with z-scores.',
      detail: 'Statistical z-score > 2.5σ trigger'
    },
    {
      step: '4',
      title: 'Generate Alerts',
      icon: BellRing,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
      description: 'Synthesize explainable alert cards with observed vs baseline charts, confidence ratings, and cross-validated data points.',
      detail: 'Preliminary anomaly evidence panel'
    },
    {
      step: '5',
      title: 'Support Investigation',
      icon: CheckSquare,
      color: 'text-brand-violet',
      bg: 'bg-purple-500/10 border-purple-500/30',
      description: 'Empower public health officials to assign field teams, document microbiological swabs, and verify outbreak outcomes.',
      detail: 'Audit trail & action workflows'
    },
  ];

  const impacts = [
    {
      icon: Zap,
      title: 'Early Detection',
      description: 'Identifies unusual illness clusters 3 to 7 days before clinical hospitalizations escalate.',
      color: 'text-brand-cyan',
    },
    {
      icon: Users,
      title: 'Better Decision Making',
      description: 'Guides medical supplies, mobile vaccination units, and triage staffing to priority regions.',
      color: 'text-brand-violet',
    },
    {
      icon: ShieldCheck,
      title: 'Reduced False Alarms',
      description: 'Requires multi-indicator corroboration across clinics and pharmacies to filter out retail noise.',
      color: 'text-emerald-400',
    },
    {
      icon: Heart,
      title: 'Safer Communities',
      description: 'Enables targeted, proactive interventions that preserve hospital capacity and save lives.',
      color: 'text-rose-400',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#0B0F19] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-brand-cyan text-xs font-mono mb-4">
            <span>5-STAGE SURVEILLANCE PIPELINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-display">
            Our Solution: The OutbreakIQ Engine
          </h2>
          <p className="text-base text-slate-400 mt-3 leading-relaxed">
            An end-to-end early-warning platform that connects isolated health signals, detects unusual patterns with explainable AI, and orchestrates field investigations.
          </p>
        </div>

        {/* 5 Pipeline Steps */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.step} 
                className="glass-card rounded-2xl p-6 border-slate-800 flex flex-col justify-between relative group hover:border-brand-cyan/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  {/* Step Number & Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-white flex items-center justify-center">
                      0{item.step}
                    </span>
                    <div className={`w-10 h-10 rounded-xl ${item.bg} border flex items-center justify-center ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-800/80">
                  <span className="text-[11px] font-mono text-brand-cyan">
                    {item.detail}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Expected Impact Grid */}
        <div className="mt-20 pt-16 border-t border-white/10">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-white font-display">
              Measurable Public Health Impact
            </h3>
            <p className="text-sm text-slate-400 mt-1">Built to meet the operational standards of state & municipal health agencies.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {impacts.map((imp) => {
              const Icon = imp.icon;
              return (
                <div key={imp.title} className="p-5 rounded-2xl bg-[#0F1527] border border-white/5">
                  <div className={`w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center ${imp.color} mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1.5">{imp.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{imp.description}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
