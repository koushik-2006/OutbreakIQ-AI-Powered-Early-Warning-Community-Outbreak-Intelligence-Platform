import React, { useState } from 'react';
import { 
  Bell, 
  Menu, 
  Search, 
  Sparkles, 
  ShieldAlert, 
  Check, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { MOCK_NOTIFICATIONS } from '../../mocks/mockData';
import { Link } from 'react-router-dom';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0B0F19]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile hamburger & breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none hover:bg-slate-800"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">SURVEILLANCE ENGINE</span>
          <span className="text-slate-600">/</span>
          <span className="text-brand-cyan font-semibold">PS-021 LIVE FEED</span>
        </div>
      </div>

      {/* Right: Actions, Search, Notifications, User */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick Search Bar */}
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search region, indicator, alert..."
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-cyan transition-all"
          />
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl border border-slate-700/60 transition-colors"
            title="Surveillance Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0F1527] border border-slate-700/80 rounded-2xl shadow-2xl z-50 p-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-white">Surveillance Alerts</span>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                    {unreadCount} new
                  </span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-brand-cyan hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 py-1">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`p-2.5 rounded-xl text-xs transition-colors cursor-pointer border ${
                      notif.read
                        ? 'bg-slate-900/40 border-slate-800/60 text-slate-400'
                        : 'bg-slate-800/80 border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`font-semibold ${notif.severity === 'critical' ? 'text-rose-400' : 'text-slate-100'}`}>
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
                    {notif.link && (
                      <Link
                        to={notif.link}
                        onClick={() => setNotificationsOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] text-brand-cyan hover:underline mt-1.5"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 text-center">
                <Link
                  to="/alerts"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs text-slate-400 hover:text-white font-medium"
                >
                  View All Signals & Evidence →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <Link
          to="/profile"
          className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/60 transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-violet to-brand-cyan p-0.5">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1594824813589-a0352ffb7625?auto=format&fit=crop&q=80&w=256'}
              alt={user?.name || 'User'}
              className="w-full h-full rounded-md object-cover bg-slate-900"
            />
          </div>
          <span className="text-xs font-medium text-slate-200 hidden sm:inline">
            {user?.name?.split(' ')[0] || 'Dr. Sarah'}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 hidden md:inline uppercase">
            {user?.role?.replace('_', ' ') || 'Epi'}
          </span>
        </Link>
      </div>
    </header>
  );
};
