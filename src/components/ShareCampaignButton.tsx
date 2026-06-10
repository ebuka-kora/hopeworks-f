import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Share2, Link2, X as XIcon, Facebook, Linkedin, MessageCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Project } from '../types';
import {
  canShareCampaign,
  getCampaignShareUrl,
  getFacebookShareUrl,
  getLinkedInShareUrl,
  getShareMessage,
  getTwitterShareUrl,
  getWhatsAppShareUrl,
} from '../lib/campaignShare';

interface ShareCampaignButtonProps {
  project: Pick<Project, 'id' | 'title' | 'summary' | 'status' | 'ownerId'>;
  currentUserId?: string | null;
  className?: string;
}

export function ShareCampaignButton({
  project,
  currentUserId,
  className = '',
}: ShareCampaignButtonProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const shareAllowed = canShareCampaign(project.status, project.ownerId, currentUserId);
  const shareUrl = getCampaignShareUrl(project.id);
  const shareMessage = getShareMessage(project.title, project.summary);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (window.innerWidth < 640) return;
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    if (window.innerWidth < 640) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const openSocial = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=520');
    setOpen(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Campaign link copied to clipboard.');
    } catch {
      toast.error('Could not copy link. Try again.');
    }
    setOpen(false);
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      await handleCopyLink();
      return;
    }
    try {
      await navigator.share({
        title: project.title,
        text: shareMessage,
        url: shareUrl,
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      toast.error('Could not open share sheet.');
    }
    setOpen(false);
  };

  const menuItems = (
    <div className="p-1.5 space-y-0.5">
      <button
        type="button"
        onClick={handleCopyLink}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 cursor-pointer text-left"
      >
        <Link2 className="h-3.5 w-3.5 text-[#B24724]" />
        Copy link
      </button>

      {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
        <button
          type="button"
          onClick={handleNativeShare}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 cursor-pointer text-left"
        >
          <Share2 className="h-3.5 w-3.5 text-[#B24724]" />
          Share via device
        </button>
      )}

      <button
        type="button"
        onClick={() => openSocial(getTwitterShareUrl(shareUrl, shareMessage))}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 cursor-pointer text-left"
      >
        <XIcon className="h-3.5 w-3.5" />
        Post on X
      </button>

      <button
        type="button"
        onClick={() => openSocial(getFacebookShareUrl(shareUrl))}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 cursor-pointer text-left"
      >
        <Facebook className="h-3.5 w-3.5" />
        Facebook
      </button>

      <button
        type="button"
        onClick={() => openSocial(getLinkedInShareUrl(shareUrl))}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 cursor-pointer text-left"
      >
        <Linkedin className="h-3.5 w-3.5" />
        LinkedIn
      </button>

      <button
        type="button"
        onClick={() => openSocial(getWhatsAppShareUrl(shareUrl, shareMessage))}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 cursor-pointer text-left"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        WhatsApp
      </button>
    </div>
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={!shareAllowed}
        onClick={() => setOpen((prev) => !prev)}
        title={
          shareAllowed
            ? 'Share this campaign'
            : 'Sharing unlocks once the campaign is live on Explore'
        }
        className="inline-flex items-center justify-center gap-1.5 rounded-full border font-sans font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed py-2 px-3.5 text-xs border-slate-200 bg-white text-slate-700 hover:border-[#B24724]/40 hover:text-[#B24724] shadow-sm"
      >
        <Share2 className="h-3.5 w-3.5 shrink-0" />
        Share
      </button>

      {open && shareAllowed && (
        <>
          <div className="hidden sm:block absolute z-50 mt-2 left-0 w-64 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/80">
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Share campaign</p>
            </div>
            {menuItems}
          </div>

          {typeof document !== 'undefined' &&
            createPortal(
              <div className="sm:hidden fixed inset-0 z-[100]">
                <button
                  type="button"
                  aria-label="Close share menu"
                  className="absolute inset-0 bg-black/40"
                  onClick={() => setOpen(false)}
                />
                <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl border border-slate-200 bg-white shadow-2xl pb-[env(safe-area-inset-bottom)]">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Share campaign</p>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="text-xs text-slate-500 font-medium"
                    >
                      Close
                    </button>
                  </div>
                  {menuItems}
                </div>
              </div>,
              document.body
            )}
        </>
      )}
    </div>
  );
}
