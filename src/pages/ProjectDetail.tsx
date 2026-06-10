import React, { useState, useEffect } from 'react';
import { useProjectsStore } from '../hooks/useProjectsStore';
import { useDonationsStore } from '../hooks/useDonationsStore';
import { useApplicationsStore } from '../hooks/useApplicationsStore';
import { useAuth } from '../context/AuthContext';
import { useAssignmentsStore } from '../hooks/useAssignmentsStore';
import { SDGBadge } from '../components/SDGBadge';
import { MilestonePanel } from '../components/MilestonePanel';
import { DonateDialog } from '../components/DonateDialog';
import { VolunteerDialog } from '../components/VolunteerDialog';
import { StatusBadge } from '../components/ui/StatusBadge';
import { VisualMilestoneTracker } from '../components/VisualMilestoneTracker';
import { Calendar, User, Heart, Compass, Check, Users, ShieldAlert, HeartHandshake, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProjectSkeleton } from '../components/ProjectSkeleton';
import { scaleIn, springBouncy } from '../lib/motion';
import { PillButton } from '../components/PillButton';
import { ShareCampaignButton } from '../components/ShareCampaignButton';
import { getActionDeniedMessage, userCanPerformAction } from '../lib/roleAccess';

interface ProjectDetailProps {
  projectId: string;
  onNavigate: (view: string, id?: string) => void;
  initialAction?: 'donate' | 'volunteer' | null;
  onInitialActionConsumed?: () => void;
}

