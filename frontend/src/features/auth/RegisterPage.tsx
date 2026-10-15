import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Building, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { UserRole } from '../../types/auth';
import { registerSchema } from './authSchemas';

export const RegisterPage: React.FC = () => {
  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    role: 'epidemiologist' as UserRole,
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationErrors({});

    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const errMap: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        if (issue.path[0]) errMap[issue.path[0].toString()] = issue.message;
      });
      setValidationErrors(errMap);
      return;
    }

    try {
      await register(formData);
      navigate('/dashboard', { replace: true });
    } catch {
      // Error handled by AuthContext
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white font-display">Agency Registration</h2>
        <p className="text-xs text-slate-400 mt-1.5">
          Establish an early-warning surveillance account for your jurisdiction
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Full Name */}
        <div>
          <label className="block font-semibold text-slate-300 mb-1">Full Legal / Professional Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Dr. Jordan Hayes, MD"
              className={`w-full bg-slate-900/90 border rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-400 focus:outline-none transition-all ${
                validationErrors.name ? 'border-rose-500' : 'border-slate-700 focus:border-brand-cyan'
              }`}
            />
          </div>
          {validationErrors.name && <p className="text-[11px] text-rose-400 mt-1">{validationErrors.name}</p>}
        </div>

        {/* Official Email */}
        <div>
          <label className="block font-semibold text-slate-300 mb-1">Official Institutional Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="j.hayes@dph.state.gov"
              className={`w-full bg-slate-900/90 border rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-400 focus:outline-none transition-all ${
                validationErrors.email ? 'border-rose-500' : 'border-slate-700 focus:border-brand-cyan'
              }`}
            />
          </div>
          {validationErrors.email && <p className="text-[11px] text-rose-400 mt-1">{validationErrors.email}</p>}
        </div>

        {/* Organization */}
        <div>
          <label className="block font-semibold text-slate-300 mb-1">Health Agency / Public Jurisdiction</label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={formData.organization}
              onChange={(e) => handleChange('organization', e.target.value)}
              placeholder="State Department of Public Health"
              className={`w-full bg-slate-900/90 border rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-400 focus:outline-none transition-all ${
                validationErrors.organization ? 'border-rose-500' : 'border-slate-700 focus:border-brand-cyan'
              }`}
            />
          </div>
          {validationErrors.organization && <p className="text-[11px] text-rose-400 mt-1">{validationErrors.organization}</p>}
        </div>

        {/* Role Selection */}
        <div>
          <label className="block font-semibold text-slate-300 mb-1">Authorized Operational Role</label>
          <select
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value as UserRole)}
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-cyan"
          >
            <option value="epidemiologist">Lead Epidemiologist (Full Analysis & Verification)</option>
            <option value="health_officer">Health Officer (Field Operations & Triage)</option>
            <option value="analyst">Data Analyst (Syndromic Telemetry & Ingestion)</option>
            <option value="admin">System Administrator (Jurisdiction Management)</option>
          </select>
        </div>

        {/* Passwords */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Min 8 characters"
                className={`w-full bg-slate-900/90 border rounded-xl pl-9 pr-8 py-2 text-white placeholder-slate-400 focus:outline-none transition-all ${
                  validationErrors.password ? 'border-rose-500' : 'border-slate-700 focus:border-brand-cyan'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {validationErrors.password && <p className="text-[11px] text-rose-400 mt-1">{validationErrors.password}</p>}
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="Repeat password"
                className={`w-full bg-slate-900/90 border rounded-xl pl-9 pr-8 py-2 text-white placeholder-slate-400 focus:outline-none transition-all ${
                  validationErrors.confirmPassword ? 'border-rose-500' : 'border-slate-700 focus:border-brand-cyan'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {validationErrors.confirmPassword && <p className="text-[11px] text-rose-400 mt-1">{validationErrors.confirmPassword}</p>}
          </div>
        </div>

        {/* Terms Agreement */}
        <div className="pt-2">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-brand-cyan focus:ring-brand-cyan mt-0.5"
            />
            <span className="text-[11px] text-slate-400 leading-snug">
              I certify that our agency will adhere to the <strong className="text-slate-300">HIPAA Anonymized Data Policy</strong> and acknowledge that automated AI anomaly signals remain preliminary until verified.
            </span>
          </label>
          {validationErrors.agreeToTerms && (
            <p className="text-[11px] text-rose-400 mt-1">{validationErrors.agreeToTerms}</p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full shadow-glow-violet mt-4"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Register Public Health Account
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
        <span>Already have an authorized account? </span>
        <Link to="/login" className="text-brand-cyan font-semibold hover:underline">
          Sign In Here
        </Link>
      </div>
    </div>
  );
};
