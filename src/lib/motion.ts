import type { Transition, Variants } from 'motion/react';

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 180,
  damping: 22,
  mass: 0.7,
};

export const springBouncy: Transition = {
  type: 'spring',
  stiffness: 140,
  damping: 16,
  mass: 0.8,
};

export const springDashboard: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 28,
  mass: 0.6,
};

export const easeOutExpo: Transition = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1],
};

export const defaultViewport = { once: true, margin: '-60px' as const };

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const fadeUpBouncy: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springBouncy,
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springBouncy,
  },
};

export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: springBouncy },
};

export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: springBouncy },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springBouncy,
  },
};

export const timelineContainerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

export const timelineCardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 90,
      damping: 14,
      mass: 0.8,
    },
  },
};

export const timelineLineVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.15,
    },
  },
};

export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springBouncy,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: { duration: 0.15 },
  },
};

export const wizardStepForward: Variants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: springBouncy },
  exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
};

export const wizardStepBackward: Variants = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0, transition: springBouncy },
  exit: { opacity: 0, x: 40, transition: { duration: 0.2 } },
};

export const dashboardPanelVariants: Variants = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0, transition: springDashboard },
  exit: { opacity: 0, x: -8, transition: { duration: 0.12 } },
};

export const hoverLift = {
  whileHover: { y: -4, scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: springSnappy,
};

const reducedMotionVisible = { opacity: 1, x: 0, y: 0, scale: 1 };

export function getReducedMotionVariants(variants: Variants): Variants {
  const result: Variants = {};
  for (const [key, value] of Object.entries(variants)) {
    if (typeof value === 'function') {
      result[key] = value;
      continue;
    }
    if (key === 'hidden' || key === 'initial' || key === 'exit') {
      result[key] = reducedMotionVisible;
    } else {
      result[key] = { ...reducedMotionVisible, transition: { duration: 0 } };
    }
  }
  return result;
}

export function resolveVariants(variants: Variants, reducedMotion: boolean): Variants {
  return reducedMotion ? getReducedMotionVariants(variants) : variants;
}
