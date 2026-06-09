import React, { useState, useRef } from 'react';
import { WizardStepMotion } from '../components/motion/WizardStep';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useProjectsStore } from '../hooks/useProjectsStore';
import { apiUpload } from '../lib/apiClient';
import { SDG_GOALS } from '../lib/sdg-data';
import { Check, ClipboardList, Target, Users, Calendar, ArrowRight, ArrowLeft, ImagePlus, X } from 'lucide-react';
import { PillButton } from '../components/PillButton';

const COVER_PRESETS = [
  { label: 'Plumbing & Pipes', url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Library & Education', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Marine Coral & Reef', url: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&q=80&w=1200' },
] as const;

const MAX_COVER_SIZE = 5 * 1024 * 1024;

interface CreateCampaignProps {
  onNavigate: (view: string, id?: string) => void;
}

export function CreateCampaign({ onNavigate }: CreateCampaignProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createCampaign } = useProjectsStore();

  const [step, setStep] = useState(1);
  const [stepDirection, setStepDirection] = useState<'forward' | 'backward'>('forward');

  const goToStep = (next: number, direction: 'forward' | 'backward' = 'forward') => {
    setStepDirection(direction);
    setStep(next);
  };
  const [error, setError] = useState("");
  const [launching, setLaunching] = useState(false);
  const coverFileRef = useRef<HTMLInputElement>(null);

  // Step 1: Basics
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSdgs, setSelectedSdgs] = useState<number[]>([]);
  const [category, setCategory] = useState("Water & Sanitation");
  const [coverUrl, setCoverUrl] = useState("");
  const [coverFileName, setCoverFileName] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverError, setCoverError] = useState("");

  // Step 2: Milestones
  const [m1Title, setM1Title] = useState("Stage 1 - Site Preparation & Excavation");
  const [m1Cost, setM1Cost] = useState(5000);
  const [m1Desc, setM1Desc] = useState("Digging foundations, sourcing sand/gravel, and reinforcing concrete structures.");

  const [m2Title, setM2Title] = useState("Stage 2 - Framing, Assembly & Pipeline Layout");
  const [m2Cost, setM2Cost] = useState(7000);
  const [m2Desc, setM2Desc] = useState("Plumbing connections, poly tank delivery, hoisting, and structural framework.");

  const [m3Title, setM3Title] = useState("Stage 3 - Solar Arrays Integration & Launch");
  const [m3Cost, setM3Cost] = useState(5000);
  const [m3Desc, setM3Desc] = useState("Wiring backup batteries, setting solar arrays, micro testing, and community workshops.");

  // Step 3: Volunteering
  const [volunteerCompensation, setVolunteerCompensation] = useState<'unpaid' | 'paid'>('unpaid');
  const [volunteerSlots, setVolunteerSlots] = useState(4);
  const [skillsRaw, setSkillsRaw] = useState("Construction, Heavy Lifting, Plumbing");
  const [datesRaw, setDatesRaw] = useState("2026-06-15, 2026-06-20");

  const totalFundingTarget = m1Cost + m2Cost + m3Cost;

  const handleCoverFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverError("");
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      setCoverError('Cover image must be JPEG, PNG, WebP, or GIF.');
      return;
    }
    if (file.size > MAX_COVER_SIZE) {
      setCoverError('Cover image must be 5MB or smaller.');
      return;
    }

    setUploadingCover(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
      const { url } = await apiUpload('covers', file.name, base64, file.type);
      setCoverUrl(url);
      setCoverFileName(file.name);
    } catch (err: unknown) {
      setCoverError((err as Error).message || 'Failed to upload cover image.');
    } finally {
      setUploadingCover(false);
      if (coverFileRef.current) coverFileRef.current.value = '';
    }
  };

  const clearCover = () => {
    setCoverUrl('');
    setCoverFileName('');
    setCoverError('');
    if (coverFileRef.current) coverFileRef.current.value = '';
  };

  const handleToggleSdg = (num: number) => {
    if (selectedSdgs.includes(num)) {
      setSelectedSdgs(selectedSdgs.filter(n => n !== num));
    } else {
      setSelectedSdgs([...selectedSdgs, num]);
    }
  };

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!title.trim() || !summary.trim() || !description.trim()) {
        setError("All text fields in the Project Basics stage are strictly required.");
        return;
      }
      if (selectedSdgs.length === 0) {
        setError("You must select at least one supporting UN SDG Goal indicator to align this project.");
        return;
      }
      if (!coverUrl.trim()) {
        setError("Upload a cover image or choose a stock image for your campaign.");
        return;
      }
    } else if (step === 2) {
      if (!m1Title.trim() || !m2Title.trim() || !m3Title.trim() || !m1Desc.trim() || !m2Desc.trim() || !m3Desc.trim()) {
        setError("All milestone titles and descriptions are required to define the secure audit trail.");
        return;
      }
      if (m1Cost <= 0 || m2Cost <= 0 || m3Cost <= 0) {
        setError("Milestone funding targets must be positive amounts ($).");
        return;
      }
    } else if (step === 3) {
      if (!skillsRaw.trim()) {
        setError("Please define at least one required skill set.");
        return;
      }
      if (!datesRaw.trim()) {
        setError("Please specify proposed action dates for volunteer recruitment shifts.");
        return;
      }
    }
    goToStep(step + 1, 'forward');
  };

  const handleLaunch = async () => {
    if (!user) return;
    setLaunching(true);
    try {
      const skillsParsed = skillsRaw.split(',').map(s => s.trim()).filter(Boolean);
      const datesParsed = datesRaw.split(',').map(s => s.trim()).filter(Boolean);

      const payload = {
        title: title.trim(),
        summary: summary.trim(),
        description: description.trim(),
        ownerId: user.id,
        ownerName: user.name,
        category,
        sdgs: selectedSdgs,
        fundingTarget: totalFundingTarget,
        coverUrl,
        status: 'pending' as const, // goes to pending for Admin approval
        volunteerSlots,
        volunteerCompensation,
        volunteerSkills: skillsParsed,
        volunteerDates: datesParsed,
        milestones: [
          { id: 'm1', title: m1Title, description: m1Desc, cost: m1Cost, status: 'pending' as const, evidenceUrls: [] },
          { id: 'm2', title: m2Title, description: m2Desc, cost: m2Cost, status: 'pending' as const, evidenceUrls: [] },
          { id: 'm3', title: m3Title, description: m3Desc, cost: m3Cost, status: 'pending' as const, evidenceUrls: [] },
        ]
      };

      const launched = await createCampaign(payload);
      toast.success(`Success! Campaign "${launched.title}" has been securely established on our public benefits sandbox ledger.`);
      onNavigate('project_detail', launched.id);
    } catch (e: any) {
      setError(e?.message || "Failed to launch campaign.");
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 select-none relative">
      
      {/* Visual top tracker bar */}
      <div className="grid grid-cols-4 gap-2 mb-10 select-none text-center font-mono text-[10px] text-slate-400">
        {[
          { label: 'Project Basics', num: 1 },
          { label: 'Milestone Costings', num: 2 },
          { label: 'Volunteer Assets', num: 3 },
          { label: 'Compliance review', num: 4 },
        ].map(item => (
          <div key={item.num} className="space-y-2">
            <div className={`h-1.5 w-full rounded-full transition-all duration-300 ${step >= item.num ? 'bg-emerald-600' : 'bg-slate-100'}`} />
            <span className={`${step === item.num ? 'text-slate-900 font-bold' : ''}`}>{item.label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3.5 mb-5 bg-rose-50 border border-rose-100 rounded-xl text-xs font-mono text-rose-700 leading-relaxed text-center">
          ⚠️ ValidationError: {error}
        </div>
      )}

      <div className="bg-white border border-slate-100 shadow-md rounded-2xl p-6 sm:p-8 space-y-6">
        <WizardStepMotion stepKey={String(step)} direction={stepDirection}>
        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Launch Workspace / Step 1</span>
              <h2 className="font-serif font-black text-xl text-slate-900">Define your Civic Campaign Basics</h2>
              <p className="text-xs text-slate-500">Provide an engaging title, short summary, and pick align SDGs.</p>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 uppercase tracking-wide">Project Goal Title</label>
                <input
                  type="text"
                  placeholder="e.g., Clean Water Reservoirs for Eldoret"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 outline-none rounded-lg focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 uppercase tracking-wide">Short summary pitch (Max 140 chars)</label>
                <input
                  type="text"
                  maxLength={140}
                  placeholder="Sanding and distributing study notebooks and solar-powered desks..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 outline-none rounded-lg focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1 font-sans">
                <label className="block text-[11px] font-mono text-slate-500 uppercase tracking-wide">Detailed Campaign Description</label>
                <textarea
                  rows={4}
                  placeholder="Describe your project, locations, community needs, ecological benefits, and who benefits..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-slate-200 outline-none rounded-lg focus:border-emerald-600 font-sans text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 uppercase tracking-wide">Campaign Sector Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 outline-none rounded-lg font-sans bg-white focus:border-emerald-600"
                >
                  <option value="Water & Sanitation">Water & Sanitation</option>
                  <option value="Solar Energy">Solar Energy</option>
                  <option value="Education Kits">Education Kits</option>
                  <option value="Conservation">Conservation</option>
                  <option value="Healthcare">Healthcare</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-slate-500 uppercase tracking-wide block">Campaign Cover Image</label>
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                  {coverUrl ? (
                    <div className="relative aspect-[21/9] bg-slate-100">
                      <img
                        src={coverUrl}
                        alt="Campaign cover preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={clearCover}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white border border-slate-200 rounded-lg text-slate-600 cursor-pointer"
                        title="Remove cover"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="aspect-[21/9] flex flex-col items-center justify-center gap-2 text-slate-400 px-4">
                      <ImagePlus className="h-8 w-8 text-slate-300" />
                      <p className="text-[11px] font-sans text-center">Upload a photo that represents your campaign on Explore and project pages.</p>
                    </div>
                  )}
                  <div className="p-3 border-t border-slate-200 bg-white space-y-2">
                    <input
                      ref={coverFileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleCoverFileSelect}
                    />
                    <PillButton
                      type="button"
                      variant="brand"
                      caps={false}
                      onClick={() => coverFileRef.current?.click()}
                      loading={uploadingCover}
                      className="w-full py-2 px-3 text-xs"
                    >
                      <ImagePlus className="h-3.5 w-3.5" />
                      {uploadingCover ? 'Uploading...' : coverUrl ? 'Replace image' : 'Upload cover image'}
                    </PillButton>
                    {coverFileName && (
                      <p className="text-[10px] text-slate-500 font-mono truncate">Uploaded: {coverFileName}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 shrink-0">Or use stock:</span>
                      <select
                        value={COVER_PRESETS.some((p) => p.url === coverUrl) ? coverUrl : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            setCoverUrl(e.target.value);
                            setCoverFileName('');
                            setCoverError('');
                          }
                        }}
                        className="flex-1 min-w-0 px-2 py-1.5 border border-slate-200 outline-none rounded-lg font-sans bg-white text-[11px] focus:border-emerald-600"
                      >
                        <option value="">Choose a stock image...</option>
                        {COVER_PRESETS.map((preset) => (
                          <option key={preset.url} value={preset.url}>{preset.label}</option>
                        ))}
                      </select>
                    </div>
                    {coverError && (
                      <p className="text-[10px] text-red-600 bg-red-50 p-2 rounded-lg">{coverError}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-slate-500 uppercase tracking-wide block">Align Sustainable Development Goals (SDGs)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-sans">
                  {SDG_GOALS.slice(0, 15).map((goal) => {
                    const isSelected = selectedSdgs.includes(goal.number);
                    return (
                      <button
                        type="button"
                        key={goal.number}
                        onClick={() => handleToggleSdg(goal.number)}
                        className={`p-2.5 rounded-lg border text-left text-xs flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'bg-slate-950 text-white border-slate-950 font-medium'
                            : 'bg-slate-50 border-slate-100 hover:border-slate-200 font-mono text-[11px]'
                        }`}
                      >
                        <div 
                          className="h-5 w-5 rounded flex items-center justify-center font-bold text-white shrink-0"
                          style={{ backgroundColor: goal.color }}
                        >
                          {goal.number}
                        </div>
                        <span className="truncate">{goal.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: MILESTONES (EXACTLY 3 Sequential blocks to enforce rule) */}
        {step === 2 && (
          <div className="space-y-5 text-xs font-mono">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase tracking-widest">Launch Workspace / Step 2</span>
              <h2 className="font-serif font-semibold text-xl text-slate-900 leading-none">Declare 3 Sequential Audit Milestones</h2>
              <p className="text-xs text-slate-500 leading-snug">To enforce transparency, all fundraising is split into 3 verified evidence milestones. Escrow is released sequential on audits only.</p>
            </div>

            <div className="space-y-5">
              
              {/* Milestone 1 */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-semibold text-slate-800 text-[11px] uppercase text-emerald-700">Milestone Stage 1 (Initial Setup)</h4>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span>Est Cost: $</span>
                    <input
                      type="number"
                      value={m1Cost}
                      onChange={(e) => setM1Cost(parseInt(e.target.value) || 0)}
                      className="w-16 px-1.5 py-0.5 border border-slate-200 bg-white rounded outline-none"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Stage 1 Title"
                  value={m1Title}
                  onChange={(e) => setM1Title(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded outline-none"
                />
                <textarea
                  rows={2}
                  placeholder="Describe evidence needed (drawings, excavations, materials invoices)..."
                  value={m1Desc}
                  onChange={(e) => setM1Desc(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded outline-none font-sans"
                />
              </div>

              {/* Milestone 2 */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-semibold text-slate-800 text-[11px] uppercase text-emerald-700">Milestone Stage 2 (Physical Construction)</h4>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span>Est Cost: $</span>
                    <input
                      type="number"
                      value={m2Cost}
                      onChange={(e) => setM2Cost(parseInt(e.target.value) || 0)}
                      className="w-16 px-1.5 py-0.5 border border-slate-200 bg-white rounded outline-none"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  value={m2Title}
                  onChange={(e) => setM2Title(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded outline-none"
                />
                <textarea
                  rows={2}
                  placeholder="Describe evidence needed (engineering inspection photos, tank assembly proofs)..."
                  value={m2Desc}
                  onChange={(e) => setM2Desc(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded outline-none font-sans"
                />
              </div>

              {/* Milestone 3 */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-semibold text-slate-800 text-[11px] uppercase text-emerald-700">Milestone Stage 3 (Piping & Operational Safety Audit)</h4>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span>Est Cost: $</span>
                    <input
                      type="number"
                      value={m3Cost}
                      onChange={(e) => setM3Cost(parseInt(e.target.value) || 0)}
                      className="w-16 px-1.5 py-0.5 border border-slate-200 bg-white rounded outline-none"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  value={m3Title}
                  onChange={(e) => setM3Title(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded outline-none"
                />
                <textarea
                  rows={2}
                  placeholder="Describe evidence needed (pressure QA results, safety workshops signatures, solar pump active photos)..."
                  value={m3Desc}
                  onChange={(e) => setM3Desc(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded outline-none font-sans"
                />
              </div>

              <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-right">
                <span className="font-mono text-xs uppercase text-slate-400">Campaign Target Secured on launch:</span>
                <p className="font-serif font-black text-2xl text-slate-800 italic mt-1">${totalFundingTarget.toLocaleString()} USD</p>
              </div>

            </div>
          </div>
        )}

        {/* STEP 3: RECRUITMENT */}
        {step === 3 && (
          <div className="space-y-5 text-xs font-mono">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase tracking-widest">Launch Workspace / Step 3</span>
              <h2 className="font-serif font-semibold text-xl text-slate-900 leading-none">Declare Volunteer Recruitment Parameters</h2>
              <p className="text-xs text-slate-500 leading-snug">Let community volunteers understand required shifts.</p>
            </div>

            <div className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500 uppercase tracking-wide">Volunteer Compensation model</label>
                  <select
                    value={volunteerCompensation}
                    onChange={(e) => setVolunteerCompensation(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 outline-none rounded-lg bg-white"
                  >
                    <option value="unpaid">Gift / Unpaid Volunteering</option>
                    <option value="paid">Pre-allocated Paid Shift Compensation</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500 uppercase tracking-wide">Slot limit capacity</label>
                  <input
                    type="number"
                    value={volunteerSlots}
                    onChange={(e) => setVolunteerSlots(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-200 outline-none rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 uppercase tracking-wide block">Required Assets / Skills (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="Construction, Heavy Lifting, Water QA, Teaching, Logistics..."
                  value={skillsRaw}
                  onChange={(e) => setSkillsRaw(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 outline-none rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 uppercase tracking-wide block">Action Dates proposed (YYYY-MM-DD, comma-separated)</label>
                <input
                  type="text"
                  placeholder="2026-06-15, 2026-06-20"
                  value={datesRaw}
                  onChange={(e) => setDatesRaw(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 outline-none rounded-lg"
                />
              </div>

            </div>
          </div>
        )}

        {/* STEP 4: MANDATORY COMPLIANCE DECLARATION & REVIEW */}
        {step === 4 && (
          <div className="space-y-5 text-xs font-mono">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase tracking-widest">Final Review / Step 4</span>
              <h2 className="font-serif font-semibold text-xl text-slate-900 leading-none">Declare Compliance & Launch for Review</h2>
              <p className="text-xs text-slate-500 leading-snug">Review your configuration carefully to match UN goals.</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
              {coverUrl && (
                <div className="rounded-lg overflow-hidden border border-slate-200 aspect-[21/9] max-h-36">
                  <img src={coverUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-slate-400">CAMPAIGN TITLE:</h4>
                  <p className="font-bold text-slate-800 truncate">{title}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-400">FUNDING SECURED ON LAUNCH ($):</h4>
                  <p className="font-bold text-slate-800">${totalFundingTarget.toLocaleString()} USD</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-slate-400">RECRUITMENT SHIFTS CAPACITY:</h4>
                  <p className="font-bold text-slate-800">{volunteerSlots} Slots ({volunteerCompensation})</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-400">UN SDG MATRIX ALIGNED:</h4>
                  <p className="font-bold text-slate-800">{selectedSdgs.join(', ')}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-100/60 rounded-xl text-slate-700 space-y-3 font-sans">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 leading-none">Compliance & Escrow Clause</h4>
              <p className="text-[11px] leading-relaxed">
                By clicking launch, you declare that all milestones are sequential and align with local bylaws. The campaign will enter "Pending Admin review" status. Only pre-screened campaigns are authorized to securely lock escrow funds.
              </p>
            </div>

          </div>
        )}
        </WizardStepMotion>

        {/* WORKSPACE NAVIGATION BOTTOM */}
        <div className="border-t border-slate-100 mt-6 pt-5 flex justify-between items-center gap-3 select-none font-sans text-xs font-semibold">
          {step > 1 ? (
            <PillButton
              type="button"
              variant="muted"
              caps={false}
              onClick={() => goToStep(step - 1, 'backward')}
              className="py-2.5 px-5 text-xs"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              Back
            </PillButton>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <PillButton
              type="button"
              variant="brand"
              caps={false}
              onClick={handleNext}
              className="py-2.5 px-6 text-xs shadow-sm ml-auto"
            >
              Next
              <ArrowRight className="h-4 w-4 shrink-0" />
            </PillButton>
          ) : (
            <PillButton
              type="button"
              variant="brand"
              caps={false}
              onClick={handleLaunch}
              loading={launching}
              loadingMessage="Launching campaign"
              className="py-2.5 px-6 text-xs shadow-sm ml-auto"
            >
              {launching ? 'Launching campaign...' : 'Launch campaign & Submit for Review'}
            </PillButton>
          )}
        </div>

      </div>

    </div>
  );
}
