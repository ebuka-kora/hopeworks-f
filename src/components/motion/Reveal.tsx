import React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import {
  defaultViewport,
  fadeUp,
  fadeUpBouncy,
  scaleIn,
  slideFromLeft,
  slideFromRight,
  resolveVariants,
  springBouncy,
  easeOutExpo,
} from '../../lib/motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'scale' | 'bouncy';

const directionVariants = {
  up: fadeUp,
  bouncy: fadeUpBouncy,
  scale: scaleIn,
  left: slideFromLeft,
  right: slideFromRight,
  down: {
    hidden: { opacity: 0, y: -24 },
    visible: { opacity: 1, y: 0 },
  },
};

interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate'> {
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  once?: boolean;
  as?: 'div' | 'section' | 'article' | 'span' | 'h1' | 'h2' | 'h3' | 'p';
}

export function Reveal({
  direction = 'up',
  delay = 0,
  duration,
  once = true,
  as = 'div',
  children,
  className,
  ...props
}: RevealProps) {
  const reducedMotion = useReducedMotion();
  const Component = motion[as] as typeof motion.div;
  const variants = resolveVariants(directionVariants[direction], reducedMotion);

  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={{ ...defaultViewport, once }}
      variants={variants}
      transition={
        reducedMotion
          ? { duration: 0 }
          : duration
            ? { ...easeOutExpo, duration, delay }
            : { ...springBouncy, delay }
      }
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
}
