import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Bell, LogOut, Compass, BookOpen, LayoutDashboard, User, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotificationsStore } from '../hooks/useNotificationsStore';
import { Logo } from './Logo';
import { PillButton } from './PillButton';
import { springBouncy } from '../lib/motion';

interface SiteHeaderProps {
  onNavigate: (view: string, id?: string) => void;
  /** fixed = landing page; sticky = inner public pages */
  variant?: 'fixed' | 'sticky';
  showNotifications?: boolean;
}

const NAV_LINKS = [
  { label: 'Explore', view: 'explore', icon: Compass },
  { label: 'How It Works', view: 'how_it_works', icon: BookOpen },
] as const;

export function SiteHeader({
  onNavigate,
  variant = 'sticky',
  showNotifications = false,
}: SiteHeaderProps) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotificationsStore(user?.id);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const navigate = (view: string, id?: string) => {
    setMenuOpen(false);
    onNavigate(view, id);
  };

  const positionClass =
    variant === 'fixed'
      ? 'fixed top-0 left-0 right-0'
      : 'sticky top-0';

  const guestActions = (
    <>
      <PillButton
        onClick={() => navigate('login')}
        variant="outline"
        className="py-2 px-5 text-[11px] border-black"
      >
        Sign In
      </PillButton>
      <PillButton
        onClick={() => navigate('register')}
        variant="primary"
        className="py-2 px-5 text-[11px] border-black shadow-sm"
      >
        Sign Up
      </PillButton>
    </>
  );

  const userActions = (compact?: boolean) => (
    <>
      {showNotifications && (
        <button
          type="button"
          onClick={() => navigate('notifications')}
          className="relative text-slate-500 hover:text-[#B24724] p-2 hover:bg-orange-50 rounded-full transition-colors duration-200"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-[#B24724] text-white text-[8px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center ring-2 ring-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}

      <button
        type="button"
        onClick={() => navigate('profile')}
        className={`flex items-center gap-2 border border-slate-200/60 bg-white/80 py-1.5 rounded-full hover:border-slate-300 transition-all font-mono ${
          compact ? 'px-2' : 'px-3'
        }`}
      >
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user?.name}
            referrerPolicy="no-referrer"
            className="h-6 w-6 sm:h-7 sm:w-7 rounded-full object-cover"
          />
        ) : (
          <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-slate-800 text-white font-serif text-[10px] flex items-center justify-center font-bold">
            {user?.name.charAt(0)}
          </div>
        )}
        {!compact && (
          <span className="hidden lg:inline text-[10px] text-slate-600 font-sans tracking-normal font-semibold max-w-[120px] truncate">
            {user?.name}
          </span>
        )}
      </button>

      <PillButton
        onClick={() => navigate('dashboard')}
        variant="outline"
        caps={false}
        className="py-2 px-4 text-[11px] hidden sm:inline-flex"
        textColor="#334155"
        pillColor="#B24724"
        baseColor="transparent"
        hoveredTextColor="#ffffff"
      >
        Dashboard
      </PillButton>

      <button
        type="button"
        onClick={() => {
          logout();
          navigate('home');
        }}
        className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full transition-colors"
        title="Log out"
        aria-label="Log out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </>
  );

  return (
    <>
      <header
        className={`${positionClass} z-50 w-full bg-[#FAF9F6]/95 backdrop-blur-md border-b border-slate-200/40 select-none`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[4.5rem] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('home')}
            className="cursor-pointer shrink-0 min-w-0"
            aria-label="HopeWorks home"
          >
            <Logo iconSize={30} />
          </button>

          <div className="hidden md:flex items-center gap-2 shrink-0 ml-auto">
            {user ? userActions() : guestActions}
          </div>

          <button
            type="button"
            className="md:hidden p-2 -mr-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-[2px] md:hidden"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu overlay"
            />

            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={springBouncy}
              className="fixed top-0 right-0 bottom-0 z-[70] w-[min(100vw,20rem)] bg-[#FAF9F6] border-l border-slate-200 shadow-2xl flex flex-col md:hidden"
              aria-label="Mobile menu"
            >
              <div className="flex items-center justify-between px-4 h-16 border-b border-slate-100 shrink-0">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">Menu</span>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {NAV_LINKS.map(({ label, view, icon: Icon }) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => navigate(view)}
                    className="w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-orange-50/60 rounded-xl transition-colors text-left"
                  >
                    <Icon className="h-4 w-4 text-[#B24724]" />
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => navigate('create_campaign')}
                  className="w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-orange-50/60 rounded-xl transition-colors text-left"
                >
                  <Plus className="h-4 w-4 text-[#B24724]" />
                  Create Campaign
                </button>

                {user && (
                  <>
                    <div className="h-px bg-slate-100 my-3" />
                    <button
                      type="button"
                      onClick={() => navigate('dashboard')}
                      className="w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-orange-50/60 rounded-xl transition-colors text-left"
                    >
                      <LayoutDashboard className="h-4 w-4 text-[#B24724]" />
                      Dashboard
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('profile')}
                      className="w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-orange-50/60 rounded-xl transition-colors text-left"
                    >
                      <User className="h-4 w-4 text-[#B24724]" />
                      My Profile
                    </button>
                    {showNotifications && (
                      <button
                        type="button"
                        onClick={() => navigate('notifications')}
                        className="w-full flex items-center justify-between gap-3 px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-orange-50/60 rounded-xl transition-colors text-left"
                      >
                        <span className="flex items-center gap-3">
                          <Bell className="h-4 w-4 text-[#B24724]" />
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold bg-[#B24724] text-white px-1.5 py-0.5 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 space-y-2 shrink-0">
                {user ? (
                  <>
                    <div className="flex items-center gap-2 px-2 py-2 mb-2">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-slate-800 text-white flex items-center justify-center text-sm font-bold">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono capitalize truncate">
                          {user.roles[0]?.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <PillButton
                      variant="muted"
                      caps={false}
                      onClick={() => {
                        logout();
                        navigate('home');
                      }}
                      className="w-full py-2.5 text-xs"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </PillButton>
                  </>
                ) : (
                  <>
                    <PillButton
                      variant="outline"
                      onClick={() => navigate('login')}
                      className="w-full py-2.5 text-xs border-black"
                    >
                      Sign In
                    </PillButton>
                    <PillButton
                      variant="primary"
                      onClick={() => navigate('register')}
                      className="w-full py-2.5 text-xs border-black"
                    >
                      Sign Up
                    </PillButton>
                  </>
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
