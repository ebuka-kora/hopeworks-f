import React, { useState } from 'react';
import { motion } from 'motion/react';
import { springDashboard } from '../../lib/motion';
import { useAuth } from '../../context/AuthContext';
import { useAssignmentsStore } from '../../hooks/useAssignmentsStore';
import { useProjectsStore } from '../../hooks/useProjectsStore';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PillButton } from '../../components/PillButton';
import { 
  ClipboardCheck, 
  ShieldAlert, 
  ArrowUpRight, 
  GraduationCap,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  MoreHorizontal,
  CheckCircle,
  Clock,
  Briefcase,
  AlertCircle
} from 'lucide-react';

export type PmSegment = 'all' | 'pending' | 'completed';

interface DashboardProps {
  onNavigate: (view: string, id?: string) => void;
  activeSegment?: PmSegment;
  onSegmentChange?: (segment: PmSegment) => void;
}

export function ProjectManagerDashboard({
  onNavigate,
  activeSegment: controlledSegment,
  onSegmentChange,
}: DashboardProps) {
  const { user } = useAuth();
  const { listByPm } = useAssignmentsStore();
  const { projects } = useProjectsStore();

  const myPmId = user?.id || 'user-pm';
  const myAssignments = listByPm(myPmId);

  // Retrieve project details for assigned projects
  const pmProjects = myAssignments
    .map(a => projects.find(p => p.id === a.projectId))
    .filter(Boolean);

  // Filter campaigns with active audit submissions in pending state
  const auditQueue = pmProjects.filter(p => p && p.milestones.some(m => m.status === 'submitted'));

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [internalSegment, setInternalSegment] = useState<PmSegment>('all');
  const activeSegment = controlledSegment ?? internalSegment;
  const setActiveSegment = (segment: PmSegment) => {
    if (onSegmentChange) onSegmentChange(segment);
    else setInternalSegment(segment);
  };
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const handleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(r => r !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleSelectAll = (filteredIds: string[]) => {
    if (selectedRows.length === filteredIds.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredIds);
    }
  };

  // Filter projects list
  const filteredPmProjects = pmProjects.filter((proj) => {
    if (!proj) return false;
    const matchesSearch = proj.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          proj.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeSegment === 'pending') {
      return matchesSearch && proj.milestones.some(m => m.status === 'submitted');
    }
    if (activeSegment === 'completed') {
      return matchesSearch && proj.status === 'completed';
    }
    return matchesSearch;
  });

  // Score Bars Component to match Conceptzilla style
  const ScoreBars = ({ score }: { score: number }) => {
    const bars = Array.from({ length: 10 });
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-end gap-0.5 h-3">
          {bars.map((_, i) => {
            const isActive = i < score;
            let barColor = 'bg-slate-200';
            if (isActive) {
              if (score >= 8) barColor = 'bg-[#10B981]';
              else if (score >= 5) barColor = 'bg-[#B24724]';
              else barColor = 'bg-rose-500';
            }
            return (
              <div 
                key={i} 
                className={`w-[2.5px] rounded-xs transition-all ${barColor}`}
                style={{ height: `${(i + 2) * 10}%` }}
              />
            );
          })}
        </div>
        <span className="text-[10px] font-mono text-slate-500 font-bold">{score}/10</span>
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={springDashboard} className="space-y-6 text-xs select-none">
      
      {/* Pending Audits Header Warning Bar */}
      {auditQueue.length > 0 && (
        <div className="p-4 bg-orange-50/50 border border-orange-200/60 rounded-2xl flex gap-3.5 text-xs text-[#B24724] select-none animate-pulse">
          <ShieldAlert className="h-5 w-5 text-[#B24724] shrink-0" />
          <div className="space-y-0.5">
            <h5 className="font-bold font-mono text-[11px] uppercase tracking-wider">ACTIVE FIELD EVIDENCE FOR MILIEU AUDITING ({auditQueue.length})</h5>
            <p className="text-[11.5px] text-slate-600 leading-normal font-sans">Campaign creators have lodged physical logs and sweat equity worksheets. Inquire onsite, review evidence, and execute payout releases.</p>
          </div>
        </div>
      )}

      {/* 1. TOP METRICS BLOCK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <span>Appointed Monitored</span>
              <span className="text-[10px] text-[#B24724] bg-orange-50 px-1 py-0.2 rounded-md font-bold font-mono">Assigned</span>
            </div>
            <p className="font-serif font-black text-2xl text-slate-900">{pmProjects.length} Campaigns</p>
            <p className="text-[10px] text-slate-400 font-mono">Official Regulatory Appoints</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <span>Auditing Queue</span>
              <span className="text-[10px] text-amber-600 bg-amber-50 px-1 py-0.2 rounded-md font-bold font-mono animate-pulse">Active</span>
            </div>
            <p className="font-serif font-black text-2xl text-slate-900">{auditQueue.length} Pending</p>
            <p className="text-[10px] text-slate-400 font-mono">Audit Evidence Submissions</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <span>Disbursed Verified</span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded-md font-bold font-mono">100% Safe</span>
            </div>
            <p className="font-serif font-black text-2xl text-emerald-700">
              ${(pmProjects.length * 12500 || 25000).toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">Released escrow values</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <span>Auditor Rating</span>
              <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded-md font-bold font-mono">Level III</span>
            </div>
            <p className="font-serif font-black text-2xl text-indigo-700">9.8 / 10</p>
            <p className="text-[10px] text-slate-400 font-mono">Public registry feedback rank</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">

        {/* MIDDLE CONTROL ACTIONS LAYER */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50/50">
          
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
              <Search className="h-3.5 w-3.5" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search assigned campaign parameters..."
              className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#B24724]"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <PillButton variant="muted" caps={false} className="px-3 py-2 text-xs">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              Filter
            </PillButton>
            <PillButton variant="muted" caps={false} className="px-3 py-2 text-xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
              Sort
            </PillButton>
          </div>
        </div>

        {/* 4. PM ASSIGNED PROJECTS LISTING TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100 text-[10px] font-mono font-black text-slate-400 tracking-wider">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={filteredPmProjects.length > 0 && selectedRows.length === filteredPmProjects.length}
                    onChange={() => handleSelectAll(filteredPmProjects.map(p => p ? p.id : ''))}
                    className="rounded text-[#B24724] focus:ring-[#B24724] cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">APPOINTED CAMPAIGN</th>
                <th className="py-3 px-4">CREATOR OWNER</th>
                <th className="py-3 px-4">ESCROW CAPITAL</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">PENDING LOGS</th>
                <th className="py-3 px-4">PRECISION FIDELITY</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPmProjects.map((proj) => {
                if (!proj) return null;
                const isSelected = selectedRows.includes(proj.id);
                const submittedMilestonesCount = proj.milestones.filter(m => m.status === 'submitted').length;
                const approvedCount = proj.milestones.filter(m => m.status === 'approved').length;
                const fidelityScore = proj.milestones.length > 0
                  ? Math.min(10, Math.max(7, 7 + Math.round((approvedCount / proj.milestones.length) * 3)))
                  : submittedMilestonesCount > 0 ? 8 : 9;

                return (
                  <tr 
                    key={proj.id}
                    className={`hover:bg-slate-50/40 transition-colors select-none ${
                      isSelected ? 'bg-orange-50/15' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(proj.id)}
                        className="rounded text-[#B24724] focus:ring-[#B24724] cursor-pointer"
                      />
                    </td>

                    {/* Campaign Title */}
                    <td className="py-3 px-4">
                      <div 
                        onClick={() => onNavigate('project_detail', proj.id)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-orange-50 border border-slate-100 flex items-center justify-center text-[#B24724] shrink-0 font-black">
                          PM
                        </div>
                        <div>
                          <p className="font-serif font-black text-slate-800 text-xs leading-none group-hover:text-[#B24724] transition-colors">{proj.title}</p>
                          <span className="text-[9px] font-mono text-slate-400 mt-1 block">Independent auditor endpoint</span>
                        </div>
                      </div>
                    </td>

                    {/* Owner credentials */}
                    <td className="py-3 px-4">
                      <p className="text-xs font-bold text-slate-700">{proj.ownerName}</p>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">Campaign host</p>
                    </td>

                    {/* Escrow balance */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      ${proj.fundingRaised.toLocaleString()} USD
                    </td>

                    {/* StatusBadge */}
                    <td className="py-3 px-4">
                      <StatusBadge status={proj.status} />
                    </td>

                    {/* Pending sub events */}
                    <td className="py-3 px-4">
                      {submittedMilestonesCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono tracking-wider font-extrabold bg-[#B24724]/10 text-[#B24724] px-2.5 py-0.5 rounded-full border border-orange-100 animate-pulse select-none">
                          <AlertCircle className="h-2.5 w-2.5" /> {submittedMilestonesCount} Review events
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono tracking-wider font-semibold bg-slate-50 text-slate-450 px-2 py-0.5 rounded-full border">
                          No pending logs
                        </span>
                      )}
                    </td>

                    {/* Diligence Rating bars */}
                    <td className="py-3 px-4">
                      <ScoreBars score={fidelityScore} />
                    </td>

                    {/* Redirection */}
                    <td className="py-3 px-4 text-right">
                      <PillButton
                        variant="outline"
                        caps={false}
                        onClick={() => onNavigate('project_detail', proj.id)}
                        className="py-1 px-2.5 text-[10px] font-mono ml-auto"
                      >
                        Audit Desk
                        <ArrowUpRight className="h-3 w-3" />
                      </PillButton>
                    </td>
                  </tr>
                );
              })}

              {filteredPmProjects.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 font-mono italic">
                    No appointed monitor allocations mapped to this credential.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* FIELD MONITOR COHORT REGULATION DESK */}
      <div className="bg-slate-50 p-5 border border-slate-200 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-9 w-9 rounded-xl bg-orange-50 text-[#B24724] flex items-center justify-center shrink-0">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <h5 className="font-bold text-slate-800 text-xs font-serif leading-none">Certified Field Auditor Registry</h5>
            <p className="text-[11px] text-slate-500 font-sans leading-tight">By law, you must maintain objective neutral surveillance logs. Approval signals instant smart contract disbursement releases.</p>
          </div>
        </div>
        <div className="rounded-lg bg-orange-50 p-2.5 px-4 text-slate-650 font-mono text-[10px] border border-orange-100 flex items-center gap-1.5">
          <CheckCircle className="h-4 w-4 text-[#B24724]" /> Active verification rights enabled
        </div>
      </div>

    </motion.div>
  );
}
