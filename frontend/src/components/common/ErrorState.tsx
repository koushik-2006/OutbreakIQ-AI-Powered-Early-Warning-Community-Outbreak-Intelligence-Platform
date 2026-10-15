import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Data Feed Connection Error',
  message = 'Unable to establish secure telemetry connection to the backend pipeline. You can retry or switch to cached snapshot data.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center glass-card rounded-2xl border-rose-500/20 my-6">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-sm shadow-rose-950">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Retry Telemetry Query
        </Button>
      )}
    </div>
  );
};
