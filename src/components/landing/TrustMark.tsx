import React from 'react';
import { ShieldCheck, Percent, Layers, Landmark } from 'lucide-react';
import { motion } from 'motion/react';
import { Reveal } from '../motion/Reveal';
import { StaggerChildren } from '../motion/StaggerChildren';
import { springBouncy } from '../../lib/motion';

interface TrustMarkProps {
  onNavigate?: (view: string) => void;
}

export function TrustMark({ onNavigate: _onNavigate }: TrustMarkProps = {}) {
  const principles = [
    {
      icon: <Percent className="h-5 w-5 text-[#B24724]" />,
      title: "5% Platform Fee",
      desc: "Disclosed clearly upfront. Taken directly from total donation volume to fuel server uptime and independent audit support services."
    },
    {
      icon: <Landmark className="h-5 w-5 text-[#B24724]" />,
      title: "Escrow Locked Funding",
      desc: "Capital never streams all at once. Donations dwell inside a multi-sig escrow model released strictly on verifiable milestone completion."
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-[#B24724]" />,
      title: "Independent PM Check",
      desc: "Every milestone verification requires a vetted, third-party citizen Project Manager to cross-examine uploaded field evidence."
    },
    {
      icon: <Layers className="h-5 w-5 text-[#B24724]" />,
      title: "SDG Structured Impact",
      desc: "All campaigns map precisely to the 17 UN Sustainable Development Goals, preventing greenwashing and securing focus."
    }
  ];

  return (
    <div className="border border-[#B24724]/20 bg-[#FAF9F6] rounded-3xl p-6 sm:p-10 space-y-8">
      <Reveal direction="bouncy" className="max-w-2xl">
        <span className="text-[10px] bg-[#B24724]/10 text-[#B24724] px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider mb-3 inline-block">
          Rigorous Trust Assurance
        </span>
        <h3 className="text-2xl sm:text-3xl font-serif text-slate-800 tracking-tight leading-snug">
          How HopeWorks absolute auditability protects your civic contributions.
        </h3>
      </Reveal>

      <StaggerChildren className="grid sm:grid-cols-2 gap-6 sm:gap-8" stagger={0.08}>
        {principles.map((p, idx) => (
          <motion.div
            key={idx}
            whileHover={{ x: 4 }}
            transition={springBouncy}
            className="group flex gap-4 rounded-2xl p-3 -m-3 transition-colors duration-200 hover:bg-white/70"
          >
            <motion.div
              whileHover={{ rotate: [0, -5, 5, 0], scale: 1.08 }}
              transition={{ duration: 0.35 }}
              className="shrink-0 p-3 bg-white border border-slate-100 rounded-xl h-fit shadow-xs transition-colors duration-200 group-hover:bg-emerald-50 group-hover:border-emerald-200/80"
            >
              {p.icon}
            </motion.div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold text-slate-900 font-serif">{p.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">{p.desc}</p>
            </div>
          </motion.div>
        ))}
      </StaggerChildren>
    </div>
  );
}
