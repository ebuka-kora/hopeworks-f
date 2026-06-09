import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { PillButton } from '../PillButton';
import { ArrowRight, User, PlusCircle, Calendar, Sparkles, ShieldCheck } from 'lucide-react';

interface PersonalizedHomeBandProps {
  onNavigate: (view: string, id?: string) => void;
}

export function PersonalizedHomeBand({ onNavigate }: PersonalizedHomeBandProps) {
  const { user } = useAuth();

  if (!user) return null;

  // Render secondary role chips
  const roles = user.roles || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <div className="border border-slate-200/60 bg-[#FAF9F6]/80 backdrop-blur-md rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full overflow-hidden bg-[#B24724]/10 text-[#B24724] flex items-center justify-center font-serif text-lg font-bold border border-slate-200">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              user.name.charAt(0)
            )}
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              Welcome back, {user.name} <Sparkles className="h-3.5 w-3.5 text-[#B24724]" />
            </h4>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-mono text-slate-400">Your profile:</span>
              {roles.map((role, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200/50"
                >
                  {role.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Strong Contextual Action Block */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {roles.includes('entrepreneur') && (
            <PillButton
              onClick={() => onNavigate('create_campaign')}
              className="py-1.5 px-4 text-xs font-sans font-bold flex items-center gap-2 shrink-0"
              textColor="#ffffff"
              pillColor="#B24724"
              baseColor="#000000"
              hoveredTextColor="#ffffff"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Start New Campaign
            </PillButton>
          )}

          {roles.includes('volunteer') && (
            <PillButton
              onClick={() => onNavigate('explore')}
              className="py-1.5 px-4 text-xs font-sans shrink-0 border border-slate-300"
              textColor="#334155"
              pillColor="#B24724"
              baseColor="transparent"
              hoveredTextColor="#ffffff"
            >
              <Calendar className="h-3.5 w-3.5" />
              Volunteer Openings
            </PillButton>
          )}

          {roles.includes('project_manager') && (
            <PillButton
              onClick={() => onNavigate('dashboard')}
              className="py-1.5 px-4 text-xs font-sans shrink-0 border border-slate-300"
              textColor="#334155"
              pillColor="#B24724"
              baseColor="transparent"
              hoveredTextColor="#ffffff"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Audit Milestones
            </PillButton>
          )}

          <PillButton
            onClick={() => onNavigate('dashboard')}
            className="py-1.5 px-4 text-xs font-sans text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shrink-0"
            textColor="#334155"
            pillColor="#B24724"
            baseColor="#FAF9F6"
            hoveredTextColor="#ffffff"
          >
            Go to My Dashboard
            <ArrowRight className="h-3.5 w-3.5" />
          </PillButton>
        </div>
      </div>
    </div>
  );
}
