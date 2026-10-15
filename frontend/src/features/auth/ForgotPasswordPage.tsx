import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { authService } from '../../services/authService';
import { forgotPasswordSchema } from './authSchemas';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0]?.message || 'Please provide a valid email');
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset instructions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white font-display">Credential Recovery</h2>
        <p className="text-xs text-slate-400 mt-1.5">
          Reset access to your OutbreakIQ surveillance console
        </p>
      </div>

      {isSubmitted ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-white">Recovery Instructions Dispatched</h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            If an authorized account is linked with <strong className="text-slate-200">{email}</strong>, a secure reset token has been delivered.
          </p>
          <div className="pt-4">
            <Link to="/login">
              <Button variant="outline" size="md" className="w-full">
                Return to Sign In
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Registered Institutional Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor.name@publichealth.gov"
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-cyan transition-all"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="cyan"
            size="lg"
            isLoading={isLoading}
            className="w-full shadow-glow-cyan"
          >
            Send Recovery Link
          </Button>

          <div className="text-center pt-3">
            <Link to="/login" className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};
