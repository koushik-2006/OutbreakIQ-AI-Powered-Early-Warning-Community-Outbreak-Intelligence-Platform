import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  TrendingUp, 
  AlertTriangle, 
  ClipboardList, 
  Database, 
  User as UserIcon, 
  Settings, 
  LogOut, 
  ChevronRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import logoSvg from '../../assets/logo.svg';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/auth';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Regional Map', path: '/regions', icon: Map },
    { label: 'Trends & Analytics', path: '/reports', icon: TrendingUp },
    { 
      label: 'Alerts & Signals', 
      path: '/alerts', 
      icon: AlertTriangle,
      badge: '3',
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/40' 
    },
    { label: 'Investigations', path: '/investigations', icon: ClipboardList, badge: '2' },
    { label: 'Data Sources & CSV', path: '/data-sources', icon: Database },
  ];

  const bottomItems = [
    { label: 'User Profile', path: '/profile', icon: UserIcon },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0A0E1A] border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Header */}
        <div className="h-16 flex items-center px-6 border-b border-white/10 justify-between">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500/20 to-brand-cyan/20 border border-brand-cyan/40 flex items-center justify-center p-1.5 shadow-glow-cyan">
              <img src={logoSvg} alt="OutbreakIQ" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg text-white leading-tight">
                Outbreak<span className="text-brand-cyan">IQ</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Surveillance Console</span>
            </div>
          </NavLink>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
              Operations
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                        isActive
                          ? 'bg-gradient-to-r from-brand-violet/20 to-brand-cyan/10 text-white border border-brand-cyan/30 shadow-glow-cyan'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-brand-cyan transition-colors" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-semibold ${item.badgeColor || 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="px-3 mb-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
              Configuration
            </div>
            <nav className="space-y-1">
              {bottomItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                        isActive
                          ? 'bg-brand-violet/20 text-white border border-brand-violet/30'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-brand-cyan transition-colors" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Role simulation helper for prototype demonstration */}
          <div className="mx-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase text-slate-400">Simulate Role</span>
              <Sparkles className="w-3 h-3 text-brand-cyan" />
            </div>
            <select
              value={user?.role || 'epidemiologist'}
              onChange={(e) => switchRole(e.target.value as UserRole)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-brand-cyan"
            >
              <option value="epidemiologist">Epidemiologist (Full)</option>
              <option value="health_officer">Health Officer (Ops)</option>
              <option value="analyst">Data Analyst (Read/Export)</option>
              <option value="admin">System Admin</option>
            </select>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-white/10 bg-[#080C14]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-violet to-brand-cyan p-0.5 flex-shrink-0">
                <img
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1594824813589-a0352ffb7625?auto=format&fit=crop&q=80&w=256'}
                  alt={user?.name || 'User'}
                  className="w-full h-full rounded-full object-cover bg-slate-900"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Dr. Sarah Lin'}</p>
                <p className="text-[11px] text-brand-cyan font-mono capitalize truncate">{user?.role?.replace('_', ' ') || 'Epidemiologist'}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors border border-rose-500/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
