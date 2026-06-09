import React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import {
  defaultViewport,
  staggerContainer,
  staggerItem,
  resolveVariants,
} from '../../lib/motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface StaggerChildrenProps extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate'> {
  stagger?: number;
  delayChildren?: number;
  once?: boolean;
  itemClassName?: string;
}

export function StaggerChildren({
  children,
  stagger = 0.1,
  delayChildren = 0.05,
  once = true,
  className,
  itemClassName,
  ...props
}: StaggerChildrenProps) {
  const reducedMotion = useReducedMotion();
  const containerVariants = resolveVariants(
    {
      ...staggerContainer,
      visible: {
        opacity: 1,
        transition: { staggerChildren: stagger, delayChildren },
      },
    },
    reducedMotion
  );
  const itemVariants = resolveVariants(staggerItem, reducedMotion);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ ...defaultViewport, once }}
      variants={containerVariants}
      className={className}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return (
          <motion.div variants={itemVariants} className={itemClassName}>
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

interface StaggerItemProps extends HTMLMotionProps<'div'> {}

export function StaggerItem({ children, className, ...props }: StaggerItemProps) {
  const reducedMotion = useReducedMotion();
  const itemVariants = resolveVariants(staggerItem, reducedMotion);

  return (
    <motion.div variants={itemVariants} className={className} {...props}>
      {children}
    </motion.div>
  );
}
