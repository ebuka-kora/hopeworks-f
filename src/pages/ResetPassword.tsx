import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { scaleIn } from '../lib/motion';
import { Logo } from '../components/Logo';
import { PillButton } from '../components/PillButton';
import { ArrowLeft, ArrowRight, Lock, KeyRound, ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import { useLoadingOverlay } from '../context/LoadingOverlayContext';
import { PasswordInput } from '../components/PasswordInput';
import { PasswordRequirements } from '../components/PasswordRequirements';
import { getPasswordValidationError } from '../lib/passwordPolicy';

interface ResetPasswordProps {
  onNavigate: (view: string) => void;
}

export function ResetPassword({ onNavigate }: ResetPasswordProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { addToast } = useToast();
  const loadingOverlay = useLoadingOverlay();
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadingOverlay?.showLoading('Verifying recovery session');
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled) setHasSession(!!session);
      loadingOverlay?.hideLoading();
    });
    return () => {
      cancelled = true;
      loadingOverlay?.hideLoading();
    };
  }, [loadingOverlay]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const passwordError = getPasswordValidationError(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match matching confirmation rows.");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Recovery session expired. Please request a new reset link from the forgot password page.');
      }
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSubmitted(true);
      addToast({
        title: 'Credentials Recovered',
        description: 'Your password has been updated. You can now login.',
        type: 'success'
      });
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const isCheckingSession = hasSession === null;

  return (
    <div className="h-full min-h-0 flex-1 bg-[#F8F9FA] flex items-center justify-center p-6 select-none font-sans relative">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 space-y-8 shadow-xs">
        {/* TOP BRAND INFO ROW */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div onClick={() => onNavigate('home')} className="cursor-pointer">
            <Logo iconSize={36} showText={false} />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-serif text-slate-900 tracking-tight">Create New Password</h1>
            <p className="text-xs text-slate-400">HopeWorks Standard Vault Authentication</p>
          </div>
        </div>

        {hasSession === false && !submitted ? (
          <div className="space-y-4 text-center">
            <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
              No active recovery session. Please use the link from your reset email, or request a new one.
            </p>
            <PillButton
              type="button"
              variant="outline"
              caps={false}
              onClick={() => onNavigate('forgot_password')}
              className="py-2 px-4 text-xs font-mono"
            >
              Request new reset link
            </PillButton>
          </div>
        ) : !submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5 flex flex-col">
            {error && (
              <div className="text-xs bg-red-50 text-red-600 p-3 rounded-xl border border-red-100/50">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                  New Secure Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 z-10 pointer-events-none" />
                  <PasswordInput
                    required
                    placeholder="Min. 8 chars with upper, lower, number & symbol"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full py-3 pl-10 border border-slate-200 outline-none rounded-xl focus:border-[#B24724] font-sans text-sm transition-colors text-slate-800"
                    autoComplete="new-password"
                  />
                </div>
                <PasswordRequirements password={password} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                  Confirm Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 z-10 pointer-events-none" />
                  <PasswordInput
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full py-3 pl-10 border border-slate-200 outline-none rounded-xl focus:border-[#B24724] font-sans text-sm transition-colors text-slate-800"
                  />
                </div>
              </div>
            </div>

            <PillButton
              type="submit"
              loading={loading}
              loadingMessage="Updating password"
              className="w-full py-3.5 cursor-pointer shadow-xs border-slate-200 mt-2"
              baseColor="transparent"
              textColor="#334155"
              pillColor="#B24724"
              hoveredTextColor="#ffffff"
              Icon={ArrowRight}
            >
              {loading ? 'Securing Credentials...' : 'Set New Password'}
            </PillButton>
          </form>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={scaleIn} className="space-y-6 text-center font-sans">
            <div className="mx-auto p-3 bg-emerald-50 border border-emerald-100 rounded-2xl w-fit text-emerald-600">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-lg text-slate-800">Password Securing Complete</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your credentials have been updated. You can now navigate to the login portal and enter your new authorization credentials.
              </p>
            </div>

            <PillButton
              type="button"
              variant="primary"
              caps={false}
              onClick={() => onNavigate('login')}
              className="w-full py-3 text-xs font-sans shadow-xs"
            >
              Go to Login Gateway
            </PillButton>
          </motion.div>
        )}
      </div>
    </div>
  );
}
