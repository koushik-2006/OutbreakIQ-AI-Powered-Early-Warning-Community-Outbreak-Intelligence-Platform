import React from 'react';
import { Activity } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading Surveillance Data...',
  subMessage = 'Connecting to telemetry streams and anomaly detection models'
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[320px] p-8 text-center">
      <div className="relative flex items-center justify-center w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-brand-cyan/20 animate-ping" />
        <div className="absolute inset-2 rounded-full border border-brand-violet/40 animate-pulse" />
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-violet/20 to-brand-cyan/20 border border-brand-cyan/40 flex items-center justify-center shadow-glow-cyan">
          <Activity className="w-6 h-6 text-brand-cyan animate-pulse" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-slate-100 mb-1">{message}</h3>
      <p className="text-sm text-slate-400 max-w-sm">{subMessage}</p>
    </div>
  );
};
