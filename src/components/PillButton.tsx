import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
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
  const [isHovered, setIsHovered] = useState(false);

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
        Icon && <Icon className="p-btn-icon h-4 w-4 shrink-0" />
      )}
      {children}
    </span>
  );

  return (
    <motion.button
      id={id}
      type={type}
      onClick={onClick}
      onMouseEnter={() => {
        if (!disabled && !loading) setIsHovered(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
      whileTap={loading || disabled ? undefined : { scale: 0.97 }}
      transition={springSnappy}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`pill-btn ${caps ? '' : 'pill-btn-normal'} ${borderClass} ${className} ${
        isHovered ? 'is-hovered' : ''
      } ${loading ? 'opacity-90 cursor-wait' : ''} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      style={cssVars}
    >
      <span className="p-label-stack">
        <span className="p-label">{labelContent}</span>
      </span>
    </motion.button>
  );
};
