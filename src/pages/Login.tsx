import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WizardStepMotion } from '../components/motion/WizardStep';
import { springBouncy } from '../lib/motion';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Logo } from '../components/Logo';
import { PillButton } from '../components/PillButton';
import { PasswordInput } from '../components/PasswordInput';
import { useLoadingOverlay } from '../context/LoadingOverlayContext';
// @ts-ignore
import boyHospitalSmile from '../assets/images/boy_hospital_smile_1780656337127.png';
// @ts-ignore
import girlHopeSprout from '../assets/images/girl_hope_sprout_1780660232833.png';
import {   ShieldCheck, 
  ArrowRight, 
  KeyRound, 
  Mail, 
  User, 
  Lock, 
  Sparkles, 
  AlertCircle, 
  Check, 
  ChevronLeft,
  Home,
  Globe, 
  HelpCircle,
  PiggyBank,
  Heart,
  Users,
  Award,
  Layers,
  Laptop
} from 'lucide-react';

interface LoginProps {
  mode?: 'login' | 'register';
  onNavigate: (view: string) => void;
  preselectedRoles?: UserRole[];
  redirectAfterAuth?: string;
}

type WizardStep = 
  | 'welcome' 
  | 'password' 
  | 'signup_step1' // target location + category (zip, country, category)
  | 'signup_step4' // assign civic roles (entrepreneur, volunteer, donor)
  | 'signup_step5'; // final legal name + email + security password

