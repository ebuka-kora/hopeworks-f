import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  modalBackdropVariants,
  modalContentVariants,
  resolveVariants,
} from '../../lib/motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ModalMotionProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  zIndex?: string;
}

export function ModalMotion({
  open,
  onClose,
  children,
  className = 'fixed inset-0 z-[200] flex items-center justify-center p-4',
  contentClassName,
  zIndex,
}: ModalMotionProps) {
  const reducedMotion = useReducedMotion();
  const backdropVariants = resolveVariants(modalBackdropVariants, reducedMotion);
  const contentVariants = resolveVariants(modalContentVariants, reducedMotion);

  return (
    <AnimatePresence>
      {open && (
        <div
          className={className}
          style={zIndex ? { zIndex: parseInt(zIndex, 10) } : undefined}
          role="presentation"
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close dialog"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          />
          <motion.div
            className={contentClassName}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
