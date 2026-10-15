import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  MapPin, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  Play, 
  Filter, 
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Calendar,
  Radio,
  ExternalLink
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DataFreshness } from '../../components/common/DataFreshness';
import { LoadingState } from '../../components/common/LoadingState';
import { dashboardService } from '../../services/dashboardService';
import { DashboardData } from '../../types/dashboard';
import { RealSurveillanceMap } from '../../components/map/RealSurveillanceMap';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('14d');

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const summary = await dashboardService.getSummary();
      setData(summary);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await dashboardService.runAnalysis();
      setAnalysisResult(res.message);
      // Refresh data
      await fetchDashboardData();
    } catch (err: any) {
      setAnalysisResult('Analysis failed: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading || !data) {
    return <LoadingState message="Connecting to Early-Warning Telemetry..." subMessage="Computing rolling baselines and regional risk stratifications" />;
  }

  // Filter alerts if region selected
  const filteredAlerts = selectedRegionFilter === 'all'
    ? data.recentAlerts
    : data.recentAlerts.filter(a => a.regionId === selectedRegionFilter);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Surveillance Intelligence Dashboard"
        subtitle="Automated community outbreak anomaly detection across multi-source syndromic telemetry"
        badge="LIVE PIPELINE"
        badgeColor="bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {/* Time range selector */}
            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-xl p-1 text-xs font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${timeRange === '7d' ? 'bg-brand-cyan/20 text-brand-cyan font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                7D
              </button>
              <button
                onClick={() => setTimeRange('14d')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${timeRange === '14d' ? 'bg-brand-cyan/20 text-brand-cyan font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                14D
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${timeRange === '30d' ? 'bg-brand-cyan/20 text-brand-cyan font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                30D
              </button>
            </div>

            {/* Run Analysis Trigger */}
            <Button
              variant="cyan"
              size="sm"
              isLoading={isAnalyzing}
              onClick={handleRunAnalysis}
              leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
            >
              Run Anomaly Scan
            </Button>
          </div>
        }
      >
        <DataFreshness
          lastUpdated={data.lastUpdated}
          completenessPercent={98.4}
          onRefresh={fetchDashboardData}
        />
      </PageHeader>

      {/* Analysis Result Banner */}
      {analysisResult && (
        <div className="p-3.5 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-between text-xs text-brand-cyan animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-cyan flex-shrink-0" />
            <span>{analysisResult}</span>
          </div>
          <button onClick={() => setAnalysisResult(null)} className="text-slate-400 hover:text-white font-mono">✕</button>
        </div>
      )}

      {/* 4 Core Stitch KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Regions */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Monitored Regions</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white font-display mt-2">{data.kpis.totalRegions}</p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-mono font-semibold">100% telemetry online</span>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="glass-card rounded-2xl p-5 border border-rose-500/30 bg-rose-950/10 relative overflow-hidden group hover:border-rose-500/60 transition-all shadow-sm shadow-rose-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-300">Active Signals & Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-rose-400 font-display mt-2">{data.kpis.activeAlerts}</p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-rose-300">
            <span className="font-semibold">1 Critical (CTR-01)</span>
            <span>•</span>
            <span>2 Medium Risk</span>
          </div>
        </div>

        {/* Under Investigation */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Under Investigation</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-400 font-display mt-2">{data.kpis.underInvestigation}</p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
            <span className="text-purple-300 font-mono">2 field teams deployed</span>
          </div>
        </div>

        {/* Normal Regions */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Normal / Baseline Status</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-emerald-400 font-display mt-2">{data.kpis.normalRegions}</p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-mono">No anomalies detected</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Regional Schematic Map (Left) & Indicator Trend Chart (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Regional Outbreak Surveillance Map Panel with Real Cartography */}
        <div className="lg:col-span-5 glass-card rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-cyan" />
                  Real Geographic Surveillance Map
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">High-definition cartography with real telemetry heat markers</p>
              </div>
              <Link to="/regions" className="text-xs text-brand-cyan hover:underline font-mono">
                Full Map →
              </Link>
            </div>

            {/* Real Cartographic Map */}
            <RealSurveillanceMap
              regions={data.regions}
              selectedRegionId={selectedRegionFilter !== 'all' ? selectedRegionFilter : null}
              onSelectRegion={(id) => setSelectedRegionFilter(id)}
              height="300px"
              zoom={10}
            />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Filter Active: <strong className="text-white capitalize">{selectedRegionFilter.replace('reg-', '')}</strong></span>
            {selectedRegionFilter !== 'all' && (
              <button
                onClick={() => setSelectedRegionFilter('all')}
                className="text-brand-cyan hover:underline font-mono"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Health-Indicator 14-Day Trend Chart Panel */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  Health-Indicator Multi-Stream Trends
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Observed vs expected baseline across 14-day rolling window</p>
              </div>

              <div className="flex items-center gap-4 text-[11px] font-mono">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Fever Cases</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Cough OTC</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Clinic ILI</span>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="feverGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="coughGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F1527', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#F1F5F9' }}
                  />
                  {/* Baseline expected guideline */}
                  <Area type="monotone" dataKey="baselineExpected" stroke="#64748B" strokeDasharray="4 4" fill="transparent" strokeWidth={1.5} name="Expected Baseline" />
                  <Area type="monotone" dataKey="feverCases" stroke="#EF4444" fillOpacity={1} fill="url(#feverGrad)" strokeWidth={2.5} name="Fever Complaints" />
                  <Area type="monotone" dataKey="coughSyrupSales" stroke="#F59E0B" fillOpacity={1} fill="url(#coughGrad)" strokeWidth={2} name="Cough OTC Sales" />
                  <Area type="monotone" dataKey="clinicVisits" stroke="#00F0FF" fill="transparent" strokeWidth={2} name="Clinic ILI Visits" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Statistical Trigger: <strong className="text-rose-400 font-mono">Oct 11 – Oct 14 Anomaly Surge</strong></span>
            <Link to="/reports" className="text-brand-cyan hover:underline font-mono">
              Detailed Analytics →
            </Link>
          </div>
        </div>

      </div>

      {/* Split: Recent Surveillance Signals Table (Left 8 cols) & Disease Breakdown (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Signals Table */}
        <div className="lg:col-span-8 glass-card rounded-3xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Active Early-Warning Signals
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Preliminary anomalies tagged for epidemiological review</p>
            </div>

            <Link to="/alerts">
              <Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                View All Signals
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="pb-3">Region</th>
                  <th className="pb-3">Primary Indicator</th>
                  <th className="pb-3">Change</th>
                  <th className="pb-3">z-Score</th>
                  <th className="pb-3">Severity</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 font-semibold text-white">
                      <Link to={`/regions/${alert.regionId}`} className="hover:text-brand-cyan">
                        {alert.regionName}
                      </Link>
                    </td>
                    <td className="py-3.5 text-slate-300">{alert.indicator}</td>
                    <td className="py-3.5 font-mono font-bold text-rose-400">
                      +{alert.percentChange}%
                    </td>
                    <td className="py-3.5 font-mono text-slate-300">{alert.zScore}σ</td>
                    <td className="py-3.5">
                      <StatusBadge type="severity" value={alert.severity} size="sm" />
                    </td>
                    <td className="py-3.5">
                      <StatusBadge type="status" value={alert.status} size="sm" />
                    </td>
                    <td className="py-3.5 text-right">
                      <Link to={`/alerts/${alert.id}`}>
                        <Button variant="ghost" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                          Evidence
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Disease / Symptom Distribution */}
        <div className="lg:col-span-4 glass-card rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Syndromic Distribution</h3>
            <p className="text-xs text-slate-400 mb-4">Breakdown of reported symptom encounters</p>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.diseaseDistribution}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="cases"
                  >
                    {data.diseaseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F1527', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-2">
              {data.diseaseDistribution.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-slate-300">{d.name}</span>
                  </div>
                  <span className="font-mono text-slate-400">{d.cases} cases ({d.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 text-center font-mono">
            Aggregated & Anonymized Telemetry Counts
          </div>
        </div>

      </div>
    </div>
  );
};
