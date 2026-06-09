import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import { springSnappy } from '../lib/motion';
import { useLoadingOverlay } from '../context/LoadingOverlayContext';
import { ButtonLoader } from './ButtonLoader';
import './PillButton.css';

export type PillButtonVariant =
  | 'outline'
  | 'primary'
  | 'brand'
  | 'success'
  | 'danger'
  | 'muted';

const VARIANT_STYLES: Record<
  PillButtonVariant,
  {
    baseColor: string;
    pillColor: string;
    textColor: string;
    hoveredTextColor: string;
    borderClass?: string;
  }
> = {
  outline: {
    baseColor: 'transparent',
    pillColor: '#B24724',
    textColor: '#000000',
    hoveredTextColor: '#ffffff',
    borderClass: 'border-black',
  },
  primary: {
    baseColor: '#000000',
    pillColor: '#B24724',
    textColor: '#ffffff',
    hoveredTextColor: '#ffffff',
    borderClass: 'border-black',
  },
  brand: {
    baseColor: '#B24724',
    pillColor: '#9A3412',
    textColor: '#ffffff',
    hoveredTextColor: '#ffffff',
  },
  success: {
    baseColor: '#059669',
    pillColor: '#B24724',
    textColor: '#ffffff',
    hoveredTextColor: '#ffffff',
  },
  danger: {
    baseColor: '#B24724',
    pillColor: '#9A3412',
    textColor: '#ffffff',
    hoveredTextColor: '#ffffff',
  },
  muted: {
    baseColor: '#ffffff',
    pillColor: '#B24724',
    textColor: '#475569',
    hoveredTextColor: '#ffffff',
    borderClass: 'border-slate-200',
  },
};

export interface PillButtonProps {
  id?: string;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  variant?: PillButtonVariant;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  textColor?: string;
  hoveredTextColor?: string;
  Icon?: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  /** Full-screen blur + pulse logo while loading (default true). */
  overlay?: boolean;
  loadingMessage?: string;
  disabled?: boolean;
  /** When false, keeps natural casing (better for dense dashboard UIs). */
  caps?: boolean;
}

export const PillButton: React.FC<PillButtonProps> = ({
  id,
  type = 'button',
  children,
  onClick,
  className = '',
  variant,
  ease = 'power3.easeOut',
  baseColor,
  pillColor,
  textColor,
  hoveredTextColor,
  Icon,
  loading = false,
  overlay = true,
  loadingMessage = 'Processing...',
  disabled = false,
  caps = true,
}) => {
  const loadingOverlay = useLoadingOverlay();

  useEffect(() => {
    if (!loading || overlay === false || !loadingOverlay) return;
    loadingOverlay.showLoading(loadingMessage);
    return () => loadingOverlay.hideLoading();
  }, [loading, overlay, loadingMessage, loadingOverlay]);

  const showInlineLoader = loading && (!overlay || !loadingOverlay);
  const variantStyle = variant ? VARIANT_STYLES[variant] : null;
  const resolvedBase = baseColor ?? variantStyle?.baseColor ?? 'transparent';
  const resolvedPill = pillColor ?? variantStyle?.pillColor ?? '#000000';
  const resolvedText = textColor ?? variantStyle?.textColor ?? '#000000';
  const resolvedHoverText = hoveredTextColor ?? variantStyle?.hoveredTextColor ?? '#ffffff';
  const borderClass = variantStyle?.borderClass ?? '';

  const containerRef = useRef<HTMLButtonElement>(null);
  const circleRef = useRef<HTMLSpanElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    const circle = circleRef.current;
    if (!el || !circle) return;

    const layout = () => {
      const rect = el.getBoundingClientRect();
      const { width: w, height: h } = rect;

      const R = ((w * w) / 4 + h * h) / (2 * h);
      const D = Math.ceil(2 * R) + 4;
      const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
      const originY = D - delta;

      circle.style.width = `${D}px`;
      circle.style.height = `${D}px`;
      circle.style.bottom = `-${delta}px`;

      gsap.set(circle, {
        xPercent: -50,
        scale: 0,
        transformOrigin: `50% ${originY}px`,
      });

      const label = el.querySelector('.p-label');
      const hoverLabel = el.querySelector('.p-label-hover');

      if (label) gsap.set(label, { y: 0 });
      if (hoverLabel) gsap.set(hoverLabel, { y: h + 12, opacity: 0 });

      tlRef.current?.kill();
      const tl = gsap.timeline({ paused: true });

      tl.to(circle, { scale: 1.25, xPercent: -50, duration: 0.6, ease, overwrite: 'auto' }, 0);

      if (label) {
        tl.to(label, { y: -(h + 8), duration: 0.6, ease, overwrite: 'auto' }, 0);
      }

      if (hoverLabel) {
        gsap.set(hoverLabel, { y: Math.ceil(h + 10), opacity: 0 });
        tl.to(hoverLabel, { y: 0, opacity: 1, duration: 0.6, ease, overwrite: 'auto' }, 0);
      }

      tlRef.current = tl;
    };

    const timeoutId = setTimeout(layout, 50);
    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', onResize);
    };
  }, [children, ease]);

  const handleEnter = () => {
    if (disabled || loading) return;
    tlRef.current?.play();
  };

  const handleLeave = () => {
    if (disabled || loading) return;
    tlRef.current?.reverse();
  };

  const cssVars = {
    '--btn-base': resolvedBase,
    '--btn-pill': resolvedPill,
    '--btn-text': resolvedText,
    '--btn-hover-text': resolvedHoverText,
  } as React.CSSProperties;

  const labelContent = (
    <span className="flex items-center justify-center gap-2">
      {showInlineLoader ? (
        <ButtonLoader className="h-3.5 w-3.5" />
      ) : (
        Icon && <Icon className="h-4 w-4 shrink-0" />
      )}
      {children}
    </span>
  );

  return (
    <motion.button
      id={id}
      type={type}
      ref={containerRef}
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      whileTap={loading || disabled ? undefined : { scale: 0.96 }}
      transition={springSnappy}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`pill-btn ${caps ? '' : 'pill-btn-normal'} ${borderClass} ${className} ${
        loading ? 'opacity-90 cursor-wait' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={cssVars}
    >
      <span className="p-hover-circle" ref={circleRef} />
      <span className="p-label-stack">
        <span className="p-label">{labelContent}</span>
        <span className="p-label-hover" aria-hidden="true">
          {labelContent}
        </span>
      </span>
    </motion.button>
  );
};
