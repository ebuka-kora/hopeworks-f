import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useProjectsStore } from '../../hooks/useProjectsStore';
import { apiPublicFetch } from '../../lib/apiClient';
import { AnimatedNumber } from '../motion/AnimatedNumber';
import { defaultViewport, springBouncy } from '../../lib/motion';

interface PlatformStats {
  totalRaised: number;
  activeProjects: number;
  approvedVolunteers: number;
  totalDonations: number;
}

export function BigNumbers() {
  const { projects } = useProjectsStore();
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    apiPublicFetch<PlatformStats>('/api/stats')
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const totalInEscrow = projects.reduce((sum, p) => {
    const fundedMilestonesValue = p.milestones
      .filter(m => m.status !== 'approved')
      .reduce((mSum, m) => mSum + (m.cost || 0), 0);
    return sum + (p.status === 'active' ? fundedMilestonesValue : 0);
  }, 0);

  const approvedMilestones = projects.reduce((sum, p) => {
    return sum + p.milestones.filter(m => m.status === 'approved').length;
  }, 0);

  const totalDonated = stats?.totalRaised ?? 0;
  const activeVolunteersCount = stats?.approvedVolunteers ?? 0;

  const displayStats = [
    {
      value: totalDonated / 1000,
      prefix: '$',
      suffix: 'k',
      decimals: 1,
      label: "Impact Funds Received",
      help: "Directly tracked via public ledger"
    },
    {
      value: totalInEscrow / 1000,
      prefix: '$',
      suffix: 'k',
      decimals: 1,
      label: "Currently in Escrow",
      help: "Locked until independent PM approval"
    },
    {
      value: approvedMilestones,
      prefix: '',
      suffix: '',
      decimals: 0,
      label: "Verified Milestones",
      help: "Rigorous evidence checked by PMs"
    },
    {
      value: activeVolunteersCount,
      prefix: '',
      suffix: '',
      decimals: 0,
      label: "Active Contributors",
      help: stats ? `${stats.activeProjects} active campaigns` : "Volunteers serving high-priority SDGs"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {displayStats.map((stat, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={defaultViewport}
          transition={{ ...springBouncy, delay: idx * 0.1 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="border border-slate-200/50 bg-[#FAF9F6]/30 backdrop-blur-md p-5 sm:p-6 rounded-2xl flex flex-col justify-between"
        >
          <div>
            <AnimatedNumber
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
              decimals={stat.decimals}
              className="block text-3xl sm:text-4xl font-serif text-[#B24724] tracking-tight mb-2"
            />
            <span className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-800">
              {stat.label}
            </span>
          </div>
          <span className="block text-[10px] text-slate-400 font-mono mt-4">
            {stat.help}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
