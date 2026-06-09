import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  wizardStepForward,
  wizardStepBackward,
  resolveVariants,
} from '../../lib/motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface WizardStepProps {
  stepKey: string;
  direction: 'forward' | 'backward';
  children: React.ReactNode;
  className?: string;
}

export function WizardStepMotion({ stepKey, direction, children, className }: WizardStepProps) {
  const reducedMotion = useReducedMotion();
  const variants = resolveVariants(
    direction === 'forward' ? wizardStepForward : wizardStepBackward,
    reducedMotion
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
