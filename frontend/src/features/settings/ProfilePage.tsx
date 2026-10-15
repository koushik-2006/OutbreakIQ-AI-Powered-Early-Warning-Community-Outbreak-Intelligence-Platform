import React from 'react';
import { 
  User as UserIcon, 
  ShieldCheck, 
  Building, 
  Mail, 
  Clock, 
  LogOut, 
  CheckCircle2, 
  Key, 
  Sparkles,
  Lock
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/auth';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const rolePermissions: Record<UserRole, string[]> = {
    epidemiologist: [
      'View Real-Time Multi-Source Surveillance Signals',
      'Conduct Full Epidemiological Investigations',
      'Confirm Outbreak Status & Issue Advisories',
      'Export Aggregate De-Identified Telemetry Data',
      'Verify Field Microbiology Swab Results',
    ],
    health_officer: [
      'View Real-Time Multi-Source Surveillance Signals',
      'Manage Field Triage Task Allocations',
      'Add Investigation Field Observations',
      'Trigger Anomaly Monitoring Workflows',
    ],
    analyst: [
      'View Regional Trends & Case Metrics',
      'Upload & Validate Batch Syndromic CSV Data',
      'Export Authorized Epidemiological Reports',
      'Inspect Raw Telemetry Ingestion Queues',
    ],
    admin: [
      'Full Administrative Console Access',
      'Configure Health Agency Jurisdictions',
      'Manage Ingestion API Connectors & Keys',
      'Audit Security Logs & Cryptographic Keys',
    ],
  };

  const currentPermissions = user?.role ? rolePermissions[user.role] : rolePermissions.epidemiologist;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Public Health User Profile"
        subtitle="Operational credentials, assigned jurisdiction, and authorized intelligence privileges"
        badge={user?.role?.toUpperCase().replace('_', ' ') || 'EPIDEMIOLOGIST'}
        badgeColor="bg-brand-cyan/20 text-brand-cyan border-brand-cyan/40"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: User Card & Role Switcher */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-white/5 text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-violet to-brand-cyan p-1 shadow-glow-cyan">
                <img
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1594824813589-a0352ffb7625?auto=format&fit=crop&q=80&w=256'}
                  alt={user?.name || 'User'}
                  className="w-full h-full rounded-full object-cover bg-slate-900"
                />
              </div>
            </div>

            <h3 className="text-xl font-bold text-white font-display">{user?.name || 'Dr. Sarah Lin, MPH'}</h3>
            <p className="text-xs text-brand-cyan font-mono font-semibold uppercase mt-0.5">
              {user?.role?.replace('_', ' ') || 'Epidemiologist'}
            </p>
            <p className="text-xs text-slate-400 mt-2">{user?.organization || 'National Public Health Surveillance Division'}</p>

            <div className="mt-6 pt-6 border-t border-slate-800 text-left space-y-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-300">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="truncate">{user?.email || 'sarah.lin@publichealth.gov'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Building className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{user?.department || 'Epidemic Intelligence & Early Warning'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>Last Login: {user?.lastLogin || 'Today at 08:30 AM'}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <Button
                variant="danger"
                size="sm"
                onClick={handleLogout}
                className="w-full"
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                Sign Out of Surveillance Console
              </Button>
            </div>
          </div>

          {/* Quick Role Simulation */}
          <div className="glass-card rounded-2xl p-5 border border-white/5 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-cyan" />
                Interactive Role Testing Switcher
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Demo Control</span>
            </div>
            <p className="text-slate-400 text-[11px] mb-3">
              Switch roles on the fly to inspect permission boundaries across the dashboard:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(['epidemiologist', 'health_officer', 'analyst', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={`p-2 rounded-xl text-left border capitalize font-semibold transition-all ${
                    user?.role === r
                      ? 'bg-brand-violet/20 border-brand-violet text-white shadow-glow-violet'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {r.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Authorized Privileges & Security Protocol */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Role-Based Access Control (RBAC) Entitlements
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Based on your role of <strong className="text-brand-cyan uppercase font-mono">{user?.role?.replace('_', ' ')}</strong>, you have been granted the following epidemiological surveillance privileges:
            </p>

            <div className="space-y-2.5 pt-2">
              {currentPermissions.map((perm, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-200">{perm}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Session Security Matrix */}
          <div className="glass-card rounded-3xl p-6 border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-cyan" />
              Session Cryptography & Device Security
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400">Authentication Token</span>
                <p className="text-white font-bold mt-1">JWT (Bearer AES-256)</p>
                <span className="text-[10px] text-emerald-400">Active & Valid</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400">Data De-Identification</span>
                <p className="text-white font-bold mt-1">HIPAA Safe Harbor</p>
                <span className="text-[10px] text-brand-cyan">No PHI Stored</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
