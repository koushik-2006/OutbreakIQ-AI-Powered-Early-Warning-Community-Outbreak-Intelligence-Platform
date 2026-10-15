import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Search, 
  Filter, 
  Layers, 
  AlertTriangle, 
  ArrowUpRight, 
  CheckCircle2, 
  TrendingUp, 
  Database,
  ShieldAlert
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { regionService } from '../../services/regionService';
import { Region, RiskLevel } from '../../types/region';
import { RealSurveillanceMap } from '../../components/map/RealSurveillanceMap';

export const RegionsPage: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [selectedMapRegion, setSelectedMapRegion] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const data = await regionService.getRegions();
        setRegions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRegions();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading Regional Surveillance Directory..." />;
  }

  // Filter & Search
  const filteredRegions = regions.filter((reg) => {
    const matchesSearch = reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          reg.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          reg.keyIndicator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'all' || reg.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Regional Surveillance Directory"
        subtitle="Geographic risk stratification across 12 monitored community jurisdictions"
        badge="12 REGIONS ACTIVE"
        badgeColor="bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30"
      />

      {/* Real Geographic Surveillance Map */}
      <RealSurveillanceMap
        regions={filteredRegions.length > 0 ? filteredRegions : regions}
        selectedRegionId={selectedMapRegion}
        onSelectRegion={setSelectedMapRegion}
        height="480px"
        zoom={10}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by region name, code (e.g. CTR-01), or symptom..."
            className="w-full bg-[#0F1527] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-cyan"
          />
        </div>

        {/* Risk Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-mono">
          <button
            onClick={() => setRiskFilter('all')}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              riskFilter === 'all'
                ? 'bg-slate-800 text-white border-slate-600'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            All (12)
          </button>
          <button
            onClick={() => setRiskFilter('critical')}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              riskFilter === 'critical'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-rose-400'
            }`}
          >
            Critical (1)
          </button>
          <button
            onClick={() => setRiskFilter('medium')}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              riskFilter === 'medium'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-amber-400'
            }`}
          >
            Medium (2)
          </button>
          <button
            onClick={() => setRiskFilter('low')}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              riskFilter === 'low'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-cyan-400'
            }`}
          >
            Low (1)
          </button>
          <button
            onClick={() => setRiskFilter('normal')}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              riskFilter === 'normal'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-emerald-400'
            }`}
          >
            Normal (8)
          </button>
        </div>
      </div>

      {/* Regional Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRegions.map((region) => {
          const isSelected = selectedMapRegion === region.id;
          return (
            <div
              key={region.id}
              className={`glass-card rounded-2xl p-6 border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-brand-cyan shadow-glow-cyan'
                  : 'border-white/5 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">{region.name}</h4>
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                        {region.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Pop: {region.population.toLocaleString()}</p>
                  </div>
                  <StatusBadge type="risk" value={region.riskLevel} size="sm" />
                </div>

                {/* Key Indicator Highlight */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Primary Anomaly Signal:</span>
                    <span className={`font-mono font-bold ${
                      region.changeRate > 100 ? 'text-rose-400' : region.changeRate > 50 ? 'text-amber-400' : 'text-slate-300'
                    }`}>
                      {region.changeRate > 0 ? `+${region.changeRate}%` : `${region.changeRate}%`}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 mt-0.5">{region.keyIndicator}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                  <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/40">
                    <p className="text-[10px] text-slate-400 font-mono">Reported Cases</p>
                    <p className="font-bold text-white mt-0.5">{region.reportedCases}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/40">
                    <p className="text-[10px] text-slate-400 font-mono">Active Alerts</p>
                    <p className={`font-bold mt-0.5 ${region.activeAlerts > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                      {region.activeAlerts}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/40">
                    <p className="text-[10px] text-slate-400 font-mono">Completeness</p>
                    <p className="font-bold text-emerald-400 mt-0.5">{region.dataCompleteness}%</p>
                  </div>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Sync: {region.lastUpdated}
                </span>
                <Link to={`/regions/${region.id}`}>
                  <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                    Inspect Dossier
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
