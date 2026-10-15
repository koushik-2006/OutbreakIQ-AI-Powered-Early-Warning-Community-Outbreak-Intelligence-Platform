import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Activity,
  Layers
} from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { RealSurveillanceMap } from '../../../components/map/RealSurveillanceMap';
import { MOCK_REGIONS } from '../../../mocks/mockData';

export const ProductPreviewSection: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>('reg-central');
  const activeRegion = MOCK_REGIONS.find(r => r.id === selectedRegion) || MOCK_REGIONS[0];

  return (
    <section id="preview" className="py-24 bg-[#080C14] border-t border-b border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-violet/10 border border-brand-violet/30 text-purple-400 text-xs font-mono mb-3">
            <Activity className="w-3.5 h-3.5" />
            <span>INTERACTIVE DASHBOARD REPLICA</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-display">
            Designed for High-Pressure Decision Making
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            The operational dashboard as envisioned in the Stitch design reference, combining regional risk maps with real-time syndromic alerts.
          </p>
        </div>

        {/* Dashboard Frame (Matches Stitch Screenshot exactly) */}
        <div className="rounded-3xl border border-white/10 bg-[#0A0E1A] shadow-2xl overflow-hidden">
          
          {/* Mock Window Topbar */}
          <div className="bg-[#0D1527] px-6 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 font-mono text-xs text-slate-300 font-semibold flex items-center gap-2">
                <span className="text-brand-cyan">OutbreakIQ</span> Dashboard Console
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="hidden sm:inline">Region: <strong className="text-white">All Monitored (12)</strong></span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                3 Active Alerts
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            
            {/* 4 KPI Cards (Stitch design row) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Regions */}
              <div className="p-4 rounded-2xl bg-[#0F1527] border border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total Regions</p>
                  <p className="text-2xl font-bold text-white font-display">12</p>
                </div>
              </div>

              {/* Active Alerts */}
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Active Alerts</p>
                  <p className="text-2xl font-bold text-rose-400 font-display">3</p>
                </div>
              </div>

              {/* Under Investigation */}
              <div className="p-4 rounded-2xl bg-[#0F1527] border border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Under Investigation</p>
                  <p className="text-2xl font-bold text-purple-400 font-display">2</p>
                </div>
              </div>

              {/* Normal */}
              <div className="p-4 rounded-2xl bg-[#0F1527] border border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Normal</p>
                  <p className="text-2xl font-bold text-emerald-400 font-display">7</p>
                </div>
              </div>
            </div>

            {/* Split: Regional Outbreak Map (Left) & Recent Alerts Table (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Regional Schematic Map */}
              <div className="lg:col-span-6 p-5 rounded-2xl bg-[#0F1527] border border-white/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-brand-cyan" />
                      Regional Outbreak Surveillance Map
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] font-mono">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> High</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Med</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Normal</span>
                    </div>
                  </div>

                  {/* Real Geographic Surveillance Map */}
                  <div className="overflow-hidden rounded-xl border border-slate-800">
                    <RealSurveillanceMap
                      regions={MOCK_REGIONS}
                      selectedRegionId={selectedRegion}
                      onSelectRegion={setSelectedRegion}
                      height="260px"
                      zoom={9}
                    />
                  </div>
                </div>

                {/* Selected Region Micro Detail */}
                <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Selected: </span>
                    <strong className="text-white font-semibold">{activeRegion.name} ({activeRegion.code})</strong>
                    <span className="ml-2 text-slate-400">({activeRegion.keyIndicator})</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                    activeRegion.riskLevel === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                    activeRegion.riskLevel === 'high' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                    activeRegion.riskLevel === 'medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {activeRegion.changeRate > 0 ? `+${activeRegion.changeRate}%` : `${activeRegion.changeRate}%`}
                  </span>
                </div>
              </div>

              {/* Recent Alerts Table (Stitch design layout) */}
              <div className="lg:col-span-6 p-5 rounded-2xl bg-[#0F1527] border border-white/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      Recent Surveillance Signals
                    </h3>
                    <Link to="/alerts" className="text-xs text-brand-cyan hover:underline font-mono">
                      View All (3) →
                    </Link>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                          <th className="pb-2.5">Region</th>
                          <th className="pb-2.5">Indicator</th>
                          <th className="pb-2.5">Change</th>
                          <th className="pb-2.5">Risk</th>
                          <th className="pb-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {/* Central Row */}
                        <tr className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 font-semibold text-white">Central</td>
                          <td className="py-3 text-slate-300">Fever cases</td>
                          <td className="py-3 font-mono font-bold text-rose-400">+180%</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold">
                              High
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/15 text-rose-300 font-semibold animate-pulse">
                              New
                            </span>
                          </td>
                        </tr>

                        {/* North Row */}
                        <tr className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 font-semibold text-white">North</td>
                          <td className="py-3 text-slate-300">Cough medicine sales</td>
                          <td className="py-3 font-mono font-bold text-amber-400">+120%</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                              Medium
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/15 text-blue-300 font-semibold">
                              Investigating
                            </span>
                          </td>
                        </tr>

                        {/* West Row */}
                        <tr className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 font-semibold text-white">West</td>
                          <td className="py-3 text-slate-300">Clinic visits (ILI)</td>
                          <td className="py-3 font-mono font-bold text-amber-400">+90%</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                              Medium
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/15 text-blue-300 font-semibold">
                              Investigating
                            </span>
                          </td>
                        </tr>

                        {/* East Row */}
                        <tr className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 font-semibold text-white">East</td>
                          <td className="py-3 text-slate-300">Fever cases</td>
                          <td className="py-3 font-mono font-bold text-cyan-400">+20%</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                              Low
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/15 text-indigo-300 font-semibold">
                              Monitoring
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Cross-referenced with 4 authorized telemetry feeds
                  </span>
                  <Link to="/dashboard">
                    <Button variant="cyan" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Explore Full Dashboard
                    </Button>
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
