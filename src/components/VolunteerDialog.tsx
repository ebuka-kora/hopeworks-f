import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useApplicationsStore } from '../hooks/useApplicationsStore';
import { X, Calendar, Hammer, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { PillButton } from './PillButton';
import { ModalMotion } from './motion/ModalMotion';
import { getActionDeniedMessage, userCanPerformAction } from '../lib/roleAccess';
import { VolunteerApplication } from '../types';

interface VolunteerDialogProps {
  project: Project;
  onClose: () => void;
  onSuccess: () => void;
}

export function VolunteerDialog({ project, onClose, onSuccess }: VolunteerDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createApplication } = useApplicationsStore();

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [submittedApp, setSubmittedApp] = useState<VolunteerApplication | null>(null);

  const canApply = user && userCanPerformAction(user.roles, 'volunteer_apply');

  // Prefill skills from user profile
  useEffect(() => {
    if (user && user.skills) {
      setSkills(user.skills);
    }
  }, [user]);

  const handleAddSkill = () => {
    if (skillInput.trim().length > 0 && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (idx: number) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  const handleToggleDate = (date: string) => {
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter(d => d !== date));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Please sign in to apply to volunteer.");
      return;
    }

    if (!canApply) {
      setError(getActionDeniedMessage('volunteer_apply'));
      return;
    }

    if (skills.length === 0) {
      setError("Please specify at least one skill or contribution you can provide.");
      return;
    }

    if (!reason.trim()) {
      setError("Please provide a short explanation of why you would like to volunteer.");
      return;
    }

    if (selectedDates.length === 0) {
      setError("Please select at least one availability window date.");
      return;
    }

    if (project.volunteersFilled >= project.volunteerSlots) {
      setError("Violation: This project's volunteer list has already reached its slot capacity.");
      return;
    }

    if (project.ownerId === user.id) {
      setError("Business Rule Violation: You are the project owner. You cannot volunteer on your own project.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const created = await createApplication({
        projectId: project.id,
        projectName: project.title,
        skills,
        reason: reason.trim(),
        dates: selectedDates,
      });

      setSubmittedApp(created);
      toast.success(`Application submitted for "${project.title}". Awaiting owner review.`);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOwner = user && user.id === project.ownerId;
  const isFull = project.volunteersFilled >= project.volunteerSlots;

  if (submittedApp) {
    return (
      <ModalMotion
        open
        onClose={() => { onSuccess(); onClose(); }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        contentClassName="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden p-6 space-y-5"
      >
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <p className="text-sm font-semibold text-slate-900">Application submitted</p>
            <p className="text-xs text-slate-500">The campaign owner will review your application. You will be notified when accepted or declined.</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Reference</span>
              <span className="text-slate-900 font-bold">{submittedApp.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Project</span>
              <span className="text-slate-900 font-semibold truncate max-w-[55%]">{submittedApp.projectName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status</span>
              <span className="text-amber-700 font-semibold">Pending review</span>
            </div>
          </div>
          <PillButton
            type="button"
            variant="success"
            caps={false}
            onClick={() => { onSuccess(); onClose(); }}
            className="w-full py-3 px-4 text-xs font-mono"
          >
            Done — view in Volunteer Desk
          </PillButton>
      </ModalMotion>
    );
  }

  return (
    <ModalMotion
      open
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      contentClassName="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col relative"
    >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <Hammer className="h-5 w-5 text-emerald-600" />
            <h3 className="text-lg font-serif font-semibold text-slate-900">Volunteer Application</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Box (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto shrink">
          {!canApply && user && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-medium">
              {getActionDeniedMessage('volunteer_apply')}
            </div>
          )}
          {isOwner && (
            <div className="p-3 bg-rose-50 border border-rose-200/50 rounded-xl text-xs text-rose-700 font-medium font-mono">
              ⚠️ Escrow Rule Check: You are the owner of this project. You are legally barred from volunteering on your own project.
            </div>
          )}

          {isFull && (
            <div className="p-3 bg-orange-50 border border-orange-200/50 rounded-xl text-xs text-orange-850 font-medium leading-relaxed font-mono">
              🔒 Slot Limit Check: This campaign's volunteer slots are completely full. Applications are closed.
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Project Header */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">Project Campaign</label>
            <p className="text-sm font-semibold text-slate-800 font-serif leading-tight">{project.title}</p>
          </div>

          {/* Prefilled/Custom Skills Selection */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Skills & Assets to Provide</label>
              {user && user.skills && user.skills.length > 0 && (
                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 font-mono">
                  <Sparkles className="h-3 w-3" /> Auto-prefilled from profile
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200/60 min-h-12">
              {skills.map((skill, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-medium bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100">
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(idx)} className="text-emerald-500 hover:text-emerald-700 shrink-0">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {skills.length === 0 && (
                <span className="text-xs text-slate-400 italic flex items-center px-1.5">No skills selected...</span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., Hydrology, Heavy Lifting, Painting"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                disabled={!!isOwner || isFull}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <PillButton
                type="button"
                variant="primary"
                caps={false}
                onClick={handleAddSkill}
                disabled={!!isOwner || isFull || !skillInput.trim()}
                className="px-3 py-1.5 text-xs font-mono"
              >
                Add
              </PillButton>
            </div>
          </div>

          {/* Core Reason details */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500">Volunteering Motivation & Experience</label>
            <textarea
              rows={3}
              maxLength={300}
              placeholder="Why are you seeking to volunteer? Outline any relevant certificates/credentials in construction, ecology, hydrology, or teaching..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={!!isOwner || isFull}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>

          {/* Calendar Dates Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block">Available Campaign Dates</label>
            <p className="text-[10px] text-slate-400 font-sans italic -mt-1 block">Project owner-proposed shifts. Choose at least one date shift:</p>
            
            <div className="grid grid-cols-2 gap-2 pt-1">
              {project.volunteerDates.map((dateStr) => {
                const isSelected = selectedDates.includes(dateStr);
                const formatOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
                const formatted = new Date(dateStr).toLocaleDateString('en-US', formatOpts);
                
                return (
                  <button
                    type="button"
                    key={dateStr}
                    onClick={() => handleToggleDate(dateStr)}
                    disabled={!!isOwner || isFull}
                    className={`py-2 px-3 text-left rounded-xl border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-500 font-medium'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    } disabled:opacity-50`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-mono text-xs">{formatted}</span>
                    </div>
                    {isSelected && <span className="h-2 w-2 rounded-full bg-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex gap-3 shrink-0">
            <PillButton
              type="button"
              variant="muted"
              caps={false}
              onClick={onClose}
              className="flex-1 py-2.5 px-4 text-xs font-mono"
            >
              Cancel
            </PillButton>
            <PillButton
              type="submit"
              variant="success"
              caps={false}
              loading={isSubmitting}
              loadingMessage="Submitting application"
              disabled={!!isOwner || isFull || !canApply || selectedDates.length === 0}
              Icon={Send}
              className="flex-[2] py-2.5 px-4 text-xs font-mono"
            >
              {isSubmitting ? 'Submitting Application...' : 'Submit Recruitment Application'}
            </PillButton>
          </div>
        </form>
    </ModalMotion>
  );
}
