import React, { useState, useRef } from 'react';
import { apiUpload } from '../lib/apiClient';
import { Project, Milestone } from '../types';
import { useAuth } from '../context/AuthContext';
import { useProjectsStore } from '../hooks/useProjectsStore';
import { useAssignmentsStore } from '../hooks/useAssignmentsStore';
import { StatusBadge } from './ui/StatusBadge';
import { Play, FileText, CheckCircle2, AlertTriangle, ChevronRight, Check, X, ShieldAlert, Sparkles, Building, Handshake } from 'lucide-react';
import { PillButton } from './PillButton';
import { useToast } from '../context/ToastContext';

interface MilestonePanelProps {
  project: Project;
  onMilestoneUpdated?: () => Promise<void>;
}

export function MilestonePanel({ project, onMilestoneUpdated }: MilestonePanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { startMilestone, submitMilestoneEvidence, reviewMilestone } = useProjectsStore();
  const { getForProject } = useAssignmentsStore();

  const [activeTab, setActiveTab] = useState<number>(0);
  const [evidenceDesc, setEvidenceDesc] = useState<string>("");
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string>("");
  const [customEvidenceUrl, setCustomEvidenceUrl] = useState<string>("");
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [reviewingAction, setReviewingAction] = useState<'approved' | 'rejected' | null>(null);
  const [startingMilestone, setStartingMilestone] = useState(false);
  const evidenceFileRef = useRef<HTMLInputElement>(null);

  const syncProjectView = async () => {
    await onMilestoneUpdated?.();
  };

  const MAX_EVIDENCE_SIZE = 5 * 1024 * 1024;

  const assignment = getForProject(project.id);
  const isPM = user && assignment && assignment.pmId === user.id;
  const isOwner = user && project.ownerId === user.id;

  // Handy mockup evidence presets
  const evidencePresets = [
    { label: "Engineering Sign-off (PDF)", url: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=400" },
    { label: "Campus Piping Survey Photo", url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=400" },
    { label: "Community Water Council Signature", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" },
    { label: "Lombok Reef Seed Matrix Image", url: "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&q=80&w=400" }
  ];

  const handleStart = async (idx: number) => {
    setStartingMilestone(true);
    try {
      setActionError("");
      await startMilestone(project.id, idx);
      await syncProjectView();
      toast.success(`Milestone #${idx + 1} is now active.`);
    } catch (e: any) {
      const message = e?.message || 'Could not spin up milestone.';
      setActionError(message);
      toast.error(message);
    } finally {
      setStartingMilestone(false);
    }
  };

  const handleAddPresetEvidence = (url: string) => {
    if (!evidenceUrls.includes(url)) {
      setEvidenceUrls([...evidenceUrls, url]);
    }
  };

  const handleAddCustomEvidence = () => {
    if (customEvidenceUrl.trim() && !evidenceUrls.includes(customEvidenceUrl.trim())) {
      setEvidenceUrls([...evidenceUrls, customEvidenceUrl.trim()]);
      setCustomEvidenceUrl("");
    }
  };

  const handleEvidenceFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setActionError('Evidence must be an image or PDF.');
      return;
    }
    if (file.size > MAX_EVIDENCE_SIZE) {
      setActionError('Evidence file must be 5MB or smaller.');
      return;
    }

    setUploadingEvidence(true);
    setActionError("");
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
      const { url } = await apiUpload('evidence', file.name, base64, file.type);
      if (!evidenceUrls.includes(url)) {
        setEvidenceUrls([...evidenceUrls, url]);
      }
    } catch (err: unknown) {
      setActionError((err as Error).message || 'Failed to upload evidence.');
    } finally {
      setUploadingEvidence(false);
      if (evidenceFileRef.current) evidenceFileRef.current.value = '';
    }
  };

  const handleRemoveEvidence = (idx: number) => {
    setEvidenceUrls(evidenceUrls.filter((_, i) => i !== idx));
  };

  const handleSubmitEvidence = async (e: React.FormEvent, idx: number) => {
    e.preventDefault();
    if (evidenceUrls.length === 0) {
      setActionError("Please click and attach at least one piece of verifiable evidence.");
      return;
    }
    if (!evidenceDesc.trim()) {
      setActionError("Please describe the work achieved to guide the Auditor PM.");
      return;
    }

    try {
      setIsSubmitting(true);
      setActionError("");
      await submitMilestoneEvidence(project.id, idx, evidenceUrls, evidenceDesc.trim());
      setEvidenceDesc("");
      setEvidenceUrls([]);
      await syncProjectView();
      toast.success('Evidence submitted for auditor review.');
    } catch (e: any) {
      const message = e?.message || 'Failed to submit milestone audit package.';
      setActionError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePMReview = async (idx: number, status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !feedback.trim()) {
      setActionError("Auditor feedback is strictly required when requesting revision or rejecting milestones.");
      toast.warning('Add auditor commentary before requesting a revision.');
      return;
    }

    setReviewingAction(status);
    try {
      setActionError("");
      await reviewMilestone(project.id, idx, status, feedback.trim());
      setFeedback("");
      await syncProjectView();
      if (status === 'approved') {
        toast.success('Funding verified and released to the campaign owner.');
      } else {
        toast.success('Revision request sent to the campaign owner.');
      }
    } catch (e: any) {
      const message = e?.message || 'Failed to review milestone.';
      setActionError(message);
      toast.error(message);
    } finally {
      setReviewingAction(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
      {/* Sidebar: Sequenced Milestones Steps */}
      <div className="lg:col-span-1 space-y-3 shrink-0">
        <label className="text-[10px] font-mono uppercase tracking-widest text-[#059669] font-bold">Sequenced Milestones</label>
        
        <div className="space-y-2 select-none">
          {project.milestones.map((m, idx) => {
            const isClickable = true;
            const isFirstActive = activeTab === idx;
            
            let bulletNumColor = "bg-slate-100 text-slate-500 border-slate-200";
            if (m.status === 'approved') bulletNumColor = "bg-emerald-600 text-white border-emerald-600";
            else if (m.status === 'submitted') bulletNumColor = "bg-purple-600 text-white border-purple-600 animate-pulse";
            else if (m.status === 'in_progress') bulletNumColor = "bg-blue-600 text-white border-blue-600";
            else if (m.status === 'rejected') bulletNumColor = "bg-rose-600 text-white border-rose-600";

            return (
              <button
                key={m.id}
                onClick={() => { setActiveTab(idx); setActionError(""); }}
                className={`w-full p-4 text-left rounded-xl border transition-all flex items-center justify-between ${
                  isFirstActive
                    ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                    : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-6 w-6 font-mono text-[10px] font-bold rounded-full flex items-center justify-center border ${bulletNumColor}`}>
                    {m.status === 'approved' ? <Check className="h-3 w-4 stroke-[3]" /> : idx + 1}
                  </div>
                  <div>
                    <h4 className={`text-xs font-serif font-semibold leading-snug line-clamp-1 ${isFirstActive ? 'text-white' : 'text-slate-900'}`}>
                      {m.title}
                    </h4>
                    <p className={`text-[10px] font-mono mt-0.5 ${isFirstActive ? 'text-slate-400' : 'text-slate-400'}`}>
                      Funds Released: ${m.cost.toLocaleString()}
                    </p>
                  </div>
                </div>
                <ChevronRight className={`h-4 w-4 ${isFirstActive ? 'text-white' : 'text-slate-300'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Panel: Selected Milestone Workspace details */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
        
        {/* Workspace Header */}
        {(() => {
          const m = project.milestones[activeTab];
          const canUserStart = isOwner && m.status === 'pending' && (activeTab === 0 || project.milestones[activeTab - 1].status === 'approved');

          return (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Workspace / Milestone {activeTab + 1} of {project.milestones.length}</span>
                  <h3 className="font-serif font-bold text-slate-900 text-lg leading-tight">{m.title}</h3>
                </div>
                <StatusBadge status={m.status} />
              </div>

              {actionError && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 text-xs font-mono text-rose-700 rounded-xl leading-relaxed">
                  ⚠️ Error: {actionError}
                </div>
              )}

              {/* Description Block */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold block">Milestone scope description</label>
                <p className="text-slate-600 text-xs leading-relaxed font-sans bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
                  {m.description}
                </p>
              </div>

              {/* Escrow payout info */}
              <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100/50 grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <h5 className="font-mono text-[9px] uppercase tracking-wider text-slate-400 uppercase">Audit Costing</h5>
                  <p className="font-mono font-bold text-slate-800 text-base mt-0.5">${m.cost.toLocaleString()}</p>
                </div>
                <div>
                  <h5 className="font-mono text-[9px] uppercase tracking-wider text-slate-400 uppercase">Released to Owner</h5>
                  <p className="font-mono font-bold text-slate-800 text-base mt-0.5">${(m.cost * 0.95).toLocaleString()}</p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <h5 className="font-mono text-[9px] uppercase tracking-wider text-emerald-600 uppercase">Escrow Status</h5>
                  <p className="font-sans font-semibold text-emerald-800 mt-0.5">
                    {m.status === 'approved' ? '🔓 Disbursed & Unlocked' : '🔒 Securely Escrowed'}
                  </p>
                </div>
              </div>

              {/* STAGE-SPECIFIC INTERACTIVE WORKSPACE */}

              {/* 1. Pending Stage: Owner workflow to start */}
              {m.status === 'pending' && (
                <div className="border border-slate-100 rounded-xl p-5 bg-slate-50/50 space-y-4">
                  <div className="flex gap-3">
                    <div className="p-2 bg-orange-500/10 text-orange-600 rounded-lg h-9 w-9 flex items-center justify-center shrink-0">
                      <Play className="h-5 w-5 fill-orange-500/10" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold font-serif text-slate-800 leading-snug">Commence Milestone Work</h4>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-md mt-0.5">
                        Before spending funds or collecting evidence, flag the milestone active to notify PMs and secure escrow priority.
                      </p>
                    </div>
                  </div>

                  {isOwner ? (
                    canUserStart ? (
                      <PillButton
                        variant="primary"
                        caps={false}
                        onClick={() => handleStart(activeTab)}
                        loading={startingMilestone}
                        loadingMessage="Starting milestone..."
                        className="py-2 px-5 text-xs font-mono"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" /> Start Milestone #{activeTab + 1}
                      </PillButton>
                    ) : (
                      <div className="p-3 bg-orange-50/50 border border-orange-200/50 rounded-lg text-[11px] font-mono text-orange-850 leading-relaxed">
                        🔒 Milestone Linked: Backed by sequential constraints. You must complete and obtain PM verification for Milestone {activeTab} before launching Milestone {activeTab + 1}.
                      </div>
                    )
                  ) : (
                    <div className="text-[11px] text-slate-400 italic">
                      Waiting for the campaign creator Patricia Eldo to initiate work.
                    </div>
                  )}
                </div>
              )}

              {/* 2. In_Progress or Rejected Stage: Owner workflow to submit evidence */}
              {(m.status === 'in_progress' || m.status === 'rejected') && (
                <div className="border border-slate-100 rounded-xl p-5 space-y-5">
                  <div className="flex gap-3">
                    <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-lg h-8 w-8 flex items-center justify-center shrink-0">
                      <FileText className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-widest text-slate-700 font-semibold leading-relaxed">Evidence Lodging Desk</h4>
                      <p className="text-xs text-slate-500 max-w-md mt-0.5">
                        Provide blueprint signoffs, photos of finished structures, or volunteer timesheets to secure verification.
                      </p>
                    </div>
                  </div>

                  {m.status === 'rejected' && m.feedback && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-sans space-y-1">
                      <p className="font-mono text-[10px] uppercase font-bold tracking-widest text-rose-800">PM Revision Request Notes:</p>
                      <p className="italic">"{m.feedback}"</p>
                    </div>
                  )}

                  {isOwner ? (
                    <form onSubmit={(e) => handleSubmitEvidence(e, activeTab)} className="space-y-4">
                      
                      {/* Evidence checklist */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Verifiable Documents / Photo URLs ({evidenceUrls.length} loaded)</label>
                        
                        {/* Attachments preview */}
                        {evidenceUrls.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 pb-2">
                            {evidenceUrls.map((url, i) => (
                              <div key={i} className="p-2 border border-slate-200 rounded-lg flex items-center justify-between text-[11px] font-mono bg-slate-50/50">
                                <span className="truncate max-w-[120px] text-slate-600">Evidence Link #{i + 1}</span>
                                <button type="button" onClick={() => handleRemoveEvidence(i)} className="p-1 text-slate-400 hover:text-rose-600">
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Presets load (super handy!) */}
                        <div className="space-y-1.5">
                          <p className="text-[10px] text-slate-400 font-mono">Sandbox Presets: Select mock proofs to append:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {evidencePresets.map((p, i) => (
                              <button
                                type="button"
                                key={i}
                                onClick={() => handleAddPresetEvidence(p.url)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-mono transition-colors"
                              >
                                + {p.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 space-y-2">
                          <input
                            ref={evidenceFileRef}
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={handleEvidenceFileSelect}
                          />
                          <PillButton
                            type="button"
                            variant="outline"
                            caps={false}
                            onClick={() => evidenceFileRef.current?.click()}
                            loading={uploadingEvidence}
                            className="w-full py-2 px-3 text-[10px] font-mono border-dashed"
                          >
                            {uploadingEvidence ? 'Uploading file...' : '+ Upload evidence file (image or PDF)'}
                          </PillButton>
                        </div>

                        {/* Custom Evidence input */}
                        <div className="flex gap-2 pt-2">
                          <input
                            type="text"
                            placeholder="https://example.com/custom-evidence.jpg"
                            value={customEvidenceUrl}
                            onChange={(e) => setCustomEvidenceUrl(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 outline-none"
                          />
                          <PillButton
                            type="button"
                            variant="primary"
                            caps={false}
                            onClick={handleAddCustomEvidence}
                            className="px-3 py-1.5 text-xs font-mono"
                          >
                            Attach URL
                          </PillButton>
                        </div>
                      </div>

                      {/* Work summary */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400">Achieved Milestones Commentary</label>
                        <textarea
                          rows={3}
                          placeholder="List achievements, physical parameters completed, or community testimonies gathered..."
                          value={evidenceDesc}
                          onChange={(e) => setEvidenceDesc(e.target.value)}
                          className="w-full p-3 text-xs outline-none border border-slate-200 rounded-xl focus:border-slate-400 font-sans"
                        />
                      </div>

                      <PillButton
                        type="submit"
                        variant="success"
                        caps={false}
                        loading={isSubmitting}
                        loadingMessage="Submitting evidence for audit..."
                        className="py-2.5 px-5 text-xs font-mono shadow-sm w-full"
                      >
                        Lock Evidence & Request Escrow Disbursement Audit
                      </PillButton>

                    </form>
                  ) : (
                    <div className="text-[11px] text-slate-400 font-mono italic">
                      Waiting for the campaign creator Patricia Eldo to upload physical proof.
                    </div>
                  )}
                </div>
              )}

              {/* 3. Submitted Stage: Review desk for PM, Blocked view for Owner */}
              {m.status === 'submitted' && (
                <div className="space-y-4">
                  
                  {/* Lock Warning */}
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-2.5 text-xs text-indigo-800">
                    <ShieldAlert className="h-4 w-4 text-indigo-600" />
                    <span className="font-mono">9.2 Escrow Protocol active: Submitted Evidence is Immutable during pending Audit.</span>
                  </div>

                  {/* Submitted documents */}
                  <div className="border border-slate-100 rounded-xl p-5 space-y-4 bg-slate-50/50">
                    <h4 className="text-xs font-mono font-bold uppercase text-slate-600 tracking-wider">Lodged Audit Package</h4>
                    
                    <div className="space-y-3 font-sans text-xs">
                      <div>
                        <p className="font-mono text-[10px] text-slate-400 uppercase">Written Achievements:</p>
                        <p className="text-slate-700 bg-white p-3.5 border border-slate-100 rounded-lg mt-1 italic">
                          "{m.evidenceDescription || 'No commentary submitted.'}"
                        </p>
                      </div>

                      <div>
                        <p className="font-mono text-[10px] text-slate-400 uppercase mb-1">Attached Credential Proofs:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {m.evidenceUrls.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-white hover:bg-slate-50 border border-slate-200/50 rounded-lg text-[10px] font-mono text-[#059669] block truncate text-center"
                            >
                              Verification Image #{i + 1} (Click to inspect)
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PM Review Panel Desk (Rule: 9.4 Only assigned PMs can approve) */}
                  {isPM ? (
                    <div className="border border-indigo-100 p-5 rounded-2xl bg-indigo-50/30 space-y-4">
                      <div className="flex gap-2">
                        <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                        <div>
                          <h4 className="text-xs font-mono uppercase tracking-widest text-indigo-900 font-bold leading-none">Auditor Evaluation Room</h4>
                          <p className="text-[11px] text-indigo-600/80 mt-1 font-mono">You are looking at this campaign because as a pre-approved PM you are designated with escrow verification.</p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-indigo-900 font-semibold">Auditor Commentary & Revision Requests</label>
                        <textarea
                          rows={2.5}
                          placeholder="Include clear reasons if requesting revision. If approving, comments will be etched on the ledger."
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          className="w-full p-3 text-xs bg-white outline-none border border-indigo-200 rounded-xl"
                        />
                      </div>

                      <div className="flex gap-3">
                        <PillButton
                          type="button"
                          variant="muted"
                          caps={false}
                          onClick={() => handlePMReview(activeTab, 'rejected')}
                          loading={reviewingAction === 'rejected'}
                          loadingMessage="Sending revision request..."
                          disabled={reviewingAction === 'approved'}
                          className="flex-1 py-2 px-4 text-xs font-mono"
                        >
                          Request Revision
                        </PillButton>
                        <PillButton
                          type="button"
                          variant="success"
                          caps={false}
                          onClick={() => handlePMReview(activeTab, 'approved')}
                          loading={reviewingAction === 'approved'}
                          loadingMessage="Verifying & releasing funds..."
                          disabled={reviewingAction === 'rejected'}
                          className="flex-1 py-2 px-4 text-xs font-mono"
                        >
                          Verify & Release Funding
                        </PillButton>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl border border-dashed border-slate-200 flex justify-center text-center">
                      <p className="text-[11px] text-slate-400 font-sans max-w-sm">
                        Waiting for independent appointed Project Manager <span className="font-semibold">{assignment?.pmName || 'regulatory auditor'}</span> to audit this submission.
                      </p>
                    </div>
                  )}

                </div>
              )}

              {/* 4. Approved Stage: Funds unlocked, celebrate and display audits */}
              {m.status === 'approved' && (
                <div className="p-5 border border-emerald-200 bg-emerald-50/20 rounded-2xl space-y-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 bg-emerald-100 text-emerald-800 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold font-serif text-emerald-950">Escrow Verification Complete!</h4>
                      <p className="font-mono text-[9px] text-emerald-600 uppercase tracking-widest">Released at {m.approvedAt ? new Date(m.approvedAt).toLocaleDateString() : 'Audited Ledger'}</p>
                    </div>
                  </div>

                  <p className="text-slate-600 text-xs font-sans leading-relaxed">
                    Success! Appointed Project Manager <span className="font-semibold text-slate-800">{assignment?.pmName}</span> fully reviewed physical audits and released the locked Escrow vault of <span className="font-bold text-slate-900">${m.cost.toLocaleString()}</span> to the campaign owner's wallet.
                  </p>

                  <div className="p-3.5 bg-white border border-slate-100 rounded-xl text-xs font-sans italic text-slate-500">
                    " {m.feedback || 'Excellent milestone completion. Scope matches baseline design criteria!' || m.evidenceDescription} "
                  </div>
                </div>
              )}

            </div>
          );
        })()}

      </div>

    </div>
  );
}