export function ProjectDetail({
  projectId,
  onNavigate,
  initialAction,
  onInitialActionConsumed,
}: ProjectDetailProps) {
  const { user } = useAuth();
  const { projects, loading, refresh: refreshProjects } = useProjectsStore();
  const { listByProject, refresh: refreshDonations } = useDonationsStore();
  const { listByProject: listApps, updateApplicationStatus, refresh: refreshApplications } = useApplicationsStore();
  const { getForProject } = useAssignmentsStore();

  const [activeTab, setActiveTab] = useState<'about' | 'milestones' | 'volunteers'>('about');
  const [showDonate, setShowDonate] = useState(false);
  const [showVolunteer, setShowVolunteer] = useState(false);
  const [successToast, setSuccessToast] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const project = projects.find(p => p.id === projectId);
  const projectApplications = project ? listApps(project.id) : [];
  const approvedVolunteers = projectApplications.filter((a) => a.status === 'approved');
  const canDonate = Boolean(user && userCanPerformAction(user.roles, 'donate'));
  const canVolunteer = Boolean(user && userCanPerformAction(user.roles, 'volunteer_apply'));
  const volunteerSlotsFull = project
    ? approvedVolunteers.length >= project.volunteerSlots
    : false;

  useEffect(() => {
    if (!project || !initialAction || !user) return;
    if (initialAction === 'donate' && canDonate) {
      setShowDonate(true);
      onInitialActionConsumed?.();
    }
    if (initialAction === 'volunteer' && canVolunteer && !volunteerSlotsFull) {
      setShowVolunteer(true);
      onInitialActionConsumed?.();
    }
  }, [project, initialAction, user, canDonate, canVolunteer, volunteerSlotsFull, onInitialActionConsumed]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ProjectSkeleton count={1} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center select-none font-mono">
        <h2 className="text-xl font-serif font-bold text-slate-800">Initiative Campaign Not Found</h2>
        <p className="text-xs text-slate-400 mt-2">Target campaign identifier is invalid or deleted index.</p>
        <PillButton variant="success" caps={false} onClick={() => onNavigate('explore')} className="mt-4 px-4 py-2 text-xs">
          Return to explorer
        </PillButton>
      </div>
    );
  }

  // Related details
  const donations = listByProject(project.id).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const assignment = getForProject(project.id);
  const isOwner = user?.id === project.ownerId;
  const isAssignedPm = Boolean(user && assignment && assignment.pmId === user.id);
  const isAdmin = Boolean(user?.roles.includes('admin'));
  const canViewMilestoneAnalytics = isOwner || isAssignedPm || isAdmin;

  const percentRaised = Math.min(100, Math.round((project.fundingRaised / project.fundingTarget) * 100));

  const handleDonateClick = () => {
    if (!user) {
      onNavigate('register_donor', project.id);
      return;
    }
    if (canDonate) setShowDonate(true);
  };

  const handleVolunteerClick = () => {
    if (!user) {
      onNavigate('register_volunteer', project.id);
      return;
    }
    if (canVolunteer) setShowVolunteer(true);
  };

  const handleActionSuccess = async (type: 'pledge' | 'apply') => {
    setShowDonate(false);
    setShowVolunteer(false);
    await Promise.all([refreshProjects(), refreshDonations(), refreshApplications()]);
    setSuccessToast(type === 'pledge' ? "Escrow deposit locked! Thank you for backing this SDG milestone." : "Volunteer application lodged successfully.");
    setTimeout(() => setSuccessToast(""), 5000);
  };

  const handleApplicationReview = async (appId: string, status: 'approved' | 'rejected') => {
    try {
      setActionLoading(appId);
      await updateApplicationStatus(appId, status);
      await refreshProjects();
      setSuccessToast(status === 'approved' ? 'Volunteer application approved.' : 'Volunteer application rejected.');
      setTimeout(() => setSuccessToast(""), 5000);
    } catch (e: unknown) {
      setSuccessToast((e as Error).message || 'Failed to update application.');
      setTimeout(() => setSuccessToast(""), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 relative">
      
      {/* Toast status message */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40 }}
            transition={springBouncy}
            className="fixed top-20 inset-x-4 sm:inset-x-auto sm:right-6 sm:left-auto sm:max-w-md z-50 bg-emerald-900 border border-emerald-700 text-white px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl shadow-xl flex items-center gap-3 text-[11px] sm:text-xs font-mono font-medium"
          >
            <Check className="h-4.5 w-4.5 text-emerald-300 stroke-[3]" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP: CAMPAIGN HEADER BREADCRUMB */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-100 pb-5 select-none hover:opacity-95">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Compass className="h-3.5 w-3.5" />
            <button onClick={() => onNavigate('explore')} className="hover:text-slate-700">Explore</button>
            <span>/</span>
            <span className="text-slate-600 truncate max-w-[150px]">{project.title}</span>
          </div>
          <h1 className="font-serif font-semibold text-2xl sm:text-3xl tracking-tight text-slate-900">{project.title}</h1>
          <p className="text-xs text-slate-500 font-sans">{project.summary}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <ShareCampaignButton project={project} currentUserId={user?.id} />
          <StatusBadge status={project.status} />
        </div>
      </div>

      {/* VISUAL MILESTONE & FUNDING TRACKER BLOCK — owner, assigned PM, or admin only */}
      {canViewMilestoneAnalytics && (
        <VisualMilestoneTracker project={project} assignment={assignment} />
      )}

      {/* TWO COLUMNS BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT 2 COLUMNS: Visual cover, tabs workspace */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Hero Banner Cover (using proper referrers) */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={scaleIn}
            transition={springBouncy}
            className="rounded-2xl overflow-hidden border border-slate-100 shadow-md aspect-[16/9] relative select-none"
          >
            <img
              src={project.coverUrl || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=1200"}
              alt={project.title}
              referrerPolicy="no-referrer"
              className="object-cover w-full h-full"
            />
            
            {/* Owner badge overlay */}
            <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs text-slate-200 border border-slate-800 flex items-center gap-1.5">
              <User className="h-4 w-4 text-emerald-400" />
              <span>Created by Patricia Eldo (Owner)</span>
            </div>
          </motion.div>

          {/* Core Alignment SDGs */}
          <div className="space-y-2 select-none border-b border-slate-100 pb-5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">Assigned UN Sustainable Development Goals</label>
            <div className="flex flex-wrap gap-2">
              {project.sdgs.map((num) => (
                <SDGBadge key={num} sdgNumber={num} size="md" />
              ))}
            </div>
          </div>

          {/* Tabs header */}
          <div className="flex border-b border-slate-200 font-mono text-xs gap-3 select-none">
            <button
              onClick={() => setActiveTab('about')}
              className={`py-3 px-4 font-semibold hover:text-slate-950 transition-colors ${
                activeTab === 'about'
                  ? 'border-b-2 border-emerald-600 text-slate-900'
                  : 'text-slate-400'
              }`}
            >
              The Campaign Context
            </button>
            <button
              onClick={() => setActiveTab('milestones')}
              className={`py-3 px-4 font-semibold hover:text-slate-950 transition-colors ${
                activeTab === 'milestones'
                  ? 'border-b-2 border-emerald-600 text-slate-900'
                  : 'text-slate-400'
              }`}
            >
              Milestone Audit Trail ({project.milestones.length})
            </button>
            <button
              onClick={() => setActiveTab('volunteers')}
              className={`py-3 px-4 font-semibold hover:text-slate-950 transition-colors ${
                activeTab === 'volunteers'
                  ? 'border-b-2 border-emerald-600 text-slate-900'
                  : 'text-slate-400'
              }`}
            >
              Volunteers ({projectApplications.length})
            </button>
          </div>

          {/* Tab Workspaces */}
          <div className="space-y-6">
            
            {/* Tab: About */}
            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springBouncy}
                className="space-y-6 leading-relaxed text-slate-600 text-sm"
              >
                <div className="space-y-2">
                  <h3 className="font-serif font-bold text-slate-900 text-base leading-none">Campaign Scope & Core Mission</h3>
                  <p className="font-sans text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">{project.description}</p>
                </div>

                {/* Secure Trust framework badge */}
                <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-xl space-y-2 select-none">
                  <h4 className="text-xs text-slate-800 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 leading-none">
                    <HeartHandshake className="h-4.5 w-4.5 text-emerald-600" /> Secure Escrow & Milestones Rule
                  </h4>
                  <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                    This campaign utilizes a registered HopeWorks escrow wallet. Funds are locked at pledging time. To trigger disbursement, Patricia Eldo must upload physical evidence. Field inspection coordinates are approved only by independent Project Managers.
                  </p>
                </div>

                {/* Propose and show Project auditor */}
                {assignment ? (
                  <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100 flex gap-3 text-xs">
                    <Calendar className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="font-mono text-[9px] uppercase tracking-wider text-emerald-800">Assigned Verification PM</p>
                      <p className="font-bold text-slate-800">{assignment.pmName} (Certified Civil Auditor)</p>
                      <p className="text-slate-500 text-[11px]">Assigned on {new Date(assignment.assignedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-orange-50/30 border border-orange-100 rounded-xl text-xs text-slate-500 flex gap-2 font-sans select-none">
                    <ShieldAlert className="h-5 w-5 text-orange-600 shrink-0" />
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest font-bold text-orange-850 leading-none">Unassigned PM</p>
                      <p className="mt-1 leading-relaxed">This campaign does not have an active Auditor assigned. Support is pending AIS Admin review.</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'milestones' && (
              <motion.div
                key="milestones"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springBouncy}
              >
                <MilestonePanel project={project} onMilestoneUpdated={refreshProjects} />
              </motion.div>
            )}

            {activeTab === 'volunteers' && (
              <motion.div
                key="volunteers"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springBouncy}
                className="space-y-3"
              >
                {projectApplications.length === 0 ? (
                  <p className="text-xs text-slate-400 font-mono italic py-6 text-center">No volunteer applications yet.</p>
                ) : (
                  projectApplications.map((app) => (
                    <div key={app.id} className="p-4 bg-white border border-slate-100 rounded-xl space-y-2 text-xs font-mono">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <p className="font-bold text-slate-800">{app.volunteerName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Applied {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          app.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                          app.status === 'rejected' ? 'bg-red-50 text-red-600' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {app.status || 'pending'}
                        </span>
                      </div>
                      {app.skills?.length > 0 && (
                        <p className="text-[11px] text-slate-500 font-sans">Skills: {app.skills.join(', ')}</p>
                      )}
                      {app.reason && (
                        <p className="text-[11px] text-slate-500 font-sans italic">"{app.reason}"</p>
                      )}
                      {isOwner && (!app.status || app.status === 'pending') && (
                        <div className="flex gap-2 pt-1">
                          <PillButton
                            variant="success"
                            caps={false}
                            onClick={() => handleApplicationReview(app.id, 'approved')}
                            loading={actionLoading === app.id}
                            disabled={(!!actionLoading && actionLoading !== app.id) || project.volunteersFilled >= project.volunteerSlots}
                            className="px-3 py-1.5 text-[10px]"
                          >
                            Approve {!actionLoading && <Check className="h-3 w-3" />}
                          </PillButton>
                          <PillButton
                            variant="muted"
                            caps={false}
                            onClick={() => handleApplicationReview(app.id, 'rejected')}
                            loading={actionLoading === app.id}
                            disabled={!!actionLoading && actionLoading !== app.id}
                            className="px-3 py-1.5 text-[10px]"
                          >
                            Reject {!actionLoading && <X className="h-3 w-3" />}
                          </PillButton>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </motion.div>
            )}

          </div>

          {/* RECENT BENEFACTORS FEED */}
          <div className="space-y-4 pt-4 select-none">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#059669]">Escrow Contribution Feed</h4>
            
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 1 },
                visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
              }}
              className="space-y-2.5 max-h-80 overflow-y-auto"
            >
              {donations.map((don) => (
                <motion.div
                  key={don.id}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={springBouncy}
                  className="p-4 bg-white border border-slate-100 rounded-xl space-y-1 hover:border-slate-200 transition-colors text-xs font-mono"
                >
                  <div className="flex justify-between items-baseline font-mono text-xs">
                    <span className="font-bold text-slate-800">{don.isAnonymous ? '🤝 Anonymous Supporter' : don.donorName}</span>
                    <span className="font-extrabold text-emerald-700 font-mono text-sm">${don.amount.toLocaleString()}</span>
                  </div>
                  {don.message && (
                    <p className="text-slate-500 text-[11px] font-sans font-normal italic leading-relaxed pt-1 select-all">
                      "{don.message}"
                    </p>
                  )}
                  <div className="text-[10px] text-slate-400 mt-1 select-none">
                    LODGED IN ESCROW: {new Date(don.createdAt).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
              {donations.length === 0 && (
                <div className="text-center font-mono text-xs text-slate-400 py-6 italic select-none">
                  No contributions processed yet. Start the chain of goodwill!
                </div>
              )}
            </motion.div>
          </div>

        </div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={springBouncy}
          className="lg:col-span-1 select-none"
        >
          <div className="sticky top-20 bg-white border border-slate-100 rounded-2xl p-6 space-y-6 shadow-sm">
            
            {/* Financial tracking */}
            <div className="space-y-1.5">
              <span className="font-serif font-black text-2xl text-slate-900">${project.fundingRaised.toLocaleString()}</span>
              <span className="text-slate-400 text-xs font-serif italic"> raised of ${project.fundingTarget.toLocaleString()} campaign target</span>
              
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-3">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${percentRaised}%` }}
                />
              </div>

              <div className="flex justify-between items-baseline font-mono text-[10px] text-slate-400 pt-1 leading-none">
                <span>{percentRaised}% secure</span>
                <span>{donations.length} total pledgers</span>
              </div>
            </div>

            {/* Volunteer slots filled ticker */}
            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-slate-800 text-xs font-semibold leading-none">
                <Users className="h-4 w-4 text-indigo-500" />
                <span>Sweat Equity Matches: {approvedVolunteers.length} / {project.volunteerSlots}</span>
              </div>
              <p className="text-[10.5px] text-slate-400 font-sans leading-snug">
                Volunteers seek to offer construction, QA & education skills. Compensated shifts are classified as: <span className="font-semibold">{project.volunteerCompensation}</span>.
              </p>
            </div>

            {/* Primary Action controls */}
            {project.status === 'active' ? (
              <div className="space-y-3 pt-2">
                {!user || canDonate ? (
                  <PillButton
                    variant="success"
                    caps={false}
                    onClick={handleDonateClick}
                    className="w-full py-3 px-4 text-xs font-mono shadow-sm"
                  >
                    <Heart className="h-4 w-4 fill-current" /> Donate securely to Escrow
                  </PillButton>
                ) : (
                  <p className="text-[10px] text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-center">
                    {getActionDeniedMessage('donate')}
                  </p>
                )}

                {!user || canVolunteer ? (
                  <PillButton
                    variant="outline"
                    caps={false}
                    onClick={handleVolunteerClick}
                    disabled={!!user && volunteerSlotsFull}
                    className="w-full py-3 px-4 text-xs font-mono"
                  >
                    <HeartHandshake className="h-4 w-4" /> Apply to Volunteer
                  </PillButton>
                ) : (
                  <p className="text-[10px] text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-center">
                    {getActionDeniedMessage('volunteer_apply')}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-center text-xs font-mono text-indigo-800 select-all font-semibold">
                This campaign has completed all active milestones and resolved all escrow allocations.
              </div>
            )}

            {/* Safe Escrow disclosures */}
            <div className="border-t border-slate-100 pt-4 font-mono text-[10px] text-slate-400 space-y-1 leading-relaxed">
              <p className="flex items-center gap-1">
                <Check className="h-3.5 w-3.5 text-emerald-500" /> Securer escrow protocols active
              </p>
              <p className="flex items-center gap-1">
                <Check className="h-3.5 w-3.5 text-emerald-500" /> 100% money released sequential on-evidence only
              </p>
              <p className="text-[9px] text-slate-400 font-sans italic pt-1.5 block">
                Disclosed transparently: A 5% transaction service fee covers regional engineers audits to filter waste.
              </p>
            </div>

          </div>
        </motion.div>

      </div>

      {/* DIALOGS ATTACHMENTS */}
      {showDonate && (
        <DonateDialog
          project={project}
          onClose={() => setShowDonate(false)}
          onSuccess={() => handleActionSuccess('pledge')}
        />
      )}

      {showVolunteer && (
        <VolunteerDialog
          project={project}
          onClose={() => setShowVolunteer(false)}
          onSuccess={() => handleActionSuccess('apply')}
        />
      )}

    </div>
  );
}
