import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, LayoutDashboard } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-6 shadow-glow-risk animate-pulse">
        <ShieldAlert className="w-10 h-10" />
      </div>

      <h1 className="text-4xl sm:text-6xl font-bold font-display text-white mb-2">404</h1>
      <h2 className="text-xl sm:text-2xl font-bold text-slate-200 mb-3">
        Surveillance Sector Not Found
      </h2>
      <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
        The requested epidemiological route, telemetry dossier, or incident stream does not exist or has been archived.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link to="/dashboard">
          <Button variant="cyan" size="md" leftIcon={<LayoutDashboard className="w-4 h-4" />}>
            Operational Dashboard
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline" size="md" leftIcon={<Home className="w-4 h-4" />}>
            Public Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
};
