import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { loginSchema } from './authSchemas';

export const LoginPage: React.FC = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('sarah.lin@publichealth.gov');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationErrors({});

    const result = loginSchema.safeParse({ email, password, rememberMe });
    if (!result.success) {
      const errMap: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        if (issue.path[0]) errMap[issue.path[0].toString()] = issue.message;
      });
      setValidationErrors(errMap);
      return;
    }

    try {
      await login({ email, password, rememberMe });
      navigate(from, { replace: true });
    } catch {
      // Error handled in AuthContext
    }
  };

  const handleQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setValidationErrors({});
    clearError();
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white font-display">Surveillance Sign In</h2>
        <p className="text-xs text-slate-400 mt-1.5">
          Access the OutbreakIQ Early-Warning Community Platform
        </p>
      </div>

      {/* Quick Demo Pre-fills */}
      <div className="mb-6 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
            Quick Demo Accounts:
          </span>
          <span className="text-[10px] text-slate-400 font-mono">1-Click Fill</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickDemo('sarah.lin@publichealth.gov')}
            className={`p-1.5 rounded-lg text-left transition-all border ${
              email === 'sarah.lin@publichealth.gov'
                ? 'bg-brand-violet/20 border-brand-violet/50 text-white'
                : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <div className="font-semibold text-[11px] truncate">Dr. Sarah Lin</div>
            <div className="text-[10px] text-brand-cyan font-mono">Epidemiologist</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('officer.marcus@healthdept.gov')}
            className={`p-1.5 rounded-lg text-left transition-all border ${
              email === 'officer.marcus@healthdept.gov'
                ? 'bg-brand-violet/20 border-brand-violet/50 text-white'
                : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <div className="font-semibold text-[11px] truncate">Marcus Vance</div>
            <div className="text-[10px] text-brand-blue font-mono">Health Officer</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('analyst.elena@cdc-sentinel.gov')}
            className={`p-1.5 rounded-lg text-left transition-all border ${
              email === 'analyst.elena@cdc-sentinel.gov'
                ? 'bg-brand-violet/20 border-brand-violet/50 text-white'
                : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <div className="font-semibold text-[11px] truncate">Elena Rostova</div>
            <div className="text-[10px] text-purple-400 font-mono">Data Analyst</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('admin@outbreak-ai.gov')}
            className={`p-1.5 rounded-lg text-left transition-all border ${
              email === 'admin@outbreak-ai.gov'
                ? 'bg-brand-violet/20 border-brand-violet/50 text-white'
                : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <div className="font-semibold text-[11px] truncate">Admin Console</div>
            <div className="text-[10px] text-rose-400 font-mono">System Admin</div>
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Institutional Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (validationErrors.email) setValidationErrors(prev => ({ ...prev, email: '' }));
              }}
              placeholder="name@publichealth.gov"
              className={`w-full bg-slate-900/90 border rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none transition-all ${
                validationErrors.email ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-slate-700 focus:border-brand-cyan'
              }`}
            />
          </div>
          {validationErrors.email && (
            <p className="text-[11px] text-rose-400 mt-1">{validationErrors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Access Password
            </label>
            <Link to="/forgot-password" className="text-xs text-brand-cyan hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (validationErrors.password) setValidationErrors(prev => ({ ...prev, password: '' }));
              }}
              placeholder="••••••••••••"
              className={`w-full bg-slate-900/90 border rounded-xl pl-9 pr-10 py-2 text-xs text-white placeholder-slate-400 focus:outline-none transition-all ${
                validationErrors.password ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-slate-700 focus:border-brand-cyan'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {validationErrors.password && (
            <p className="text-[11px] text-rose-400 mt-1">{validationErrors.password}</p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <input
            id="rememberMe"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-brand-cyan focus:ring-brand-cyan"
          />
          <label htmlFor="rememberMe" className="ml-2 text-xs text-slate-400 cursor-pointer">
            Keep surveillance session active for 30 days
          </label>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="cyan"
          size="lg"
          isLoading={isLoading}
          className="w-full shadow-glow-cyan mt-2"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Authenticate & Enter Console
        </Button>
      </form>

      {/* Register Link */}
      <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
        <span>Need credentials for your health jurisdiction? </span>
        <Link to="/register" className="text-brand-cyan font-semibold hover:underline">
          Register Organization
        </Link>
      </div>
    </div>
  );
};
