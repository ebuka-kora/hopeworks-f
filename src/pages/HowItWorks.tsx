import React from 'react';
import { VerifiedStamp } from '../components/marks/VerifiedStamp';
import { EscrowMark } from '../components/marks/EscrowMark';
import { EvidenceDoc } from '../components/marks/EvidenceDoc';
import { DonationReceipt } from '../components/marks/DonationReceipt';
import { MilestoneRail } from '../components/marks/MilestoneRail';
import { PillButton } from '../components/PillButton';
import { ArrowRight, ShieldCheck, HelpCircle, Users, CheckSquare, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import { Reveal } from '../components/motion/Reveal';
import { StaggerChildren } from '../components/motion/StaggerChildren';
import { defaultViewport, springBouncy, slideFromLeft, slideFromRight } from '../lib/motion';

interface HowItWorksProps {
  onNavigate: (view: string, id?: string) => void;
}

export function HowItWorks({ onNavigate }: HowItWorksProps) {
  const steps = [
    {
      mark: <DonationReceipt size={56} />,
      badge: "Step 01",
      title: "Transparent Pledge & Escrow Entry",
      desc: "Donors select an SDG project and pledge capital. 100% of the donation (disclosing a flat 5% platform operations fee) is locked securely inside the project's digital escrow vault, shielded from immediate transfer."
    },
    {
      mark: <MilestoneRail steps={[
        { title: 'Fundraising', status: 'completed' },
        { title: 'Locked', status: 'completed' },
        { title: 'Active', status: 'completed' },
        { title: 'Approved', status: 'pending' }
      ]} className="max-w-[400px] mt-2" />,
      badge: "Step 02",
      title: "Sequential Milestone Progress",
      desc: "Projects execute work sequentially. Entrepreneurs cannot touch downstream milestone allocations until the current stage's physical criteria are met. This protects large pools from upfront flight risks."
    },
    {
      mark: <EvidenceDoc size={56} />,
      badge: "Step 03",
      title: "Physical Evidence & Submission",
      desc: "Entrepreneurs deliver physical output (building structures, supply invoices, community attendance logs, geo-located photographs) and upload them to lock the milestone evidence array. Once locked, it cannot be tampered with."
    },
    {
      mark: <VerifiedStamp size={56} />,
      badge: "Step 04",
      title: "Independent PM Desk-Audit",
      desc: "Vetted citizen Project Managers independently review the uploaded digital evidence against the original field charter. They verify signatures, check geo-logs, and release the escrow funds solely on validated quality."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16 select-none">
      <Reveal direction="bouncy" className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-[10px] bg-[#B24724]/10 text-[#B24724] px-3.5 py-1.5 rounded-full font-mono font-black uppercase tracking-widest">
          SYSTEM OPERATIONS HANDBOOK
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-slate-900 tracking-tight leading-[1.15] px-1">
          Milestone Escrow: Where civic trust meets auditability.
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed max-w-2xl mx-auto">
          HopeWorks operates a trust-gated crowdfunding ecosystem built entirely on the principle that funds should follow visible verified results, preventing speculative fundraising.
        </p>
      </Reveal>

      <div className="space-y-6">
        {steps.map((st, idx) => (
          <motion.div
            key={idx}
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={idx % 2 === 0 ? slideFromLeft : slideFromRight}
            className="border border-slate-200 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-10 flex flex-col md:flex-row gap-5 sm:gap-8 items-start md:items-center justify-between hover:border-slate-300 transition-all shadow-xs"
          >
            <div className="md:w-1/4 flex flex-col gap-4">
              <span className="text-xs font-mono font-extrabold text-[#B24724] bg-[#B24724]/5 py-1 px-3 rounded-full w-fit">
                {st.badge}
              </span>
              <motion.div
                initial={{ opacity: 0, rotate: -8, scale: 0.9 }}
                whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
                viewport={defaultViewport}
                transition={springBouncy}
                className="bg-slate-50 p-4 rounded-xl border border-slate-100/50 w-fit"
              >
                {st.mark}
              </motion.div>
            </div>

            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-serif font-normal text-slate-800">{st.title}</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{st.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <StaggerChildren className="grid md:grid-cols-2 gap-8 items-stretch pt-6" stagger={0.12}>
        <div className="border border-slate-200/50 bg-[#FAF9F6]/50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="p-3 bg-[#B24724]/10 rounded-xl w-fit text-[#B24724]">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-serif text-slate-800 tracking-tight">Our 5-Role Civic Platform Balance</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              HopeWorks splits actions across 5 user categories: Project Owner (Entrepreneur), Volunteer, Donor (pick one role at signup), and Admin / Project Manager (assigned post-signup by standard operations).
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-slate-500">
            <div>
              <span className="block font-bold text-slate-700">Entrepreneur</span>
              <span>Submit milestones & evidence</span>
            </div>
            <div>
              <span className="block font-bold text-slate-700">Volunteer</span>
              <span>Offer hours & matching skills</span>
            </div>
            <div>
              <span className="block font-bold text-slate-700">Project Manager</span>
              <span>Assigned audits & verification</span>
            </div>
            <div>
              <span className="block font-bold text-slate-700">Donor</span>
              <span>Escrow funding allocation</span>
            </div>
          </div>
        </div>

        <div className="border border-slate-200 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="p-3 bg-[#B24724]/10 rounded-xl w-fit text-[#B24724]">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-serif text-slate-800 tracking-tight">SDG-Aligned Ledger Focus</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every single campaign created must explicitly fit within one of the 17 UN Sustainable Development Goals. Impact goals are locked by baseline code constraints, providing donors guaranteed thematic relevance.
            </p>
          </div>
          <PillButton
            onClick={() => onNavigate('explore')}
            className="w-full py-2.5 px-5 text-xs font-sans text-center font-bold"
            textColor="#ffffff"
            pillColor="#B24724"
            baseColor="#000000"
            hoveredTextColor="#ffffff"
          >
            Explore Active Projects
            <ArrowRight className="h-4 w-4" />
          </PillButton>
        </div>
      </StaggerChildren>
    </div>
  );
}
