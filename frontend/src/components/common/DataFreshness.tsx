import React from 'react';
import { RefreshCw, Radio, CheckCircle, Database } from 'lucide-react';

interface DataFreshnessProps {
  lastUpdated?: string;
  isBackendConnected?: boolean;
  completenessPercent?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const DataFreshness: React.FC<DataFreshnessProps> = ({
  lastUpdated = '4 mins ago',
  isBackendConnected = false,
  completenessPercent = 98.4,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#0F1527]/80 border border-white/5 text-xs text-slate-400">
      <div className="flex items-center gap-3">
        {/* Backend mode indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/90 border border-slate-700/60">
          <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse'}`} />
          <span className="font-mono text-[11px] text-slate-300">
            {isBackendConnected ? 'FastAPI API Live' : 'Demo Telemetry Engine'}
          </span>
        </div>

        {/* Freshness */}
        <div className="flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-brand-cyan" />
          <span>Stream Latency: <strong className="text-slate-200">{lastUpdated}</strong></span>
        </div>

        {/* Completeness */}
        <div className="hidden sm:flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Coverage: <strong className="text-slate-200">{completenessPercent}%</strong></span>
        </div>
      </div>

      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-md transition-colors border border-transparent hover:border-slate-700"
          title="Refresh real-time surveillance feed"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-brand-cyan' : ''}`} />
          <span>{isRefreshing ? 'Syncing...' : 'Sync Now'}</span>
        </button>
      )}
    </div>
  );
};
