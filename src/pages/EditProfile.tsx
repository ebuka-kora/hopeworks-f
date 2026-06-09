import React, { useState, useEffect, useRef } from 'react';
import { Reveal } from '../components/motion/Reveal';
import { useAuth } from '../context/AuthContext';
import { SDG_GOALS } from '../lib/sdg-data';
import { User, ClipboardList, Shield, ShieldCheck, Heart, Sparkles, Image } from 'lucide-react';
import { PillButton } from '../components/PillButton';

export function EditProfile() {
  const { user, updateProfile, uploadGovId } = useAuth();
  
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [skillsString, setSkillsString] = useState("");
  const [selectedSdgs, setSelectedSdgs] = useState<number[]>([]);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setLocation(user.location || "");
      setWebsite(user.website || "");
      setSkillsString(user.skills ? user.skills.join(', ') : "");
      setSelectedSdgs(user.sdgInterests || []);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center select-none font-mono text-slate-400">
        Please sign in to edit your profile credentials.
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const skillsParsed = skillsString.split(',').map(s => s.trim()).filter(Boolean);
      await updateProfile({
        name,
        bio,
        location,
        website,
        skills: skillsParsed,
        sdgInterests: selectedSdgs
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSdg = (num: number) => {
    if (selectedSdgs.includes(num)) {
      setSelectedSdgs(selectedSdgs.filter(n => n !== num));
    } else {
      setSelectedSdgs([...selectedSdgs, num]);
    }
  };

  const handleIdFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setUploadError('Please upload an image (JPEG, PNG, WebP, GIF) or PDF.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File must be 5MB or smaller.');
      return;
    }

    setUploadingId(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
      await uploadGovId(base64, file.name, file.type);
    } catch (err: unknown) {
      setUploadError((err as Error).message || 'Upload failed.');
    } finally {
      setUploadingId(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 select-none relative">
      
      <Reveal direction="up" className="space-y-1">
        <label className="text-[10px] font-mono text-[#059669] font-bold uppercase tracking-widest leading-none">Security Registry</label>
        <h1 className="text-3xl font-serif font-semibold text-slate-900 tracking-tight">Identity & Profile Preferences</h1>
        <p className="text-xs text-slate-500 max-w-xl">
          Customize your civic bio and link credentials. Upload identification below to secure high-trust crowdfunding parameters.
        </p>
      </Reveal>

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-xs font-mono text-emerald-800 rounded-xl text-center">
          ✓ Profile settings saved successfully! Simulating sandbox ledger updates.
        </div>
      )}

      <Reveal direction="bouncy" className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Col: Main parameters inputs */}
        <form onSubmit={handleSave} className="md:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 space-y-5 shadow-xs">
          <div className="flex gap-2 items-center pb-2 border-b border-slate-50">
            <ClipboardList className="h-5 w-5 text-[#059669]" />
            <h3 className="text-sm font-mono uppercase tracking-wider text-slate-800 font-semibold leading-none">Biodata Details</h3>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500 uppercase tracking-wide">Public Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 outline-none rounded-lg focus:border-[#059669]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 uppercase tracking-wide">Location coordinates</label>
                <input
                  type="text"
                  value={location}
                  placeholder="e.g. Bristol, UK"
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 outline-none rounded-lg focus:border-[#059669]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 uppercase tracking-wide">Civic Website / Organization Url</label>
                <input
                  type="text"
                  value={website}
                  placeholder="e.g. https://communitybuilt.org"
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 outline-none rounded-lg focus:border-[#059669]"
                />
              </div>
            </div>

            <div className="space-y-1 font-sans">
              <label className="block text-[11px] font-mono text-slate-500 uppercase tracking-wide">Detailed Biography</label>
              <textarea
                rows={3.5}
                placeholder="Share your passion for UN development parameters, project management abilities, or volunteering background..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-2.5 border border-slate-200 outline-none rounded-lg focus:border-[#059669] font-sans text-xs"
              />
            </div>

            <div className="space-y-1 font-mono">
              <label className="block text-[11px] text-slate-500 uppercase tracking-wide">Volunteer Skills list (Comma-separated)</label>
              <input
                type="text"
                placeholder="Construction, Project Coordination, Teaching, Plumbing"
                value={skillsString}
                onChange={(e) => setSkillsString(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 outline-none rounded-lg focus:border-[#059669]"
              />
            </div>

            {/* SDG targets horizontal lists */}
            <div className="space-y-2 font-sans pt-1">
              <label className="text-[11px] font-mono text-slate-500 uppercase tracking-wide block">Primary UN Goal Interests</label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SDG_GOALS.slice(0,10).map((goal) => {
                  const isSelected = selectedSdgs.includes(goal.number);
                  return (
                    <button
                      type="button"
                      key={goal.number}
                      onClick={() => handleToggleSdg(goal.number)}
                      className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all shrink-0 ${
                        isSelected
                          ? 'border-transparent text-white font-medium shadow-2xs font-mono text-[10px]'
                          : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-200'
                      }`}
                      style={isSelected ? { backgroundColor: goal.color } : {}}
                    >
                      <span>{goal.number}. {goal.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-right">
            <PillButton
              type="submit"
              variant="primary"
              caps={false}
              loading={saving}
              className="px-6 py-2 text-xs font-mono"
            >
              {saving ? 'Saving profile...' : 'Update Settings Bio'}
            </PillButton>
          </div>
        </form>

        {/* Right Col: Securer verification upload */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex gap-2 items-center pb-2 border-b border-slate-50">
            <Shield className="h-5 w-5 text-[#059669]" />
            <h3 className="text-sm font-mono uppercase tracking-wider text-slate-800 font-semibold leading-none">ID Audit Status</h3>
          </div>

          <div className="space-y-4">
            
            {/* Status indicators card */}
            <div className={`p-4 border rounded-xl space-y-2 font-mono text-xs ${
              user.verificationStatus === 'approved'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : user.verificationStatus === 'pending'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-800 animate-pulse'
                : 'bg-slate-50 border-slate-100 text-slate-500'
            }`}>
              <div className="flex justify-between items-baseline font-bold uppercase tracking-wider text-[10px]">
                <span>MUNICIPAL AUDIT STATUS:</span>
                <span>{user.verificationStatus.toUpperCase()}</span>
              </div>
              <p className="font-sans text-[11px] leading-relaxed pt-1 select-none">
                {user.verificationStatus === 'approved'
                  ? 'Awesome! Your identity has been verified by AIS Admin. You have full campaign creation boundaries active.'
                  : user.verificationStatus === 'pending'
                  ? 'Your Government Identification package is in the queue. AIS Admin Vince is actively auditing files.'
                  : 'Your profile has not yet completed identification audits. To initiate secure crowdfunding, upload docs below.'}
              </p>
            </div>

            {user.verificationStatus !== 'approved' && user.verificationStatus !== 'pending' && (
              <div className="space-y-3.5 select-none font-mono">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Government ID Upload</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleIdFileSelect}
                />
                <PillButton
                  type="button"
                  variant="outline"
                  caps={false}
                  onClick={() => fileInputRef.current?.click()}
                  loading={uploadingId}
                  className="w-full py-2.5 px-3 text-xs justify-between"
                >
                  <span>{uploadingId ? 'Uploading...' : 'Upload passport or government ID'}</span>
                  <Image className="h-4 w-4 text-slate-400" />
                </PillButton>
                {uploadError && (
                  <p className="text-[10px] text-red-600 bg-red-50 p-2 rounded-lg">{uploadError}</p>
                )}
                <p className="text-[10px] text-slate-400 font-sans">JPEG, PNG, WebP, GIF, or PDF up to 5MB.</p>
              </div>
            )}

            {user.govIdUrl && (
              <div className="space-y-1 select-none">
                <label className="text-[9px] font-mono text-slate-400 block font-bold uppercase tracking-widest">Active Document preview</label>
                <div className="bg-slate-100 rounded-lg p-2.5 border border-slate-200">
                  <img src={user.govIdUrl} alt="ID preview" referrerPolicy="no-referrer" className="w-full rounded" />
                </div>
              </div>
            )}

          </div>
        </div>

      </Reveal>

    </div>
  );
}
