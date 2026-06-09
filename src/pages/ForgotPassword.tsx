import React, { useState } from 'react';
import { motion } from 'motion/react';
import { scaleIn } from '../lib/motion';
import { Logo } from '../components/Logo';
import { PillButton } from '../components/PillButton';
import { ArrowLeft, ArrowRight, Mail, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ForgotPasswordProps {
  onNavigate: (view: string) => void;
}

export function ForgotPassword({ onNavigate }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please specify an email address.");
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
        redirectTo: window.location.origin,
      });
      if (resetError) throw resetError;
      setSubmitted(true);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to send recovery email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[#F8F9FA] flex items-center justify-center p-6 select-none font-sans relative">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 space-y-8 shadow-xs">
        {/* LOGO TITLE ROW */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div onClick={() => onNavigate('home')} className="cursor-pointer">
            <Logo iconSize={36} showText={false} />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-serif text-slate-900 tracking-tight">Recover Credentials</h1>
            <p className="text-xs text-slate-400">HopeWorks Secure Password Dispatcher</p>
          </div>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="text-xs bg-red-50 text-red-600 p-3 rounded-xl border border-red-100/50">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                Target User Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="e.g. donor@hopeworks.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-3 pl-10 pr-4 border border-slate-200 outline-none rounded-xl focus:border-[#B24724] font-sans text-sm transition-colors"
                />
              </div>
            </div>

            <PillButton
              type="submit"
              loading={loading}
              loadingMessage="Sending recovery link"
              className="w-full py-3.5 cursor-pointer shadow-xs border-slate-200"
              baseColor="transparent"
              textColor="#334155"
              pillColor="#B24724"
              hoveredTextColor="#ffffff"
              Icon={ArrowRight}
            >
              {loading ? 'Routing Dispatch...' : 'Send Recovery Link'}
            </PillButton>

            <PillButton
              type="button"
              variant="outline"
              caps={false}
              onClick={() => onNavigate('login')}
              className="w-full py-2 text-xs font-mono mt-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Return to login
            </PillButton>
          </form>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={scaleIn}
            className="space-y-6 text-center font-sans"
          >
            <div className="mx-auto p-3 bg-emerald-50 border border-emerald-100 rounded-2xl w-fit text-emerald-600">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-lg text-slate-800">Recovery Email Sent</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                If an account exists for <strong className="text-slate-700 font-mono font-bold">{email}</strong>, a password reset link has been sent. Check your inbox and follow the link to set a new password.
              </p>
            </div>

            <PillButton
              type="button"
              variant="outline"
              caps={false}
              onClick={() => onNavigate('login')}
              className="py-2 px-4 text-xs font-mono"
            >
              Go Back to Login Gateway
            </PillButton>
          </motion.div>
        )}
      </div>
    </div>
  );
}
