import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, FileText, Lock, Scale, ArrowLeft, CheckCircle2, HelpCircle, Info, Calendar } from 'lucide-react';
import { PillButton } from '../components/PillButton';

interface TermsAndPrivacyProps {
  initialTab?: 'terms' | 'privacy';
  onNavigate: (view: string) => void;
}

export function TermsAndPrivacy({ initialTab = 'terms', onNavigate }: TermsAndPrivacyProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#B24724]/15 selection:text-slate-900">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Navigation Breadcrumb & Back action */}
        <div className="flex items-center justify-between">
          <PillButton
            variant="outline"
            caps={false}
            onClick={() => onNavigate('home')}
            className="py-2 px-4 text-xs font-mono"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Core
          </PillButton>
          
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Calendar className="h-3.5 w-3.5" />
            <span>Last Updated: June 5, 2026</span>
          </div>
        </div>

        {/* Page Header Header */}
        <div className="space-y-4 text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl font-serif font-normal text-slate-950 tracking-tight leading-none">
            Legal & Trust Framework
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
            HopeWorks operates under high-integrity peer-to-peer verification, local-first sandbox credentials, and strict public benefits auditing parameters.
          </p>
        </div>

        {/* Premium Tab Toggles */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2.5 px-6 py-4.5 border-b-2 text-sm font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'terms'
                ? 'border-[#B24724] text-[#B24724]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Scale className="h-4.5 w-4.5" />
            <span>Terms of Service</span>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2.5 px-6 py-4.5 border-b-2 text-sm font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-[#B24724] text-[#B24724]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Lock className="h-4.5 w-4.5" />
            <span>Privacy Policy</span>
          </button>
        </div>

        {/* Dynamic content card wrapper */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-10 shadow-xs space-y-10">
          {activeTab === 'terms' ? (
            <motion.div
              key="terms-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Introduction summary highlight */}
              <div className="p-5 sm:p-6 bg-[#FAF9F6] border border-[#B24724]/10 rounded-2xl flex items-start gap-4">
                <Info className="h-5 w-5 text-[#B24724] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-sans font-extrabold text-slate-900 uppercase tracking-wide">
                    High-Integrity Escrow Model Acknowledgment
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    By accessing HopeWorks, you agree to our rigorous verification procedures. Funds pledged toward developmental campaigns (such as Sustainable Development Goals) are placed under strict peer-to-peer municipal escrow conditions.
                  </p>
                </div>
              </div>

              {/* Legal Sections */}
              <div className="space-y-6">
                <section className="space-y-2">
                  <h3 className="text-lg font-serif font-semibold text-slate-950">
                    1. Campaign Creation and Intellectual Integrity
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    All coordinators initiating campaigns on the global sandbox must submit precise local coordinates, verification photographs, and clear milestones matching the United Nations Sustainable Development Goals (SDGs). Submission of false, AI-manipulated, or deceptive telemetry constitutes a direct breach of this Agreement and will result in the immediate forfeiture of the connected escrow pledge coordinates.
                  </p>
                </section>

                <div className="h-px bg-slate-100" />

                <section className="space-y-3">
                  <h3 className="text-lg font-serif font-semibold text-slate-950">
                    2. Escrow Pledging and Voluntary Core Commitments
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    Any dollar pledged through our escrow simulation is technically a public-good coordinate commitment. Contributors acknowledge that:
                  </p>
                  <ul className="space-y-2 pl-2">
                    <li className="flex items-start gap-2.5 text-xs text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-[#B24724] shrink-0 mt-0.5" />
                      <span>Pledges remain held secure until the verified physical milestone is unlocked on the ground.</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-[#B24724] shrink-0 mt-0.5" />
                      <span>Authorized release occurs only upon simultaneous cryptographic sign-offs from coordinator networks, municipal regulators, and engineering field dispatchers.</span>
                    </li>
                  </ul>
                </section>

                <div className="h-px bg-slate-100" />

                <section className="space-y-2">
                  <h3 className="text-lg font-serif font-semibold text-slate-950">
                    3. Civic Sweat Equity & Volunteer Sign-offs
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    Users registering for civic labor shifts submit themselves to peer recognition audits. Logging false sweat equity shift hours degrades the verified civic authority score. Coordinators retain absolute authority to accept or dispute shift outcomes within 72 structural calendar hours.
                  </p>
                </section>

                <div className="h-px bg-slate-100" />

                <section className="space-y-2">
                  <h3 className="text-lg font-serif font-semibold text-slate-950">
                    4. Limitation of Liability & Protocol Safety
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    HopeWorks is constructed to operate as a high-fidelity local framework sandbox. While we employ rigorous calculations, users recognize that all smart-contract operations, token exchanges, and milestones are registered for simulation, optimization, and public governance modeling.
                  </p>
                </section>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="privacy-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Privacy summary highlight */}
              <div className="p-5 sm:p-6 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-4">
                <Shield className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-sans font-extrabold text-[#050C16] uppercase tracking-wide">
                    Local-First Privacy Standards (Zero Tracking Spec)
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Under HopeWorks rules, your profile state, cryptographic signature parameters, campaign ledger histories, and credentials are kept stored locally within sandboxed environments.
                  </p>
                </div>
              </div>

              {/* Legal Sections */}
              <div className="space-y-6">
                <section className="space-y-2">
                  <h3 className="text-lg font-serif font-semibold text-slate-950">
                    1. Collected Information Parameters
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    To maintain audit levels on physical milestones, our decentralized physical system logs minimal telemetry verification variables, which include: your coordinator name, email address, registered campaign milestones, field volunteer schedule bookings, and submitted photographic evidence hashes.
                  </p>
                </section>

                <div className="h-px bg-slate-100" />

                <section className="space-y-3">
                  <h3 className="text-lg font-serif font-semibold text-slate-950">
                    2. Telemetry and Photographic Security
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    Images uploaded for milestone approvals are stored under rigorous cryptographic hash rules. Meta-information containing precise physical GPS attributes are only parsed to confirm field coordination validity and are never leaked to external commercial lists.
                  </p>
                  <ul className="space-y-2 pl-2">
                    <li className="flex items-start gap-2.5 text-xs text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>GPS details are immediate hashes, deleted post inspection approval.</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Coordination maps utilize local sandboxed scripts with zero third-party telemetry dependencies.</span>
                    </li>
                  </ul>
                </section>

                <div className="h-px bg-slate-100" />

                <section className="space-y-2">
                  <h3 className="text-lg font-serif font-semibold text-slate-950">
                    3. Right to Erasure & Ledger Resets
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    You have total control over your user identity parameters. Simply clear your local browser credentials or delete your profile within the Edit Profile system terminal to wipe application credentials instantly. For historical integrity, public milestones completed under registered peer supervision remain written as permanent entries in our escrow ledger.
                  </p>
                </section>

                <div className="h-px bg-slate-100" />

                <section className="space-y-2">
                  <h3 className="text-lg font-serif font-semibold text-slate-950">
                    4. Global Standard Compliance
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    We voluntarily structure our physical metadata caching in alignment with the highest consumer privacy policies, ensuring every participant remains sovereign over their personal data assets.
                  </p>
                </section>
              </div>
            </motion.div>
          )}

          {/* Core Support Block */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-slate-300" />
              <span>Questions or concerns about compliance variables?</span>
            </div>
            <a 
              href="mailto:trust@hopeworks.dev" 
              onClick={(e) => e.preventDefault()}
              className="text-[#B24724] font-bold hover:underline"
            >
              trust@hopeworks.dev
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
