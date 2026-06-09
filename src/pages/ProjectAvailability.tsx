import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProjectsStore } from '../hooks/useProjectsStore';
import { useAvailabilityStore } from '../hooks/useAvailabilityStore';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Calendar, Save, CheckCircle2, User, FileText, Info } from 'lucide-react';
import { PillButton } from '../components/PillButton';

interface ProjectAvailabilityProps {
  onNavigate: (view: string, id?: string) => void;
  initialProjectId?: string;
}

export function ProjectAvailability({ onNavigate, initialProjectId }: ProjectAvailabilityProps) {
  const { user } = useAuth();
  const { projects } = useProjectsStore();
  const { getForUserAndProject, setAvailability } = useAvailabilityStore();
  const { addToast } = useToast();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || projects[0]?.id || "");
  const project = projects.find(p => p.id === selectedProjectId);

  // Read current availability
  const existingAv = user ? getForUserAndProject(user.id, selectedProjectId) : undefined;

  const [selectedDates, setSelectedDates] = useState<string[]>(existingAv?.availableDates || []);
  const [notes, setNotes] = useState<string>(existingAv?.notes || "");
  const [saving, setSaving] = useState(false);

  // When project switches, reload current availability for that project
  React.useEffect(() => {
    if (user && selectedProjectId) {
      const av = getForUserAndProject(user.id, selectedProjectId);
      setSelectedDates(av?.availableDates || []);
      setNotes(av?.notes || "");
    }
  }, [selectedProjectId, user]);

  const handleDateToggle = (date: string) => {
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter(d => d !== date));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const handleSave = async () => {
    if (!user) {
      addToast({
        title: 'Authentication Required',
        description: 'You must be signed in to submit volunteer availability.',
        type: 'error'
      });
      return;
    }

    if (!selectedProjectId) {
      addToast({
        title: 'Error',
        description: 'Please find and select a campaign first.',
        type: 'error'
      });
      return;
    }

    setSaving(true);
    try {
      await setAvailability(selectedProjectId, user.id, user.name, selectedDates, notes);
      addToast({
        title: 'Availability Manifest Saved',
        description: `Successfully loaded ${selectedDates.length} slot dates into "${project?.title}" scheduling registry!`,
        type: 'success'
      });
    } catch (e: unknown) {
      addToast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to save availability.',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 select-none relative">
      {/* Return button */}
      <div className="flex items-center justify-between">
        <PillButton
          variant="outline"
          caps={false}
          onClick={() => onNavigate('home')}
          className="py-2 px-4 text-xs font-mono"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </PillButton>
        <span className="text-[10px] font-mono text-slate-400">Section 5.4 - Slot Registries</span>
      </div>

      <div className="space-y-3">
        <span className="text-[10px] bg-[#B24724]/10 text-[#B24724] px-3.5 py-1 rounded-full font-mono font-black uppercase tracking-widest">
          COORDINATED VOLUNTEER CALENDARS
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal text-slate-900 tracking-tight">
          Select Campaign Slot Availability
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
          Select which days you have field-readiness to secure goals and supply hours. Project owners can review this ledger aggregate before dispatching team invites.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left 1: Target Selector and project info */}
        <div className="md:col-span-1 space-y-6">
          <div className="border border-slate-200 bg-white rounded-2xl p-5 space-y-4">
            <label className="block text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
              1. Choose SDG Campaign
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full text-xs font-mono rounded-lg border border-slate-200 p-2.5 bg-slate-50 text-slate-800 hover:bg-slate-100 transition-colors focus:ring-1 focus:ring-[#B24724] focus:outline-hidden"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {project && (
            <div className="border border-slate-200/50 bg-[#FAF9F6]/50 rounded-2xl p-5 space-y-4 text-xs font-mono">
              <h4 className="font-bold text-slate-800">Target SDG Campaign Details</h4>
              <p className="text-slate-500 normal-case leading-relaxed font-sans">{project.summary}</p>
              <div className="space-y-1.5 pt-2 border-t border-slate-200/50">
                <div className="flex justify-between">
                  <span className="text-slate-400">Compensation:</span>
                  <span className="font-bold uppercase text-slate-700">{project.volunteerCompensation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Slots Target:</span>
                  <span className="font-bold text-slate-700">{project.volunteerSlots} volunteers</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 2: Interactive Date picker & Notes */}
        <div className="md:col-span-2 space-y-6">
          {project ? (
            <div className="border border-slate-200 bg-white rounded-3xl p-6 sm:p-8 space-y-8">
              <div className="space-y-2">
                <h3 className="font-serif text-lg font-medium text-slate-800 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#B24724]" />
                  2. Select Availability Dates
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  Owner-proposed windows for this campaign are listed below. Click on dates to confirm your matching availability.
                </p>
              </div>

              {project.volunteerDates && project.volunteerDates.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {project.volunteerDates.map((dateStr) => {
                    const isSelected = selectedDates.includes(dateStr);
                    const dateObj = new Date(dateStr);
                    const formattedDate = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' });
                    
                    return (
                      <button
                        key={dateStr}
                        onClick={() => handleDateToggle(dateStr)}
                        className={`p-3.5 border rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                          isSelected 
                            ? 'border-[#B24724] bg-[#B24724]/5 text-[#B24724] ring-2 ring-[#B24724]/15'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs font-mono font-bold">{formattedDate}</span>
                        <span className="text-[10px] text-slate-400 font-mono tracking-wider">{dateStr}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="border-1.5 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center text-center text-slate-400 space-y-2 max-w-sm mx-auto">
                  <Info className="h-6 w-6 text-slate-300" />
                  <p className="text-xs font-mono">No specific dates requested of volunteers yet.</p>
                  <p className="text-[10px]">Owners will configure dates in their dashboards.</p>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-3">
                <label className="text-xs font-mono font-bold uppercase text-slate-500 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-[#B24724]" />
                  3. Field Logistics Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell the campaign owner about your availability specifics (e.g., specific hours, travel restrictions, transport needs, or skill specializations)..."
                  className="w-full text-xs font-sans rounded-2xl border border-slate-200 p-4 min-h-[120px] bg-slate-50/50 hover:bg-slate-50/20 text-slate-800 transition-colors focus:ring-1 focus:ring-[#B24724] focus:outline-hidden leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <span className="text-[10px] font-mono text-slate-400">
                  {selectedDates.length} target dates selected
                </span>
                <PillButton
                  type="button"
                  variant="primary"
                  caps={false}
                  onClick={handleSave}
                  loading={saving}
                  Icon={Save}
                  className="py-2 px-6 text-xs font-sans shadow-xs"
                >
                  {saving ? 'Saving availability...' : 'Save Slot Availability'}
                </PillButton>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 font-mono text-xs text-slate-400">
              Please choose a project to view availability controls.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
