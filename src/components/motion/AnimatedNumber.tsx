import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  duration?: number;
}

export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
  duration = 1.2,
}: AnimatedNumberProps) {
  const reducedMotion = useReducedMotion();
  const spring = useSpring(0, { stiffness: 80, damping: 20 });
  const display = useTransform(spring, (current) => {
    const formatted = current.toFixed(decimals);
    return `${prefix}${formatted}${suffix}`;
  });
  const [staticValue, setStaticValue] = useState(`${prefix}${value.toFixed(decimals)}${suffix}`);

  useEffect(() => {
    if (reducedMotion) {
      setStaticValue(`${prefix}${value.toFixed(decimals)}${suffix}`);
      return;
    }
    spring.set(0);
    const timeout = setTimeout(() => spring.set(value), 50);
    return () => clearTimeout(timeout);
  }, [value, spring, reducedMotion, prefix, suffix, decimals]);

  if (reducedMotion) {
    return <span className={className}>{staticValue}</span>;
  }

  return (
    <motion.span className={className} style={{ display: 'inline-block' }}>
      {display}
    </motion.span>
  );
}