export function Login({
  mode = 'login',
  onNavigate,
  preselectedRoles,
  redirectAfterAuth,
}: LoginProps) {
  const { login, signUp, loginSimulatedUser } = useAuth();
  const loadingOverlay = useLoadingOverlay();
  
  // Choose wizard initial view
  const [wizardStep, setWizardStep] = useState<WizardStep>(mode === 'register' ? 'signup_step4' : 'welcome');
  const [wizardDirection, setWizardDirection] = useState<'forward' | 'backward'>('forward');

  const goToWizardStep = (step: WizardStep, direction: 'forward' | 'backward' = 'forward') => {
    setWizardDirection(direction);
    setWizardStep(step);
  };
  
  // Inputs & selections
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [roles, setRoles] = useState<UserRole[]>([]);

  // Onboarding specific attributes (GoFundMe style)
  const [country, setCountry] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [fundraisingCategories, setFundraisingCategories] = useState<string[]>([]);
  // Status indicators
  const [validationError, setValidationError] = useState("");
  const [loading, setLoading] = useState(false);

  const isProjectOwnerSignup = roles.includes('entrepreneur');
  const signupStepCount = isProjectOwnerSignup ? 3 : 2;

  // Sync state if register mode / preselected roles change externally
  useEffect(() => {
    if (mode === 'register') {
      goToWizardStep('signup_step4', 'forward');
      setRoles(preselectedRoles?.length ? [preselectedRoles[0]] : []);
    } else {
      goToWizardStep('welcome', 'backward');
      setRoles([]);
    }
  }, [mode, preselectedRoles]);

  // Categories list (identical to mockup)
  const categories = [
    'Animals', 'Business', 'Community', 'Competitions', 'Creative', 
    'Education', 'Emergencies', 'Environment', 'Events', 'Faith', 
    'Family', 'Funerals & Memorials', 'Medical', 'Monthly Bills', 
    'Newlyweds', 'Other', 'Sports', 'Travel', 'Ukraine Relief', 
    'Volunteer', 'Wishes'
  ];

  // Helper check for sandbox user logs
  const handleSimulatedClick = async (simId: string) => {
    setValidationError("");
    loadingOverlay?.showLoading('Signing in');
    try {
      await loginSimulatedUser(simId);
      onNavigate('dashboard');
    } catch (err: unknown) {
      setValidationError(err instanceof Error ? err.message : 'Demo login failed.');
    } finally {
      loadingOverlay?.hideLoading();
    }
  };

  // Step transitions & validations
  const handleWelcomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    
    if (!email) {
      setValidationError("Please specify an email address.");
      return;
    }

    // Always go to password step — users list is admin-only and empty for guests
    goToWizardStep('password', 'forward');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setLoading(true);
    
    try {
      await login(email, password);
      onNavigate(redirectAfterAuth || 'dashboard');
    } catch (err: any) {
      setValidationError(err.message || "Invalid account password.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    
    if (!email.trim()) {
      setValidationError("Email address is required.");
      return;
    }
    if (!name.trim()) {
      setValidationError("Legal name is required.");
      return;
    }
    if (password.length < 5) {
      setValidationError("Access password must be at least 5 characters.");
      return;
    }
    if (roles.length === 0) {
      setValidationError("At least one civic role must be configured.");
      return;
    }

    setLoading(true);
    try {
      const profileExtras = isProjectOwnerSignup
        ? {
            location: `${zipCode.trim()}, ${country}`,
            fundraisingCategories,
          }
        : undefined;
      await signUp(email, name, roles, password, profileExtras);
      onNavigate(redirectAfterAuth || 'dashboard');
    } catch (err: any) {
      setValidationError(err.message || "An error occurred during verification.");
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (role: UserRole) => {
    if (roles.includes(role)) {
      setRoles([]);
      if (role === 'entrepreneur') {
        setCountry('');
        setZipCode('');
        setFundraisingCategories([]);
      }
    } else {
      setRoles([role]);
      if (role !== 'entrepreneur') {
        setCountry('');
        setZipCode('');
        setFundraisingCategories([]);
      }
      setValidationError("");
    }
  };

  const toggleFundraisingCategory = (cat: string) => {
    setFundraisingCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    setValidationError("");
  };

  const handleStep1Continue = () => {
    if (!country) {
      setValidationError("Please select your country to continue.");
      return;
    }
    if (!zipCode.trim()) {
      setValidationError("Please specify your zip code to continue.");
      return;
    }
    if (fundraisingCategories.length === 0) {
      setValidationError("Please select at least one reason you are fundraising to continue.");
      return;
    }
    setValidationError("");
    goToWizardStep('signup_step5', 'forward');
  };

  const handleStep4Continue = () => {
    if (roles.length === 0) {
      setValidationError("Please configure at least one civic role to continue your registration.");
      return;
    }
    setValidationError("");
    goToWizardStep(isProjectOwnerSignup ? 'signup_step1' : 'signup_step5', 'forward');
  };

  const getProgressPercent = () => {
    if (isProjectOwnerSignup) {
      switch (wizardStep) {
        case 'signup_step4': return 33;
        case 'signup_step1': return 66;
        case 'signup_step5': return 100;
        default: return 0;
      }
    }
    switch (wizardStep) {
      case 'signup_step4': return 50;
      case 'signup_step5': return 100;
      default: return 0;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[#F8F9FA] grid grid-cols-1 lg:grid-cols-12 select-none font-sans">

      {/* LEFT COLUMN: THE GORGEOUS GOFUNDME-INSPIRED DYNAMIC WIZARD (Centered & compact for zoomed out feel) */}
      <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-10 md:p-12 bg-white shrink-0 relative">
        
        {/* PROGRESS INDICATOR BAR AT TIMELINE */}
        {wizardStep.startsWith('signup_step') && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100">
            <div 
              className="h-full bg-emerald-700 transition-all duration-300" 
              style={{ width: `${getProgressPercent()}%` }}
            />
          </div>
        )}

        {/* TOP SHELF META - Title & Switcher bar */}
        <div className="flex items-center justify-between mb-6 gap-3">
          <div 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 cursor-pointer group hover:opacity-90 transition-opacity min-w-0"
            title="Return to Home"
          >
            <Logo iconSize={30} showText={true} />
            <span className="text-[10px] font-mono tracking-widest text-[#B24724] font-black uppercase border-l border-slate-200 pl-2.5 hidden sm:inline-block">
              Connection Gateway
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {wizardStep !== 'welcome' && wizardStep !== 'signup_step4' && (
              <PillButton
                variant="muted"
                caps={false}
                onClick={() => {
                  setValidationError("");
                  if (wizardStep === 'password') goToWizardStep('welcome', 'backward');
                  else if (wizardStep === 'signup_step1') goToWizardStep('signup_step4', 'backward');
                  else if (wizardStep === 'signup_step5') {
                    goToWizardStep(isProjectOwnerSignup ? 'signup_step1' : 'signup_step4', 'backward');
                  }
                }}
                className="py-1.5 px-3 text-[11px]"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Back
              </PillButton>
            )}
            <PillButton
              variant="muted"
              caps={false}
              onClick={() => {
                setValidationError("");
                onNavigate('home');
              }}
              className="py-1.5 px-3 text-[11px]"
              title="Back to landing page"
            >
              <Home className="h-3.5 w-3.5" />
              Home
            </PillButton>
          </div>
        </div>

        {/* ERROR BOX TRAY */}
        <AnimatePresence>
          {validationError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={springBouncy}
              className="mb-5 p-3.5 bg-rose-50 border border-rose-100 text-xs text-rose-800 rounded-xl flex items-center gap-2.5 line-clamp-2"
            >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 animate-pulse" />
            <span className="font-semibold leading-relaxed">{validationError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <WizardStepMotion
          stepKey={wizardStep}
          direction={wizardDirection}
          className="flex-grow flex flex-col justify-center max-w-lg w-full mx-auto py-2"
        >
          
          {/* STEP: WELCOME INSPIRED BY GFM MOCKUP */}
          {wizardStep === 'welcome' && (
            <div className="space-y-6">
              <div className="space-y-2 text-center sm:text-left">
                <h2 className="text-3xl font-serif font-black text-slate-900 tracking-tight">
                  Welcome
                </h2>
                <p className="text-xs text-slate-500 font-normal">
                  Sign in to HopeWorks or sign up to continue.
                </p>
              </div>

              {/* Social sign-in — coming soon */}
              <div className="space-y-2.5">
                {[
                  {
                    label: 'Sign in with Google',
                    icon: (
                      <svg className="h-4.5 w-4.5 shrink-0 opacity-50" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.227C18.29.98 15.54 0 12.24 0 5.58 0 .24 5.34.24 12s5.34 12 12 12c6.958 0 11.57-4.89 11.57-11.79 0-.795-.085-1.4-.19-1.925H12.24z"/>
                      </svg>
                    ),
                  },
                  {
                    label: 'Continue with Apple',
                    icon: (
                      <svg className="h-4.5 w-4.5 shrink-0 opacity-50" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.1 16.67C20.08 16.74 19.67 18.11 18.71 19.5M15.97 4.17C16.63 3.37 17.07 2.28 16.95 1C15.85 1.04 14.51 1.73 13.73 2.64C13.07 3.41 12.49 4.52 12.64 5.78C13.87 5.87 15.12 5.17 15.97 4.17Z" />
                      </svg>
                    ),
                  },
                ].map((provider) => (
                  <button
                    key={provider.label}
                    type="button"
                    disabled
                    aria-disabled="true"
                    title="Coming soon"
                    className="w-full py-2.5 px-4 border border-slate-200 rounded-full text-xs text-slate-400 bg-slate-50/80 cursor-not-allowed flex items-center justify-between shadow-sm"
                  >
                    <span className="flex items-center gap-2.5">
                      {provider.icon}
                      <span>{provider.label}</span>
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                      Coming soon
                    </span>
                  </button>
                ))}
              </div>

              {/* Separator style */}
              <div className="flex items-center gap-3 text-[10px] font-mono font-bold text-slate-300 uppercase select-none">
                <div className="h-px bg-slate-200 flex-grow" />
                <span>or</span>
                <div className="h-px bg-slate-200 flex-grow" />
              </div>

              {/* Email selector */}
              <form onSubmit={handleWelcomeSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-sans text-slate-500 font-bold uppercase tracking-wider block leading-none">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E.g. donor@hopeworks.app"
                    className="w-full py-3 px-3.5 border border-slate-200 outline-none rounded-xl focus:border-emerald-700 text-xs transition-all shadow-sm placeholder:text-slate-300 bg-[#FCFBF7]/30"
                  />
                </div>

                <PillButton
                  type="submit"
                  className="w-full py-3 cursor-pointer shadow-sm hover:shadow-md border-slate-200 text-xs"
                  baseColor="transparent"
                  textColor="#334155"
                  pillColor="#B24724"
                  hoveredTextColor="#ffffff"
                  Icon={ArrowRight}
                >
                  Continue
                </PillButton>
              </form>

              <div className="text-center pt-1 select-none">
                <button
                  type="button"
                  onClick={() => {
                    setValidationError("");
                    goToWizardStep('signup_step4', 'forward');
                  }}
                  className="text-xs text-slate-500 font-medium hover:text-[#B24724] hover:underline cursor-pointer transition-colors"
                >
                  Don't have an account? <span className="font-bold text-[#B24724]">Sign Up</span>
                </button>
              </div>
            </div>
          )}

          {/* PASSWORD SIGN IN ROUTE */}
          {wizardStep === 'password' && (
            <div className="space-y-6">
              <div className="space-y-1.5 select-none">
                <h2 className="text-3xl font-serif font-black text-slate-900 tracking-tight leading-none">
                  Authorize Credentials
                </h2>
                <div className="text-xs text-slate-400">
                  Securely logging in as: <span className="font-mono text-emerald-800 font-bold">{email}</span>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                    Password
                  </label>
                  <PasswordInput
                    required
                    autoFocus
                    placeholder="e.g. donor123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full py-3 px-4 border border-slate-200 outline-none rounded-xl focus:border-orange-600 font-sans text-sm transition-colors shadow-sm"
                  />
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => onNavigate('forgot_password')}
                      className="text-[11px] font-mono text-[#B24724] hover:underline cursor-pointer"
                    >
                      Forgot your password?
                    </button>
                  </div>
                </div>

                <PillButton
                  type="submit"
                  loading={loading}
                  loadingMessage="Signing in"
                  className="w-full py-3.5 cursor-pointer shadow-sm hover:shadow-md border-slate-200"
                  baseColor="transparent"
                  textColor="#334155"
                  pillColor="#B24724"
                  hoveredTextColor="#ffffff"
                  Icon={ArrowRight}
                >
                  {loading ? 'Signing in...' : 'Sign In To Terminal'}
                </PillButton>
              </form>

              <div className="text-center pt-1 select-none">
                <button
                  type="button"
                  onClick={() => {
                    setValidationError("");
                    goToWizardStep('signup_step4', 'forward');
                  }}
                  className="text-xs text-slate-500 font-medium hover:text-[#B24724] hover:underline cursor-pointer transition-colors"
                >
                  Don't have an account? <span className="font-bold text-[#B24724]">Sign Up</span>
                </button>
              </div>
              
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-[10px] text-slate-500 space-y-1 leading-normal">
                <strong className="text-slate-700">Need a sandbox bypass?</strong> Use passwords: <strong className="text-orange-600 font-mono">donor123</strong>, <strong className="text-orange-600 font-mono font-semibold">vol123</strong>, or <strong className="text-orange-600 font-mono">owner123</strong> to enter pre-modeled profiles instantly.
              </div>
            </div>
          )}

          {/* SIGN UP STEP 1: JOURNEY LOCATION & CATEGORY */}
          {wizardStep === 'signup_step1' && (
            <div className="space-y-6 block">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-emerald-700 uppercase font-black tracking-widest block">
                  Step 2 of {signupStepCount}
                </span>
                <h3 className="text-2xl font-serif font-black text-slate-950 tracking-tight">
                  Let's begin your fundraising journey
                </h3>
                <p className="text-xs text-slate-400">
                  We're here to guide you every step of the way.
                </p>
              </div>

              {/* Form elements */}
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-sans text-slate-500 font-bold uppercase tracking-wider block">
                      Country
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full p-3 border border-slate-200 outline-none rounded-xl bg-white text-xs font-semibold text-slate-700 cursor-pointer shadow-sm hover:border-slate-300"
                    >
                      <option value="" disabled>Select Country</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="Kenya">Kenya</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-sans text-slate-500 font-bold uppercase tracking-wider block">
                      Zip code
                    </label>
                    <input
                      type="text"
                      required
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="e.g. 99950"
                      className="w-full p-3 border border-slate-200 outline-none rounded-xl text-xs font-mono font-bold text-slate-700 shadow-sm focus:border-emerald-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-sans text-slate-500 font-bold uppercase tracking-wider block">
                    What best describes why you're fundraising?
                  </label>
                  <p className="text-[10px] text-slate-400 font-sans">
                    Select all that apply ({fundraisingCategories.length} selected)
                  </p>
                  
                  {/* CATEGORIES GRID PILLS */}
                  <div className="flex flex-wrap gap-2 pt-1 max-h-[200px] overflow-y-auto p-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                    {categories.map((cat) => {
                      const isSelected = fundraisingCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleFundraisingCategory(cat)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-sans font-bold transition-all border cursor-pointer ${
                            isSelected 
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="pt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setValidationError("");
                    goToWizardStep('welcome', 'backward');
                  }}
                  className="text-xs text-slate-500 font-medium hover:text-[#B24724] hover:underline cursor-pointer transition-colors text-center sm:text-left"
                >
                  Already have an account? <span className="font-bold text-[#B24724]">Sign In</span>
                </button>
                <PillButton
                  type="button"
                  onClick={handleStep1Continue}
                  className="w-full sm:w-auto px-6 py-2.5 cursor-pointer shadow-sm border-slate-200 shrink-0"
                  baseColor="transparent"
                  textColor="#334155"
                  pillColor="#B24724"
                  hoveredTextColor="#ffffff"
                >
                  Continue
                </PillButton>
              </div>
            </div>
          )}

          {/* SIGN UP STEP 4: ASSIGN HOPEWORKS CIVIC ROLES */}
          {wizardStep === 'signup_step4' && (
            <div className="space-y-5 block">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-emerald-700 uppercase font-black tracking-widest block">
                  Step 1 of {signupStepCount}
                </span>
                <h3 className="text-2xl font-serif font-black text-slate-950 tracking-tight">
                  Assign your citizen roles
                </h3>
                <p className="text-xs text-slate-400">
                  Choose one citizen role for your HopeWorks profile.
                </p>
              </div>

              {/* Selector grid of the three roles */}
              <div className="grid grid-cols-1 gap-4">
                {[
                  {
                    id: 'entrepreneur',
                    title: 'Project Owner',
                    abbr: 'PO',
                    desc: 'Runs accountable, milestone-based campaigns and recruits volunteers.',
                    badge: 'PO',
                    activeColor: 'border-[#0B4F35] bg-[#0B4F35]/5',
                    badgeBg: 'bg-[#0B4F35] text-white',
                    themeColor: 'text-[#0B4F35]'
                  },
                  {
                    id: 'donor',
                    title: 'Donor / Sponsor',
                    abbr: 'DO',
                    desc: 'Funds work they can verify, with a full ledger from contribution to delivery.',
                    badge: 'DO',
                    activeColor: 'border-[#A9441B] bg-[#A9441B]/5',
                    badgeBg: 'bg-[#A9441B] text-white',
                    themeColor: 'text-[#A9441B]'
                  },
                  {
                    id: 'volunteer',
                    title: 'Volunteer',
                    abbr: 'VO',
                    desc: 'Contributes time + skills, sets availability, earns verified recognition.',
                    badge: 'VO',
                    activeColor: 'border-[#133863] bg-[#133863]/5',
                    badgeBg: 'bg-[#133863] text-white',
                    themeColor: 'text-[#133863]'
                  }
                ].map((opt) => {
                  const isChecked = roles.includes(opt.id as any);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleRole(opt.id as any)}
                      className={`w-full text-left p-4.5 rounded-2xl border transition-all duration-200 flex items-start gap-4 cursor-pointer hover:shadow-xs ${
                        isChecked 
                          ? `${opt.activeColor} shadow-sm scale-[1.01] border-2` 
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      {/* Left: Round circle icon puck matching uploaded design */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-black text-sm shrink-0 shadow-xs select-none ${opt.badgeBg}`}>
                        {opt.badge}
                      </div>

                      {/* Middle: Title & Text */}
                      <div className="space-y-1 flex-grow pr-2">
                        <div className="flex items-center gap-2">
                          <span className="block text-sm font-serif font-black text-slate-900">{opt.title}</span>
                          {isChecked && (
                            <span className={`text-[8px] font-mono uppercase px-1.5 py-0.2 rounded font-black tracking-wider bg-slate-100 ${opt.themeColor}`}>
                              Selected
                            </span>
                          )}
                        </div>
                        <span className="block text-[11px] text-slate-500 leading-normal font-sans tracking-wide">
                          {opt.desc}
                        </span>
                      </div>

                      {/* Right: Circle Radio state representation */}
                      <div className="ml-auto shrink-0 select-none pt-1">
                        <span className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                          isChecked 
                            ? `border-slate-800 bg-slate-900 text-white` 
                            : 'border-slate-200 bg-transparent'
                        }`}>
                          {isChecked && <Check className="h-3 w-3 stroke-[3.5]" />}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* ACTION FOOTER */}
              <div className="pt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setValidationError("");
                    goToWizardStep('welcome', 'backward');
                  }}
                  className="text-xs text-slate-500 font-medium hover:text-[#B24724] hover:underline cursor-pointer transition-colors text-center sm:text-left"
                >
                  Already have an account? <span className="font-bold text-[#B24724]">Sign In</span>
                </button>
                <PillButton
                  type="button"
                  onClick={handleStep4Continue}
                  className="w-full sm:w-auto px-6 py-2.5 cursor-pointer shadow-sm border-slate-200 shrink-0"
                  baseColor="transparent"
                  textColor="#334155"
                  pillColor="#B24724"
                  hoveredTextColor="#ffffff"
                >
                  Continue
                </PillButton>
              </div>
            </div>
          )}

          {/* SIGN UP STEP 5: NAMING AND PASSWORD */}
          {wizardStep === 'signup_step5' && (
            <div className="space-y-6 block">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-emerald-700 uppercase font-black tracking-widest block">
                  Step {signupStepCount} of {signupStepCount}
                </span>
                <h3 className="text-2xl font-serif font-black text-slate-950 tracking-tight">
                  Finalize your account
                </h3>
                <p className="text-xs text-slate-400">
                  Complete your safe, auditable profile to join HopeWorks.
                </p>
              </div>

              <form onSubmit={handleRegistrationSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-sans text-slate-500 font-bold uppercase tracking-wider block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full p-3.5 border border-slate-200 outline-none rounded-xl focus:border-emerald-750 text-sm shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-sans text-slate-500 font-bold uppercase tracking-wider block">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Harrison Eldo"
                    className="w-full p-3.5 border border-slate-200 outline-none rounded-xl focus:border-emerald-750 text-sm shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-sans text-slate-500 font-bold uppercase tracking-wider block">
                    Choose a secure account password
                  </label>
                  <PasswordInput
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 5 characters"
                    className="w-full p-3.5 border border-slate-200 outline-none rounded-xl focus:border-emerald-750 text-sm shadow-sm"
                  />
                </div>

                {/* Submit button */}
                <PillButton
                  type="submit"
                  loading={loading}
                  loadingMessage="Creating account"
                  className="w-full mt-4 py-3.5 cursor-pointer shadow-sm hover:shadow-md border-slate-200"
                  baseColor="transparent"
                  textColor="#334155"
                  pillColor="#B24724"
                  hoveredTextColor="#ffffff"
                >
                  {loading ? 'Creating your account...' : 'Complete Registration & Launch'}
                </PillButton>
              </form>

              <div className="text-center pt-3 select-none">
                <button
                  type="button"
                  onClick={() => {
                    setValidationError("");
                    goToWizardStep('welcome', 'backward');
                  }}
                  className="text-xs text-slate-500 font-medium hover:text-[#B24724] hover:underline cursor-pointer transition-colors"
                >
                  Already have an account? <span className="font-bold text-[#B24724]">Sign In</span>
                </button>
              </div>
            </div>
          )}

        </WizardStepMotion>

        {/* BOTTOM QUICK SANDBOX ROLE SWITCHER (Fidelity Bypass Footer - Rendered perpetually for exact size/height symmetry) */}
        <div className="pt-6 border-t border-slate-100 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mt-8">
          <div className="space-y-0.5 shrink-0">
            <span className="text-[9.5px] font-sans font-bold uppercase tracking-wider text-slate-700 block select-none">
              {wizardStep === 'welcome' ? 'Sandbox Role Switcher' : 'Secure Sandbox Gateway'}
            </span>
            <span className="text-[9px] text-slate-400 block leading-tight select-none">
              {wizardStep === 'welcome' 
                ? 'Instantly jump into simulated active profiles here:' 
                : 'Bypass or transition into simulation profiles:'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 w-full lg:flex lg:flex-wrap lg:w-auto lg:justify-end">
            {([
              { key: 'user-donor', label: 'Donor' },
              { key: 'user-volunteer', label: 'Volunteer' },
              { key: 'user-owner', label: 'Owner' },
              { key: 'user-pm', label: 'PM' },
              { key: 'user-admin', label: 'Admin' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleSimulatedClick(key)}
                className={`py-2.5 lg:py-1 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[9px] font-mono font-bold border border-slate-200/60 text-center cursor-pointer select-none transition-all w-full lg:w-auto ${
                  key === 'user-admin'
                    ? 'col-span-2 w-1/2 justify-self-center lg:col-span-1 lg:w-auto lg:justify-self-auto'
                    : ''
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: BEAUTIFUL HELPING HANDS HIGH CONTRAST COVER T TREATMENT */}
      <div className="hidden lg:block lg:col-span-6 relative overflow-hidden select-none bg-slate-950">
        
        {/* Photo layer utilizing optimal fit */}
        <div className="absolute inset-0 z-0">
          <img
            src={wizardStep.startsWith('signup') ? girlHopeSprout : boyHospitalSmile}
            alt={wizardStep.startsWith('signup') ? "Smiling girl in sunlit room holding green hope sprout" : "Smiling boy in hospital with head bandage researching cure"}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center brightness-110 opacity-90 transition-opacity duration-700"
          />
          {/* Transparent color overlays for soft branding match */}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-emerald-900/30 to-black/40 mix-blend-multiply" />
        </div>

        {/* Ambient floating blurred light balls */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-tr from-emerald-500/15 over-orange-500/10 rounded-full filter blur-3xl opacity-60 animate-pulse z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-br from-sky-400/20 to-emerald-600/10 rounded-full filter blur-3xl opacity-50 animate-pulse z-10" />

        {/* Content Badge/Overlay explaining HopeWorks system */}
        <div className="absolute bottom-8 left-8 right-8 bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 z-20 space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[9px] uppercase tracking-widest font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>UN SDG ESCROW TECHNOLOGY</span>
          </div>
          <h4 className="text-white font-serif italic text-lg leading-snug font-bold">
            "We fund transparent campaigns matched to UN development milestones, backed by verified third-party PM auditors."
          </h4>
          <span className="block text-[9px] text-[#FAF9F6]/60 font-mono uppercase font-semibold">
            HopeWorks Foundation Trust Protocol
          </span>
        </div>

      </div>

    </div>
  );
}
