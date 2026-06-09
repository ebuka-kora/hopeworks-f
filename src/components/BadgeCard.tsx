import React, { useState } from 'react';
import { Award, Download, ShieldCheck, Waves, BookOpen, Leaf } from 'lucide-react';
import { CertificateDownload } from './CertificateDownload';
import { PillButton } from './PillButton';

export interface Badge {
  id: string;
  type: 'water_guardian' | 'eco_scholar' | 'coral_conservationist' | 'universal_giver';
  title: string;
  description: string;
  recipientName: string;
  recipientRole: string;
  projectName: string;
  dateAwarded: string;
  serialNumber: string;
}

interface BadgeCardProps {
  badge: Badge;
  key?: any;
}

export function BadgeCard({ badge }: BadgeCardProps) {
  const [showCertificate, setShowCertificate] = useState(false);

  let icon = <Award className="h-8 w-8 text-indigo-500" />;
  let cardTheme = "from-indigo-50/50 to-indigo-100/30 border-indigo-200/50";
  let badgeAccent = "bg-indigo-600";

  switch (badge.type) {
    case 'water_guardian':
      icon = <Waves className="h-8 w-8 text-blue-500" />;
      cardTheme = "from-blue-50/50 to-blue-100/30 border-blue-200/50";
      badgeAccent = "bg-blue-600";
      break;
    case 'eco_scholar':
      icon = <BookOpen className="h-8 w-8 text-orange-500" />;
      cardTheme = "from-orange-50/50 to-orange-100/30 border-orange-200/50";
      badgeAccent = "bg-orange-600";
      break;
    case 'coral_conservationist':
      icon = <Leaf className="h-8 w-8 text-teal-500" />;
      cardTheme = "from-teal-50/50 to-teal-100/30 border-teal-200/50";
      badgeAccent = "bg-teal-600";
      break;
    case 'universal_giver':
      icon = <Award className="h-8 w-8 text-emerald-500" />;
      cardTheme = "from-emerald-50/50 to-emerald-100/30 border-emerald-200/50";
      badgeAccent = "bg-emerald-600";
      break;
  }

  return (
    <>
      <div className={`p-5 rounded-2xl border bg-gradient-to-br ${cardTheme} space-y-4 flex flex-col justify-between shadow-xs transition-transform hover:scale-[1.01]`}>
        
        <div className="flex justify-between items-start">
          <div className="p-2.5 bg-white rounded-xl shadow-xs border border-white/80">
            {icon}
          </div>
          <span className="text-[10px] font-mono text-slate-400 font-semibold tracking-wider bg-slate-900/5 px-2 py-0.5 rounded-full">
            {badge.serialNumber}
          </span>
        </div>

        <div className="space-y-1">
          <h4 className="font-serif font-semibold text-slate-800 text-sm leading-snug">{badge.title}</h4>
          <p className="text-xs text-slate-500 leading-relaxed">{badge.description}</p>
        </div>

        <div className="border-t border-slate-200/40 pt-3.5 space-y-2.5">
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Recipient:</span>
            <span className="font-semibold text-slate-700 capitalize">{badge.recipientName} ({badge.recipientRole})</span>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Project:</span>
            <span className="font-semibold text-slate-700 max-w-[150px] truncate">{badge.projectName}</span>
          </div>

          <PillButton
            variant="brand"
            caps={false}
            onClick={() => setShowCertificate(true)}
            className="w-full py-2 text-[11px] font-mono"
          >
            <Download className="h-3.5 w-3.5" />
            Vow Certificate
          </PillButton>
        </div>

      </div>

      {showCertificate && (
        <CertificateDownload badge={badge} onClose={() => setShowCertificate(false)} />
      )}
    </>
  );
}
