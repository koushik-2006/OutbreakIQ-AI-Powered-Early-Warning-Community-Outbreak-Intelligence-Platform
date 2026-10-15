import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  Clock,
  Layers,
  ExternalLink
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { alertService } from '../../services/alertService';
import { AlertSignal, AlertSeverity, AlertStatus } from '../../types/alert';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await alertService.getAlerts();
        setAlerts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading Surveillance Signals..." />;
  }

  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.regionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.indicator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSev = severityFilter === 'all' || a.severity === severityFilter;
    const matchesStat = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesSev && matchesStat;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Surveillance Signals & Anomaly Alerts"
        subtitle="Algorithmic early-warning signals generated from multi-source syndromic telemetry"
        badge="PRELIMINARY ANOMALIES"
        badgeColor="bg-rose-500/10 text-rose-400 border-rose-500/30"
      />

      {/* Mandatory Public Health Disclaimer Alert */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-brand-cyan flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white">Responsible AI Standard:</strong> All alerts displayed here are statistical anomalies (preliminary signals) detected through rolling baseline deviation. They do not constitute official epidemic declarations until investigated and confirmed by public health officials.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search signals by region, title, or symptom..."
            className="w-full bg-[#0F1527] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-cyan"
          />
        </div>

        {/* Severity & Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 px-2 uppercase">Severity:</span>
            {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                  severityFilter === sev
                    ? 'bg-brand-cyan/20 text-brand-cyan font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 px-2 uppercase">Status:</span>
            {['all', 'new', 'investigating', 'monitoring'].map((stat) => (
              <button
                key={stat}
                onClick={() => setStatusFilter(stat)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                  statusFilter === stat
                    ? 'bg-brand-violet/20 text-purple-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {stat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Signals Table */}
      <div className="glass-card rounded-3xl p-6 border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="pb-3.5">Signal / Title</th>
                <th className="pb-3.5">Affected Region</th>
                <th className="pb-3.5">Primary Indicator</th>
                <th className="pb-3.5">Variance</th>
                <th className="pb-3.5">z-Score</th>
                <th className="pb-3.5">Confidence</th>
                <th className="pb-3.5">Severity</th>
                <th className="pb-3.5">Status</th>
                <th className="pb-3.5 text-right">Evidence Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 pr-3">
                    <Link to={`/alerts/${alert.id}`} className="font-bold text-white hover:text-brand-cyan block">
                      {alert.title}
                    </Link>
                    <span className="text-[11px] text-slate-400 font-mono">{alert.timestamp}</span>
                  </td>

                  <td className="py-4 text-slate-300 font-medium">
                    <Link to={`/regions/${alert.regionId}`} className="hover:underline">
                      {alert.regionName}
                    </Link>
                  </td>

                  <td className="py-4 text-slate-300">{alert.indicator}</td>

                  <td className="py-4 font-mono font-bold text-rose-400">
                    +{alert.percentChange}%
                  </td>

                  <td className="py-4 font-mono text-slate-200">
                    {alert.zScore}σ
                  </td>

                  <td className="py-4 font-mono text-emerald-400">
                    {Math.round(alert.confidenceScore * 100)}%
                  </td>

                  <td className="py-4">
                    <StatusBadge type="severity" value={alert.severity} size="sm" />
                  </td>

                  <td className="py-4">
                    <StatusBadge type="status" value={alert.status} size="sm" />
                  </td>

                  <td className="py-4 text-right">
                    <Link to={`/alerts/${alert.id}`}>
                      <Button variant="cyan" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                        Review Evidence
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
