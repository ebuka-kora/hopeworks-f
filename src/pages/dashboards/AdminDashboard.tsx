import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { springDashboard } from '../../lib/motion';
import { useAuth } from '../../context/AuthContext';
import { useProjectsStore } from '../../hooks/useProjectsStore';
import { useAssignmentsStore } from '../../hooks/useAssignmentsStore';
import { useAuditLogsStore } from '../../hooks/useAuditLogsStore';
import { PillButton } from '../../components/PillButton';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { Project } from '../../types';
import { 
  ShieldCheck, 
  UserCheck, 
  Check, 
  AppWindow as AppIcon, 
  Compass, 
  Sparkles, 
  Building, 
  Briefcase,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  MoreHorizontal,
  AlertCircle,
  HelpCircle,
  User,
  GraduationCap,
  Trash2
} from 'lucide-react';

export const CIVIC_ROLES = {
  entrepreneur: {
    abbr: 'PO',
    label: 'Project Owner',
    colorClass: 'bg-[#0B4F35] text-white border-[#0B4F35]',
    bgLight: 'bg-[#0B4F35]/12 text-[#0B4F35] border-[#0B4F35]/25 font-semibold',
    desc: 'Runs accountable, milestone-based campaigns and recruits volunteers.'
  },
  donor: {
    abbr: 'DO',
    label: 'Donor / Sponsor',
    colorClass: 'bg-[#A9441B] text-white border-[#A9441B]',
    bgLight: 'bg-[#A9441B]/12 text-[#A9441B] border-[#A9441B]/25 font-semibold',
    desc: 'Funds work they can verify, with a full ledger from contribution to delivery.'
  },
  volunteer: {
    abbr: 'VO',
    label: 'Volunteer',
    colorClass: 'bg-[#133863] text-white border-[#133863]',
    bgLight: 'bg-[#133863]/12 text-[#133863] border-[#133863]/25 font-semibold',
    desc: 'Contributes time + skills, sets availability, earns verified recognition.'
  },
  project_manager: {
    abbr: 'PM',
    label: 'Project Manager',
    colorClass: 'bg-[#704A0E] text-white border-[#704A0E]',
    bgLight: 'bg-[#704A0E]/12 text-[#704A0E] border-[#704A0E]/25 font-semibold',
    desc: 'Independently verifies milestone delivery. Read-only on project content.'
  },
  admin: {
    abbr: 'AD',
    label: 'Administrator',
    colorClass: 'bg-[#7F1D1D] text-white border-[#7F1D1D]',
    bgLight: 'bg-[#7F1D1D]/12 text-[#7F1D1D] border-[#7F1D1D]/25 font-semibold',
    desc: 'Vets campaigns, verifies identities, assigns PMs, governs the platform.'
  }
} as const;

export type AdminSegment = 'id_queue' | 'campaign_desk' | 'roles_desk' | 'audit_desk';

interface AdminDashboardProps {
  activeSegment?: AdminSegment;
  onSegmentChange?: (segment: AdminSegment) => void;
}

