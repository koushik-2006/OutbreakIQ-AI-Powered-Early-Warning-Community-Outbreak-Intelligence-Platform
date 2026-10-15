import React from 'react';
import { ShieldCheck, Search } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: 'search' | 'check' | 'custom';
  customIcon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'check',
  customIcon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center glass-card rounded-2xl border-white/5 my-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 mb-4">
        {customIcon ? (
          customIcon
        ) : icon === 'search' ? (
          <Search className="w-6 h-6 text-brand-cyan" />
        ) : (
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
        )}
      </div>
      <h3 className="text-base font-semibold text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
