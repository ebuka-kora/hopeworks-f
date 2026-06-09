import React from 'react';
import logoImage from '@/assets/logo1.png';

interface ButtonLoaderProps {
  className?: string;
}

export function ButtonLoader({ className = 'h-4 w-4' }: ButtonLoaderProps) {
  return (
    <img
      src={logoImage}
      alt=""
      aria-hidden="true"
      className={`object-contain hopeworks-pulse-beat shrink-0 ${className}`}
    />
  );
}

interface LoadingButtonLabelProps {
  loading: boolean;
  children: React.ReactNode;
  loaderClassName?: string;
}

export function LoadingButtonLabel({
  loading,
  children,
  loaderClassName = 'h-3.5 w-3.5',
}: LoadingButtonLabelProps) {
  if (!loading) return <>{children}</>;

  return (
    <span className="inline-flex items-center justify-center gap-2">
      <ButtonLoader className={loaderClassName} />
      <span>{children}</span>
    </span>
  );
}
