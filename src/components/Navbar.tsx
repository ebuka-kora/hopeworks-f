import React from 'react';
import { SiteHeader } from './SiteHeader';

interface NavbarProps {
  onNavigate: (view: string, id?: string) => void;
  currentView: string;
}

export function Navbar({ onNavigate }: NavbarProps) {
  return (
    <SiteHeader
      onNavigate={onNavigate}
      variant="sticky"
      showNotifications
    />
  );
}
