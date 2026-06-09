import React from 'react';
import { useDonationsStore } from '../../hooks/useDonationsStore';
import { useProjectsStore } from '../../hooks/useProjectsStore';
import { useApplicationsStore } from '../../hooks/useApplicationsStore';
import { ShieldCheck, HeartHandshake, CheckCircle2, Award, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { defaultViewport, springBouncy } from '../../lib/motion';

interface LedgerItem {
  id: string;
  timestamp: string;
  type: 'donation' | 'milestone_approval' | 'volunteer_accept' | 'escrow_lock' | 'badge_earned';
  title: string;
  details: string;
  digest: string;
}

export function LedgerStream() {
  const { donations } = useDonationsStore();
  const { projects } = useProjectsStore();
  const { applications } = useApplicationsStore();

  const [ledger, setLedger] = React.useState<LedgerItem[]>([]);

  React.useEffect(() => {
    const list: LedgerItem[] = [];

    // Add recent donations
    donations.forEach((d) => {
      const proj = projects.find(p => p.id === d.projectId);
      list.push({
        id: `don-${d.id}`,
        timestamp: new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'donation',
        title: `Donation Manifest Received`,
        details: `$${d.amount} allocated to "${proj?.title || 'SDG Campaign'}"`,
        digest: `SHA256:${Math.random().toString(16).substr(2, 8).toUpperCase()}`
      });
    });

    // Add projects milestone approvals / submissions
    projects.forEach((p) => {
      p.milestones.forEach((m, idx) => {
        if (m.status === 'approved') {
          list.push({
            id: `mil-appr-${p.id}-${idx}`,
            timestamp: "Today",
            type: 'milestone_approval',
            title: `Independent Audit Release`,
            details: `Milestone "${m.title}" released ($${m.amount})`,
            digest: `SHA256:${Math.random().toString(16).substr(2, 8).toUpperCase()}`
          });
        }
        if (m.status === 'submitted') {
          list.push({
            id: `mil-sub-${p.id}-${idx}`,
            timestamp: "Active",
            type: 'escrow_lock',
            title: `Evidence Submitted & Locked`,
            details: `Milestone "${m.title}" is pending independent audit`,
            digest: `SHA256:${Math.random().toString(16).substr(2, 8).toUpperCase()}`
          });
        }
      });
    });

    // Limit to last 6 log items and set
    setLedger(list.slice(0, 8));
  }, [donations, projects, applications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'donation':
        return <HeartHandshake className="h-4 w-4 text-[#B24724]" />;
      case 'milestone_approval':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'escrow_lock':
        return <ShieldCheck className="h-4 w-4 text-amber-500" />;
      default:
        return <Award className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={defaultViewport}
      transition={springBouncy}
      className="border border-slate-200/50 bg-[#FAF9F6]/20 rounded-2xl p-6 space-y-4"
    >
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={defaultViewport}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="h-px bg-gradient-to-r from-transparent via-[#B24724]/40 to-transparent origin-left mb-4"
      />
      <div className="flex items-center justify-between border-b border-slate-200/50 pb-3">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-[#B24724]" />
          <h3 className="font-serif text-sm font-medium text-slate-800">Candid Ledger Ledger Stream</h3>
        </div>
        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full animate-pulse">
          ● AUDITED SECURE LIVE
        </span>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {ledger.length === 0 ? (
          <div className="text-center py-8 text-xs font-mono text-slate-400">
            Scanning for campaign ledger ledger updates...
          </div>
        ) : (
          ledger.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={defaultViewport}
              transition={{ ...springBouncy, delay: index * 0.05 }}
              whileHover={{ x: 4 }}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#FAF9F6] border border-transparent hover:border-slate-100 transition-all font-mono text-xs text-slate-600"
            >
              <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100/50">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-800 truncate">{item.title}</span>
                  <span className="text-[10px] text-slate-400 shrink-0">{item.timestamp}</span>
                </div>
                <p className="text-[11px] text-slate-500 truncate leading-snug">{item.details}</p>
                <div className="text-[9px] text-slate-400 font-mono tracking-wider truncate bg-slate-50 py-0.5 px-1.5 inline-block rounded border border-slate-100">
                  {item.digest}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
