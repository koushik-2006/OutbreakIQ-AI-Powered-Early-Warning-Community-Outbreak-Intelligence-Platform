import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  FileText, 
  ExternalLink,
  ShieldAlert,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { regionService } from '../../services/regionService';
import { alertService } from '../../services/alertService';
import { Region, RegionTrendPoint } from '../../types/region';
import { AlertSignal } from '../../types/alert';
import { RealSurveillanceMap, REGION_COORDINATES } from '../../components/map/RealSurveillanceMap';

export const RegionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [region, setRegion] = useState<Region | null>(null);
  const [trends, setTrends] = useState<RegionTrendPoint[]>([]);
  const [alerts, setAlerts] = useState<AlertSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDossier = async () => {
      if (!id) return;
      try {
        const [reg, trendData, allAlerts] = await Promise.all([
          regionService.getRegionById(id),
          regionService.getRegionTrends(id),
          alertService.getAlerts(),
        ]);
        setRegion(reg);
        setTrends(trendData);
        setAlerts(allAlerts.filter(a => a.regionId === id));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDossier();
  }, [id]);

  if (isLoading || !region) {
    return <LoadingState message="Fetching Regional Epidemiological Dossier..." />;
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link to="/regions" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Regional Surveillance Directory</span>
      </Link>

      {/* Header */}
      <PageHeader
        title={`${region.name} (${region.code})`}
        subtitle={region.description || 'Comprehensive surveillance dossier and syndromic telemetry history.'}
        badge={region.riskLevel.toUpperCase() + ' RISK'}
        badgeColor={
          region.riskLevel === 'critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
          region.riskLevel === 'medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
          'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        }
        actions={
          <div className="flex items-center gap-3">
            <Link to="/reports">
              <Button variant="outline" size="sm">Export Regional Data</Button>
            </Link>
            {region.activeAlerts > 0 && (
              <Link to="/investigations">
                <Button variant="cyan" size="sm">Manage Field Investigations</Button>
              </Link>
            )}
          </div>
        }
      />

      {/* Warning Alert if critical */}
      {region.warningNote && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-start gap-3 shadow-glow-risk">
          <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-rose-200 uppercase tracking-wider font-mono">Epidemiological Alert</h4>
            <p className="text-xs text-rose-300 mt-1 leading-relaxed">{region.warningNote}</p>
          </div>
        </div>
      )}

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-white/5">
          <span className="text-xs text-slate-400">Total Population</span>
          <p className="text-2xl font-bold text-white font-display mt-1">{region.population.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400 font-mono">Census Verified</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-white/5">
          <span className="text-xs text-slate-400">Reported Cases (14D)</span>
          <p className="text-2xl font-bold text-white font-display mt-1">{region.reportedCases}</p>
          <span className="text-[10px] text-rose-400 font-mono font-bold">
            {region.changeRate > 0 ? `+${region.changeRate}% surge` : `${region.changeRate}%`}
          </span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-white/5">
          <span className="text-xs text-slate-400">Data Completeness</span>
          <p className="text-2xl font-bold text-emerald-400 font-display mt-1">{region.dataCompleteness}%</p>
          <span className="text-[10px] text-slate-400 font-mono">Sentinel Feeds Active</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-white/5">
          <span className="text-xs text-slate-400">Active Signals</span>
          <p className="text-2xl font-bold text-rose-400 font-display mt-1">{region.activeAlerts}</p>
          <span className="text-[10px] text-slate-400 font-mono">{region.activeInvestigations} in investigation</span>
        </div>
      </div>

      {/* Real Geographic Map Focused on this Region */}
      <div className="space-y-2">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand-cyan" />
          Jurisdiction Cartographic Sentinel View
        </h3>
        <RealSurveillanceMap
          regions={[region]}
          selectedRegionId={region.id}
          height="320px"
          zoom={12}
          center={REGION_COORDINATES[region.id] || [37.76, -122.32]}
        />
      </div>

      {/* 14-Day Multi-Stream Historical Indicator Trends Chart */}
      <div className="glass-card rounded-3xl p-6 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-cyan" />
              14-Day Syndromic Indicator Trends vs Expected Baseline
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Statistical anomaly detection triggers when observations exceed 2.5σ baseline</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Fever Cases</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Cough OTC</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-cyan" /> Clinic ILI</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-slate-500" /> Expected Baseline</span>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="regFever" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F1527', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#F1F5F9' }}
              />
              <Area type="monotone" dataKey="baseline" stroke="#64748B" strokeDasharray="4 4" fill="transparent" strokeWidth={1.5} name="Expected Baseline" />
              <Area type="monotone" dataKey="feverCases" stroke="#EF4444" fillOpacity={1} fill="url(#regFever)" strokeWidth={2.5} name="Fever Complaints" />
              <Area type="monotone" dataKey="coughSyrupSales" stroke="#F59E0B" fill="transparent" strokeWidth={2} name="Cough Syrup OTC Units" />
              <Area type="monotone" dataKey="iliVisits" stroke="#00F0FF" fill="transparent" strokeWidth={2} name="Clinic ILI Visits" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Local Indicators Breakdown Table */}
      {region.indicators && region.indicators.length > 0 && (
        <div className="glass-card rounded-3xl p-6 border border-white/5">
          <h3 className="text-base font-bold text-white mb-4">Granular Syndromic Indicators</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="pb-3">Indicator Name</th>
                  <th className="pb-3">Observed Value</th>
                  <th className="pb-3">Baseline Norm</th>
                  <th className="pb-3">Variance</th>
                  <th className="pb-3">Unit</th>
                  <th className="pb-3">Health Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {region.indicators.map((ind) => (
                  <tr key={ind.name} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-semibold text-white">{ind.name}</td>
                    <td className="py-3 font-mono font-bold text-white">{ind.currentValue}</td>
                    <td className="py-3 font-mono text-slate-400">{ind.baselineValue}</td>
                    <td className="py-3 font-mono font-bold text-rose-400">+{ind.percentChange}%</td>
                    <td className="py-3 text-slate-400">{ind.unit}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        ind.status === 'concerning' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        ind.status === 'elevated' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {ind.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Linked Signals for this Region */}
      {alerts.length > 0 && (
        <div className="glass-card rounded-3xl p-6 border border-white/5">
          <h3 className="text-base font-bold text-white mb-4">Active Signals in {region.name}</h3>
          <div className="space-y-3">
            {alerts.map((al) => (
              <div key={al.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <StatusBadge type="severity" value={al.severity} size="sm" />
                    <span className="font-bold text-white text-sm">{al.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">{al.description}</p>
                </div>
                <Link to={`/alerts/${al.id}`}>
                  <Button variant="cyan" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    Inspect Evidence
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