export function AdminDashboard({
  activeSegment: controlledSegment,
  onSegmentChange,
}: AdminDashboardProps = {}) {
  const { users, verifyUser, allPms, setUserRoles, refreshUsers } = useAuth();
  const { toast } = useToast();
  const { projects, updateCampaign, deleteCampaign } = useProjectsStore();
  const { assignProject, unassignProject, getForProject } = useAssignmentsStore();
  const { logs: auditLogs, loading: auditLogsLoading, refresh: refreshAuditLogs } = useAuditLogsStore(true);

  const [assigningProjectId, setAssigningProjectId] = useState<string | null>(null);
  const [resettingPmProjectId, setResettingPmProjectId] = useState<string | null>(null);
  const [selectedPmMap, setSelectedPmMap] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [internalSegment, setInternalSegment] = useState<AdminSegment>('id_queue');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [campaignToDelete, setCampaignToDelete] = useState<Project | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState(false);
  const [verifyingUserId, setVerifyingUserId] = useState<string | null>(null);
  const [approvingCampaignId, setApprovingCampaignId] = useState<string | null>(null);

  const activeSegment = controlledSegment ?? internalSegment;
  const setActiveSegment = (segment: AdminSegment) => {
    if (onSegmentChange) onSegmentChange(segment);
    else setInternalSegment(segment);
  };

  // 1. Identity verifications queue
  const verificationQueue = users.filter(u => u.verificationStatus === 'pending');

  // 2. Campaigns pending pre-launch audit validation
  const pendingCampaigns = projects.filter(p => p.status === 'pending');
  const activeCampaigns = projects.filter(p => p.status === 'active');
  const totalManagedCampaigns = projects.filter(
    (p) => p.status === 'pending' || p.status === 'active' || p.status === 'completed'
  ).length;
  const campaignDeskRows = projects.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => { refreshUsers(); }, [refreshUsers]);

  useEffect(() => {
    setSearchTerm('');
    setSelectedRows([]);
    if (activeSegment === 'audit_desk') {
      refreshAuditLogs();
    }
  }, [activeSegment, refreshAuditLogs]);

  const handleVerify = async (userId: string, action: 'approve' | 'reject') => {
    setVerifyingUserId(userId);
    try {
      await verifyUser(userId, action);
      toast.success(action === 'approve' ? 'Identity profile verified.' : 'Identity profile rejected.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update verification status.');
    } finally {
      setVerifyingUserId(null);
    }
  };

  const handleApproveCampaign = async (projectId: string) => {
    setApprovingCampaignId(projectId);
    try {
      await updateCampaign(projectId, { status: 'active' });
      toast.success('Campaign authorized and released live.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve campaign.');
    } finally {
      setApprovingCampaignId(null);
    }
  };

  const handleDeleteCampaign = async () => {
    if (!campaignToDelete || deletingCampaign) return;
    setDeletingCampaign(true);
    try {
      await deleteCampaign(campaignToDelete.id);
      setSelectedRows((rows) => rows.filter((id) => id !== campaignToDelete.id));
      toast.success(`Campaign "${campaignToDelete.title}" was deleted.`);
      setCampaignToDelete(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete campaign.');
    } finally {
      setDeletingCampaign(false);
    }
  };

  const handleAssignPm = async (projectId: string, pmId: string) => {
    const pm = allPms.find(p => p.id === pmId);
    if (pm) {
      await assignProject(projectId, pm.id, pm.name);
      setAssigningProjectId(null);
      await refreshAuditLogs();
      toast.success(`${pm.name} appointed as PM for this campaign.`);
    }
  };

  const handleResetPm = async (projectId: string) => {
    const assignment = getForProject(projectId);
    if (!assignment || resettingPmProjectId) return;

    setResettingPmProjectId(projectId);
    try {
      await unassignProject(projectId);
      setSelectedPmMap((prev) => ({ ...prev, [projectId]: '' }));
      await refreshAuditLogs();
      toast.success(`Removed ${assignment.pmName} from this campaign.`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to reset PM assignment.');
    } finally {
      setResettingPmProjectId(null);
    }
  };

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

  // Score Bars Component to match Conceptzilla UI
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
      
      {/* 1. TOP METRICS BLOCK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <span>Gov-ID Reviews</span>
              {verificationQueue.length > 0 && (
                <span className="text-[10px] text-amber-600 bg-amber-50 px-1 py-0.2 rounded-md font-bold font-mono animate-pulse">Required</span>
              )}
            </div>
            <p className="font-serif font-black text-2xl text-slate-900">{verificationQueue.length} Pending</p>
            <p className="text-[10px] text-slate-400 font-mono">Platform Identity Queue</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <span>Campaign Approvals</span>
              {pendingCampaigns.length > 0 && (
                <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded-md font-bold font-mono">Action needed</span>
              )}
            </div>
            <p className="font-serif font-black text-2xl text-slate-900">{totalManagedCampaigns} Campaigns</p>
            <p className="text-[10px] text-slate-400 font-mono">
              {pendingCampaigns.length} awaiting approval · {activeCampaigns.length} live
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <span>Platform Escrow Pot</span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded-md font-bold font-mono">100% Safe</span>
            </div>
            <p className="font-serif font-black text-2xl text-emerald-800">$142,500</p>
            <p className="text-[10px] text-slate-400 font-mono">Aggregated escrow balances</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <span>Compliance Ratio</span>
              <span className="text-[10px] text-teal-600 bg-teal-50 px-1 py-0.2 rounded-md font-bold font-mono">Optimal</span>
            </div>
            <p className="font-serif font-black text-2xl text-teal-800">99.7%</p>
            <p className="text-[10px] text-slate-400 font-mono">Verified public chain hashes</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">

        {/* CONTROL ACTIONS MIDDLE LAYER */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50/50">
          
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
              <Search className="h-3.5 w-3.5" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search administration queue..."
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

        {/* Segment 1: Identity Queue table */}
        {activeSegment === 'id_queue' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100 text-[10px] font-mono font-black text-slate-400 tracking-wider">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={verificationQueue.length > 0 && selectedRows.length === verificationQueue.length}
                      onChange={() => handleSelectAll(verificationQueue.map(q => q.id))}
                      className="rounded text-[#B24724] focus:ring-[#B24724]"
                    />
                  </th>
                  <th className="py-3 px-4">REGISTERED USER</th>
                  <th className="py-3 px-4">EMAIL GATEWAY</th>
                  <th className="py-3 px-4">ATTACHED LEGAL ID</th>
                  <th className="py-3 px-4">VERIFICATION NODAL STATUS</th>
                  <th className="py-3 px-4">COOPERATIVE RATING</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {verificationQueue.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map((queueUser) => {
                  const isSelected = selectedRows.includes(queueUser.id);
                  return (
                    <tr 
                      key={queueUser.id}
                      className={`hover:bg-slate-50/40 transition-colors ${
                        isSelected ? 'bg-orange-50/15' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(queueUser.id)}
                          className="rounded text-[#B24724] focus:ring-[#B24724] cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#B24724]/10 text-[#B24724] flex items-center justify-center font-bold text-xs">
                            {queueUser.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-serif font-black text-slate-800 text-xs">{queueUser.name}</p>
                            <span className="text-[9px] text-[#B24724] font-mono block mt-0.5 capitalize">AUTHORIZED ROLES: {queueUser.roles.join(', ')}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-[#475569] font-mono select-all">
                        {queueUser.email}
                      </td>

                      <td className="py-3 px-4">
                        {queueUser.govIdUrl ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 border p-1 rounded-md max-w-[150px] truncate block">
                              gov_passport_id.bin
                            </span>
                            <a 
                              href={queueUser.govIdUrl}
                              target="_blank"
                              referrerPolicy="no-referrer"
                              className="text-[9px] text-[#B24724] hover:underline font-bold"
                            >
                              PREVIEW ID
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No document attached</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono tracking-wider font-extrabold bg-amber-55/15 text-amber-700 px-2 py-0.5 rounded-full border border-amber-150 uppercase animate-pulse">
                          Awaiting Decrypt
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <ScoreBars score={7} />
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <PillButton
                            variant="muted"
                            caps={false}
                            onClick={() => handleVerify(queueUser.id, 'reject')}
                            loading={verifyingUserId === queueUser.id}
                            disabled={!!verifyingUserId && verifyingUserId !== queueUser.id}
                            className="px-2 py-1 text-[9px] font-mono"
                          >
                            Reject
                          </PillButton>
                          <PillButton
                            variant="success"
                            caps={false}
                            onClick={() => handleVerify(queueUser.id, 'approve')}
                            loading={verifyingUserId === queueUser.id}
                            disabled={!!verifyingUserId && verifyingUserId !== queueUser.id}
                            className="px-2 py-1 text-[9px] font-mono"
                          >
                            Confirm Profile {verifyingUserId !== queueUser.id && <UserCheck className="h-3 w-3" />}
                          </PillButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {verificationQueue.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 font-mono italic">
                      No identities pending manual decrypt verification in platform rosters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Segment 2: Campaigns Launches List */}
        {activeSegment === 'campaign_desk' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100 text-[10px] font-mono font-black text-slate-400 tracking-wider">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={pendingCampaigns.length > 0 && selectedRows.length === pendingCampaigns.length}
                      onChange={() => handleSelectAll(pendingCampaigns.map(c => c.id))}
                      className="rounded text-[#B24724] focus:ring-[#B24724]"
                    />
                  </th>
                  <th className="py-3 px-4">CAMPAIGN TITLE</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">CREATOR OWNER</th>
                  <th className="py-3 px-4">TARGET GOAL BUDGET</th>
                  <th className="py-3 px-4">APPOINTED MONITOR AUDITOR</th>
                  <th className="py-3 px-4">LAUNCH SECURITY ACTION</th>
                  <th className="py-3 px-4 w-28">DELETE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaignDeskRows.map((camp) => {
                  const currentAssignment = getForProject(camp.id);
                  const selectedPmForProj = selectedPmMap[camp.id] || "";
                  const isSelected = selectedRows.includes(camp.id);

                  return (
                    <tr 
                      key={camp.id}
                      className={`hover:bg-slate-50/40 transition-colors ${
                        isSelected ? 'bg-orange-50/15' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(camp.id)}
                          className="rounded text-[#B24724] focus:ring-[#B24724] cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-4 font-serif font-black text-slate-800 text-xs">
                        {camp.title}
                        <span className="text-[9px] font-mono tracking-wider text-slate-400 capitalize block mt-1.5">Category: {camp.category}</span>
                      </td>

                      <td className="py-3 px-4">
                        <StatusBadge status={camp.status} />
                      </td>

                      <td className="py-3 px-4 text-xs font-bold text-slate-600">
                        {camp.ownerName}
                      </td>

                      <td className="py-3 px-4 font-mono font-black text-slate-900">
                        ${camp.fundingTarget.toLocaleString()} USD
                      </td>

                      <td className="py-3 px-4">
                        {currentAssignment ? (
                          <div className="flex justify-between items-center text-xs text-slate-700 bg-slate-50 border p-1 px-2 rounded-lg">
                            <span>Appointed: <span className="font-bold text-slate-800">{currentAssignment.pmName}</span></span>
                            <button
                              type="button"
                              onClick={() => handleResetPm(camp.id)}
                              disabled={resettingPmProjectId === camp.id}
                              className="text-[9px] text-[#B24724] font-mono underline hover:text-[#9A3412] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 ml-2"
                            >
                              {resettingPmProjectId === camp.id ? 'Resetting…' : 'Reset'}
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <select
                              value={selectedPmForProj}
                              onChange={(e) => setSelectedPmMap({ ...selectedPmMap, [camp.id]: e.target.value })}
                              className="p-1 border border-slate-200 outline-none rounded-lg bg-white text-xs font-sans max-w-[190px]"
                            >
                              <option value="">-- Appoint PM --</option>
                              {allPms.map(pm => (
                                <option key={pm.id} value={pm.id}>{pm.name}</option>
                              ))}
                            </select>
                            
                            <PillButton
                              variant="brand"
                              caps={false}
                              onClick={() => handleAssignPm(camp.id, selectedPmForProj)}
                              disabled={!selectedPmForProj}
                              className="py-1 px-2.5 text-[9px] shrink-0"
                            >
                              Confirm PM
                            </PillButton>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {camp.status === 'pending' ? (
                          <PillButton
                            variant="success"
                            caps={false}
                            onClick={() => handleApproveCampaign(camp.id)}
                            loading={approvingCampaignId === camp.id}
                            loadingMessage="Authorizing campaign..."
                            disabled={!currentAssignment || (!!approvingCampaignId && approvingCampaignId !== camp.id)}
                            className="w-full py-1.5 text-[9px] font-mono"
                          >
                            {!currentAssignment ? 'Auditor Required first' : 'Authorize Campaign Release'}
                          </PillButton>
                        ) : (
                          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                            {camp.status === 'active' ? 'Live on platform' : camp.status}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <PillButton
                          type="button"
                          variant="danger"
                          caps={false}
                          onClick={() => setCampaignToDelete(camp)}
                          className="w-full py-1.5 text-[9px]"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </PillButton>
                      </td>
                    </tr>
                  );
                })}

                {campaignDeskRows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400 font-mono italic">
                      No campaigns match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Segment 4: Audit Trail Desk */}
        {activeSegment === 'audit_desk' && (() => {
          const filteredAuditLogs = auditLogs.filter(log =>
            log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.actionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.affectedEntityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.rationale || '').toLowerCase().includes(searchTerm.toLowerCase())
          );

          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={springDashboard} className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-100 text-[10px] font-mono font-black text-slate-400 tracking-wider">
                    <th className="py-3 px-4">TIMESTAMP</th>
                    <th className="py-3 px-4">ACTOR</th>
                    <th className="py-3 px-4">ACTION</th>
                    <th className="py-3 px-4">ENTITY</th>
                    <th className="py-3 px-4">RATIONALE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogsLoading && (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400 font-mono italic">
                        Loading audit trail...
                      </td>
                    </tr>
                  )}
                  {!auditLogsLoading && filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800">{log.actorName}</p>
                        <p className="text-[9px] text-slate-400 font-mono">{log.actorRole}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[9px] font-bold font-mono">
                          {log.actionType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{log.affectedEntityName}</td>
                      <td className="py-3 px-4 text-slate-500 font-sans text-[11px]">{log.rationale || '—'}</td>
                    </tr>
                  ))}
                  {!auditLogsLoading && filteredAuditLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400 font-mono italic">
                        {auditLogs.length === 0
                          ? 'No audit log entries recorded yet.'
                          : 'No audit log entries match your search.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </motion.div>
          );
        })()}

        {/* Segment 3: Civic Roles Desk */}
        {activeSegment === 'roles_desk' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={springDashboard} className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100 text-[10px] font-mono font-black text-slate-400 tracking-wider">
                  <th className="py-3 px-4">REGISTERED CITIZEN</th>
                  <th className="py-3 px-4">EMAIL PATHWAY</th>
                  <th className="py-3 px-4">CURRENT AUTHORIZED ROLES</th>
                  <th className="py-3 px-4">ROLE PERMISSIONS PANEL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())).map((targetUser) => {
                  const roleOptions = [
                    { id: 'admin' as const, details: CIVIC_ROLES.admin },
                    { id: 'project_manager' as const, details: CIVIC_ROLES.project_manager },
                    { id: 'entrepreneur' as const, details: CIVIC_ROLES.entrepreneur },
                    { id: 'volunteer' as const, details: CIVIC_ROLES.volunteer },
                    { id: 'donor' as const, details: CIVIC_ROLES.donor }
                  ];

                  const handleToggleRoleForUser = async (role: typeof targetUser.roles[number]) => {
                    let updatedRoles = [...targetUser.roles];
                    if (updatedRoles.includes(role)) {
                      if (updatedRoles.length === 1) return;
                      updatedRoles = updatedRoles.filter(r => r !== role);
                    } else {
                      updatedRoles.push(role);
                    }
                    await setUserRoles(targetUser.id, updatedRoles);
                  };

                  return (
                    <tr key={targetUser.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-sans">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#B24724]/10 text-[#B24724] flex items-center justify-center font-bold text-xs select-none">
                            {targetUser.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-serif font-black text-slate-800 text-xs">{targetUser.name}</p>
                            <span className="text-[9px] text-slate-400 font-mono block mt-0.5">ID Ref: {targetUser.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#475569] font-mono select-none">
                        {targetUser.email}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex flex-wrap gap-1.5">
                          {targetUser.roles.map(r => {
                            const opt = roleOptions.find(o => o.id === r);
                            if (!opt) return null;
                            return (
                              <span key={r} className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold select-none flex items-center gap-1 ${opt.details.bgLight}`}>
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                                {opt.details.abbr}: {opt.details.label}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-sans">
                        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={springDashboard} className="flex flex-wrap gap-2">
                          {roleOptions.map((opt) => {
                            const hasRole = targetUser.roles.includes(opt.id);
                            return (
                              <button
                                key={opt.id}
                                onClick={() => handleToggleRoleForUser(opt.id)}
                                className={`px-3 py-1.5 rounded-lg border text-[10px] font-sans font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                                  hasRole
                                    ? `${opt.details.colorClass} shadow-xs scale-[1.02]`
                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                }`}
                                title={opt.details.desc}
                              >
                                <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center font-mono font-bold text-[8.5px] ${hasRole ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                  {opt.details.abbr}
                                </span>
                                <span>{opt.details.label}</span>
                              </button>
                            );
                          })}
                        </motion.div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        )}

      </div>

      {/* SYSTEM REGIME SAFEGUARD RULES BANNER */}
      <div className="bg-slate-50 p-5 border border-slate-200 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-9 w-9 rounded-xl bg-orange-50 text-[#B24724] flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <h5 className="font-bold text-slate-800 text-xs font-serif leading-none">Platform Custodia Compliance protocol</h5>
            <p className="text-[11px] text-slate-500 font-sans leading-tight">Identity audits protect community capital under UN SDG legal frameworks. Every campaign launch must select a third-party monitor prior to escrow activations.</p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!campaignToDelete}
        title="Delete campaign?"
        message={
          campaignToDelete
            ? `Permanently delete "${campaignToDelete.title}"? This removes milestones, assignments, and related records. This cannot be undone.`
            : ''
        }
        confirmLabel={deletingCampaign ? 'Deleting...' : 'Delete campaign'}
        cancelLabel="Cancel"
        variant="danger"
        loading={deletingCampaign}
        onConfirm={handleDeleteCampaign}
        onCancel={() => !deletingCampaign && setCampaignToDelete(null)}
      />

    </motion.div>
  );
}
