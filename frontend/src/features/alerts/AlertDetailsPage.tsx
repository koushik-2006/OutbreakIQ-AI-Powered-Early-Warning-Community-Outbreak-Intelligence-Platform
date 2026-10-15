import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Radio, 
  Layers,
  ArrowRight,
  ExternalLink,
  Ban,
  MapPin
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Line 
} from 'recharts';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { alertService } from '../../services/alertService';
import { AlertSignal, AlertStatus } from '../../types/alert';
import { RealSurveillanceMap, REGION_COORDINATES } from '../../components/map/RealSurveillanceMap';
import { MOCK_REGIONS } from '../../mocks/mockData';

export const AlertDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [alert, setAlert] = useState<AlertSignal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDismissModal, setShowDismissModal] = useState(false);

  useEffect(() => {
    const fetchAlert = async () => {
      if (!id) return;
      try {
        const data = await alertService.getAlertById(id);
        setAlert(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlert();
  }, [id]);

  if (isLoading || !alert) {
    return <LoadingState message="Loading Signal Evidence Panel..." />;
  }

  const handleStartInvestigation = async () => {
    setIsUpdating(true);
    try {
      const res = await alertService.createInvestigationFromAlert(alert.id, {
        title: `Field Investigation: ${alert.title}`,
        assignedTo: 'Dr. Sarah Lin, MPH',
      });
      navigate(`/investigations/${res.investigationId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateStatus = async (newStatus: AlertStatus) => {
    setIsUpdating(true);
    try {
      const updated = await alertService.updateAlertStatus(alert.id, newStatus);
      setAlert(updated);
      setShowDismissModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link to="/alerts" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Signals</span>
      </Link>

      {/* Page Header */}
      <PageHeader
        title={alert.title}
        subtitle={alert.description}
        badge="PRELIMINARY ANOMALY"
        badgeColor="bg-rose-500/20 text-rose-300 border-rose-500/40"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {alert.investigationId ? (
              <Link to={`/investigations/${alert.investigationId}`}>
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  View Open Investigation
                </Button>
              </Link>
            ) : (
              <Button
                variant="cyan"
                size="sm"
                isLoading={isUpdating}
                onClick={handleStartInvestigation}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Initiate Field Investigation
              </Button>
            )}

            {alert.status !== 'monitoring' && (
              <Button
                variant="outline"
                size="sm"
                disabled={isUpdating}
                onClick={() => handleUpdateStatus('monitoring')}
              >
                Tag for Monitoring
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-rose-400"
              onClick={() => setShowDismissModal(true)}
            >
              Dismiss Alarm
            </Button>
          </div>
        }
      />

      {/* Anomaly Attribution Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-white/5">
          <span className="text-xs text-slate-400">Jurisdiction</span>
          <p className="text-lg font-bold text-white font-display mt-1">
            <Link to={`/regions/${alert.regionId}`} className="hover:text-brand-cyan">
              {alert.regionName}
            </Link>
          </p>
          <span className="text-[10px] text-slate-400 font-mono">Region ID: {alert.regionId}</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-rose-500/30 bg-rose-950/10 shadow-sm shadow-rose-950">
          <span className="text-xs text-rose-300">Surge Above Baseline</span>
          <p className="text-2xl font-bold text-rose-400 font-display mt-1">+{alert.percentChange}%</p>
          <span className="text-[10px] text-rose-300 font-mono">z-score: {alert.zScore}σ</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-white/5">
          <span className="text-xs text-slate-400">Model Confidence</span>
          <p className="text-2xl font-bold text-emerald-400 font-display mt-1">
            {Math.round(alert.confidenceScore * 100)}%
          </p>
          <span className="text-[10px] text-slate-400 font-mono">Multimodal Correlation</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-white/5">
          <span className="text-xs text-slate-400">Current Status</span>
          <div className="mt-2">
            <StatusBadge type="status" value={alert.status} size="sm" />
          </div>
          <span className="text-[10px] text-slate-400 font-mono block mt-1">{alert.timestamp}</span>
        </div>
      </div>

      {/* Real Geographic Hotspot View */}
      <div className="space-y-2">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-rose-400" />
          Geographic Outbreak Epicenter Map ({alert.regionName})
        </h3>
        <RealSurveillanceMap
          regions={MOCK_REGIONS}
          selectedRegionId={alert.regionId}
          height="320px"
          zoom={12}
          center={REGION_COORDINATES[alert.regionId] || [37.76, -122.32]}
        />
      </div>

      {/* Observed vs Expected Baseline Time Series */}
      {alert.evidenceTimeSeries && alert.evidenceTimeSeries.length > 0 && (
        <div className="glass-card rounded-3xl p-6 border border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-cyan" />
                Observed Volume vs Rolling 28-Day Baseline Threshold
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Red shaded region represents anomaly trigger above the 99th percentile threshold
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Observed Count</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-amber-400" /> Upper Threshold (2.5σ)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-slate-500" /> Expected Baseline</span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={alert.evidenceTimeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="alertObserved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.45}/>
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
                <Area type="monotone" dataKey="expectedBaseline" stroke="#64748B" strokeDasharray="4 4" fill="transparent" strokeWidth={1.5} name="Expected Baseline" />
                <Line type="monotone" dataKey="upperThreshold" stroke="#F59E0B" strokeWidth={2} dot={false} name="Upper 2.5σ Limit" />
                <Area type="monotone" dataKey="observed" stroke="#EF4444" fillOpacity={1} fill="url(#alertObserved)" strokeWidth={3} name="Observed Volume" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Supporting Multi-Source Indicators Grid */}
      {alert.supportingSignals && alert.supportingSignals.length > 0 && (
        <div className="glass-card rounded-3xl p-6 border border-white/5">
          <h3 className="text-base font-bold text-white mb-2">Supporting Multi-Source Telemetry Evidence</h3>
          <p className="text-xs text-slate-400 mb-6">Signals from independent community streams corroborating this anomaly.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {alert.supportingSignals.map((sig, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#090D18] border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
                      {sig.source.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-400">{sig.changeRate}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1.5">{sig.indicator}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{sig.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Reliability:</span>
                  <span className="text-emerald-400 font-bold">{Math.round(sig.reliabilityScore * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dismiss Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDismissModal}
        title="Dismiss Surveillance Signal as False Alarm?"
        message="This action will log the anomaly as a non-pathogenic variance (e.g. promotional pharmacy spike or weather anomaly) and recalibrate future sensitivity."
        confirmLabel="Dismiss Signal"
        variant="danger"
        isLoading={isUpdating}
        onConfirm={() => handleUpdateStatus('dismissed')}
        onCancel={() => setShowDismissModal(false)}
      />
    </div>
  );
};
