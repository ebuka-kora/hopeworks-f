import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Facebook, Youtube, Instagram, Twitter, Shield, X } from 'lucide-react';
import { Logo } from './Logo';
import { StaggerChildren } from './motion/StaggerChildren';
import { Reveal } from './motion/Reveal';
import { ModalMotion } from './motion/ModalMotion';
import { springBouncy } from '../lib/motion';
import { PillButton } from './PillButton';

interface FooterProps {
  onNavigate?: (view: string) => void;
}

const FOOTER_LINKS = [
  { label: 'Volunteer Availability', view: 'availability' },
  { label: 'Bylaw Rules', view: 'home' },
  { label: 'Terms of Service', view: 'terms' },
  { label: 'Privacy Policy', view: 'privacy' },
] as const;

export function Footer({ onNavigate }: FooterProps) {
  const [modalContent, setModalContent] = useState<{ title: string; body: string } | null>(null);

  const handleLink = (view: string) => {
    if (onNavigate) onNavigate(view);
  };

  return (
    <footer className="bg-[#050C16] text-slate-400 border-t border-slate-900 pt-16 pb-0 select-none overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Row 1: single column on mobile, inline with bullets on sm+ */}
        <Reveal direction="up" className="text-xs md:text-sm font-sans text-slate-400">
          <nav
            className="flex flex-col items-center gap-0.5 sm:hidden"
            aria-label="Footer navigation"
          >
            {FOOTER_LINKS.map((link) => (
              <button
                key={link.view}
                type="button"
                onClick={() => handleLink(link.view)}
                className="w-full max-w-xs py-2.5 text-center hover:text-orange-500 transition-colors cursor-pointer font-medium"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <nav
            className="hidden sm:flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
            aria-label="Footer navigation"
          >
            {FOOTER_LINKS.map((link, index) => (
              <React.Fragment key={link.view}>
                {index > 0 && <span className="text-slate-700">•</span>}
                <motion.button
                  type="button"
                  onClick={() => handleLink(link.view)}
                  className="relative hover:text-orange-500 transition-colors cursor-pointer font-medium group"
                  whileHover={{ y: -2 }}
                  transition={springBouncy}
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-orange-500 transition-all group-hover:w-full" />
                </motion.button>
              </React.Fragment>
            ))}
          </nav>
        </Reveal>

        {/* Separation Divider line */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

        {/* Row 2: Standard Copyright + Live Social Buttons */}
        <Reveal direction="up" className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 text-xs text-slate-500 font-sans">
          
          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 font-medium text-slate-400 sm:text-slate-300">
              <span>© 2026</span>
              <Logo iconSize={18} showText={true} textColorClass="text-slate-200" className="inline-flex" />
            </div>
            <p className="text-[10px] text-slate-600 font-mono">
              High-Integrity SDG Milestone escrow. Registered Public Benefits Crowdfunding.
            </p>
          </div>

          {/* Social Icons matching NEVON MEDIA layout */}
          <StaggerChildren className="flex items-center gap-3" stagger={0.08}>
            {[Facebook, Youtube, Instagram, Twitter].map((Icon, i) => (
              <motion.a
                key={i}
                href="#"
                onClick={(e) => e.preventDefault()}
                className="h-9 w-9 rounded-full border border-slate-800 bg-slate-950/40 flex items-center justify-center text-slate-400 hover:text-orange-500 hover:border-orange-500 transition-all cursor-pointer"
                whileHover={{ y: -3, scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                transition={springBouncy}
              >
                <Icon className="h-4 w-4" />
              </motion.a>
            ))}
          </StaggerChildren>

        </Reveal>

      </div>

      {/* Row 3: Giant Uppercase Bold Emblem Title at the very bottom utilizing the site's brand typography signature */}
      <div className="w-full text-center overflow-hidden border-t border-slate-950 bg-[#03070E] mt-4 select-none pointer-events-none">
        <h1 className="text-[13vw] font-black tracking-tighter animate-shine-orange-white uppercase font-serif italic leading-none translate-y-3 sm:translate-y-5 select-none w-full text-center select-none">
          HOPEWORKS
        </h1>
      </div>

      {/* Modern, in-app modal to replace blocked alert framework */}
      <ModalMotion
        open={!!modalContent}
        onClose={() => setModalContent(null)}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto"
        contentClassName="bg-[#FAF9F6] border border-slate-200/50 rounded-2xl max-w-md w-full p-6 text-slate-900 shadow-2xl relative space-y-4"
      >
        {modalContent && (
          <>
            <button
              onClick={() => setModalContent(null)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Shield className="h-5 w-5 text-[#EA580C]" />
              <h3 className="font-serif font-black text-base text-slate-900 leading-tight">
                {modalContent.title}
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              {modalContent.body}
            </p>

            <PillButton
              variant="primary"
              onClick={() => setModalContent(null)}
              className="w-full py-2 text-xs font-sans"
            >
              Acknowledge Parameter
            </PillButton>
          </>
        )}
      </ModalMotion>

    </footer>
  );
}
