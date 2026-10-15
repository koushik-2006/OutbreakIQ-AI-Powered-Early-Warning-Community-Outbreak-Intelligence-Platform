import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, ShieldAlert, Sparkles } from 'lucide-react';
import { RiskLevel } from '../../types/region';
import { AlertSeverity, AlertStatus } from '../../types/alert';
import { InvestigationStatus, InvestigationPriority } from '../../types/investigation';

interface StatusBadgeProps {
  type?: 'risk' | 'severity' | 'status' | 'priority';
  value: RiskLevel | AlertSeverity | AlertStatus | InvestigationStatus | InvestigationPriority | string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type = 'risk',
  value,
  size = 'md',
  showIcon = true,
}) => {
  const val = value.toLowerCase();

  let styles = 'bg-slate-800 text-slate-300 border-slate-700';
  let icon = null;
  let label = value.replace(/_/g, ' ');

  // Risk or Severity
  if (val === 'critical') {
    styles = 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-sm shadow-rose-950';
    icon = <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
  } else if (val === 'high' || val === 'urgent') {
    styles = 'bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-sm shadow-orange-950';
    icon = <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />;
  } else if (val === 'medium') {
    styles = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    icon = <AlertCircle className="w-3.5 h-3.5 text-amber-400" />;
  } else if (val === 'low') {
    styles = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    icon = <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
  } else if (val === 'normal' || val === 'resolved' || val === 'verified_outbreak') {
    if (val === 'verified_outbreak') {
      styles = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      icon = <AlertCircle className="w-3.5 h-3.5 text-purple-400" />;
      label = 'Verified Outbreak';
    } else {
      styles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    }
  } else if (val === 'new') {
    styles = 'bg-rose-500/15 text-rose-300 border-rose-500/40 animate-pulse';
    icon = <AlertCircle className="w-3.5 h-3.5 text-rose-300" />;
    label = 'New Alert';
  } else if (val === 'investigating' || val === 'in_progress') {
    styles = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    icon = <Clock className="w-3.5 h-3.5 text-blue-400" />;
    label = val === 'investigating' ? 'Investigating' : 'In Progress';
  } else if (val === 'monitoring' || val === 'open') {
    styles = 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
    icon = <Clock className="w-3.5 h-3.5 text-indigo-300" />;
    label = val === 'monitoring' ? 'Monitoring' : 'Open';
  } else if (val === 'false_positive' || val === 'dismissed') {
    styles = 'bg-slate-700/30 text-slate-400 border-slate-700/50';
    label = val === 'false_positive' ? 'False Alarm' : 'Dismissed';
  }

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span className={`inline-flex items-center font-medium capitalize rounded-full border ${sizeClass} ${styles}`}>
      {showIcon && icon}
      <span>{label}</span>
    </span>
  );
};
