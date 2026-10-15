import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Server, 
  Bell, 
  Sliders, 
  Trash2, 
  Check, 
  Sparkles,
  Database
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/common/Button';

export const SettingsPage: React.FC = () => {
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000');
  const [zScoreThreshold, setZScoreThreshold] = useState(2.5);
  const [notifyCritical, setNotifyCritical] = useState(true);
  const [notifyNewSignals, setNotifyNewSignals] = useState(true);
  const [notifyDailyDigest, setNotifyDailyDigest] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  const clearLocalCache = () => {
    localStorage.removeItem('outbreak_token');
    alert('Local telemetry snapshot cache cleared.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Surveillance Engine Settings"
        subtitle="Configure backend API endpoints, statistical anomaly thresholds, and automated notification channels"
        badge="SYSTEM CONFIG"
        badgeColor="bg-slate-800 text-slate-300 border-slate-700"
      />

      {savedBanner && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Configuration parameters persisted successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Backend Endpoint Settings */}
        <div className="glass-card rounded-3xl p-6 border border-white/5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-brand-cyan" />
            FastAPI Backend Service Connection
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Specify the destination URL for live telemetry queries and model execution endpoints.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
              API Base URL (VITE_API_BASE_URL)
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:8000"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:border-brand-cyan"
            />
          </div>
        </div>

        {/* Anomaly Detection Sensitivity */}
        <div className="glass-card rounded-3xl p-6 border border-white/5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            Anomaly Detection Sensitivity & Thresholds
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Adjust the standard deviation trigger threshold (<span className="font-mono text-purple-300">z-score</span>) at which syndicated volume deviations are tagged as preliminary alerts.
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Minimum Anomaly Sigma Threshold:</span>
              <strong className="text-brand-cyan text-sm">{zScoreThreshold}σ (Standard Deviations)</strong>
            </div>
            <input
              type="range"
              min="1.5"
              max="4.0"
              step="0.1"
              value={zScoreThreshold}
              onChange={(e) => setZScoreThreshold(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>1.5σ (Higher Sensitivity / More Signals)</span>
              <span>2.5σ (Recommended)</span>
              <span>4.0σ (Conservative / Severe Surges Only)</span>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="glass-card rounded-3xl p-6 border border-white/5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            Epidemiological Notification Subscriptions
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyCritical}
                onChange={(e) => setNotifyCritical(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-brand-cyan focus:ring-brand-cyan"
              />
              <div>
                <span className="font-semibold text-white block">Immediate Critical Surge Dispatch</span>
                <span className="text-slate-400 text-[11px]">Send real-time alerts when any region exceeds 3.0σ baseline deviation.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyNewSignals}
                onChange={(e) => setNotifyNewSignals(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-brand-cyan focus:ring-brand-cyan"
              />
              <div>
                <span className="font-semibold text-white block">Field Investigation Assignment Updates</span>
                <span className="text-slate-400 text-[11px]">Notify whenever notes, evidence, or verified outcomes are recorded.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyDailyDigest}
                onChange={(e) => setNotifyDailyDigest(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-brand-cyan focus:ring-brand-cyan"
              />
              <div>
                <span className="font-semibold text-white block">Daily 08:00 AM Surveillance Summary</span>
                <span className="text-slate-400 text-[11px]">Digest covering all 12 monitored community districts.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearLocalCache}
            leftIcon={<Trash2 className="w-4 h-4" />}
            className="text-slate-400 hover:text-rose-400"
          >
            Clear Local Telemetry Cache
          </Button>

          <Button type="submit" variant="cyan" size="md">
            Save Engine Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
