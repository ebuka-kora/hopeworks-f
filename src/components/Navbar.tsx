import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useNotificationsStore } from '../hooks/useNotificationsStore';
import { Bell, LogOut } from 'lucide-react';
import { Logo } from './Logo';
import { PillButton } from './PillButton';
import { springBouncy } from '../lib/motion';

interface NavbarProps {
  onNavigate: (view: string, id?: string) => void;
  currentView: string;
}

export function Navbar({ onNavigate, currentView }: NavbarProps) {
  const { user, logout } = useAuth();
  const { notifications } = useNotificationsStore(user?.id);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springBouncy}
      className="sticky top-0 z-50 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-slate-200/40 select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        <motion.div 
          onClick={() => onNavigate('home')}
          className="cursor-pointer select-none shrink-0"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={springBouncy}
        >
          <Logo iconSize={32} />
        </motion.div>

        <div className="flex items-center gap-4 text-xs shrink-0">
          
          {user ? (
            <>
              <motion.button 
                onClick={() => onNavigate('notifications')}
                className="relative text-slate-500 hover:text-slate-800 p-2 hover:bg-slate-50 rounded-full transition-colors shrink-0"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={springBouncy}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={springBouncy}
                    className="absolute top-1.5 right-1.5 bg-rose-500 text-white font-sans text-[8px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center ring-2 ring-white"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </motion.button>

              <div className="flex items-center gap-2 border-l border-slate-200 pl-3.5">
                <motion.div 
                  onClick={() => onNavigate('profile')}
                  className="cursor-pointer shrink-0"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={springBouncy}
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="h-7 w-7 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-slate-800 text-white font-semibold font-serif text-xs flex items-center justify-center">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </motion.div>
                <div className="hidden sm:block text-left font-mono">
                  <p className="font-semibold text-slate-800 line-clamp-1 leading-snug">{user.name}</p>
                  <p className="text-[9px] text-slate-400 font-mono capitalize leading-none tracking-wide">{user.roles[0]?.replace('_', ' ')}</p>
                </div>
              </div>

              <motion.button 
                onClick={() => { logout(); onNavigate('home'); }}
                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full transition-colors shrink-0"
                title="Log Out Session"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={springBouncy}
              >
                <LogOut className="h-4 w-4" />
              </motion.button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-bold">
              <PillButton
                onClick={() => onNavigate('login')}
                className="py-2 px-5 cursor-pointer border-black"
                baseColor="transparent"
                textColor="#000000"
                pillColor="#B24724"
                hoveredTextColor="#ffffff"
              >
                Sign In
              </PillButton>
              <PillButton
                onClick={() => onNavigate('register')}
                className="py-2 px-5 shadow-sm cursor-pointer border-black"
                baseColor="#000000"
                textColor="#ffffff"
                pillColor="#B24724"
                hoveredTextColor="#ffffff"
              >
                Sign Up
              </PillButton>
            </div>
          )}

        </div>

      </div>
    </motion.header>
  );
}
