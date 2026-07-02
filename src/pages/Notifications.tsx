import React from 'react';
import { motion } from 'motion/react';
import { springBouncy } from '../lib/motion';
import { useAuth } from '../context/AuthContext';
import { useNotificationsStore } from '../hooks/useNotificationsStore';
import { PulseBeatLoader } from '../components/PulseBeatLoader';
import { Bell, CheckCircle, ArrowUpRight } from 'lucide-react';
import { PillButton } from '../components/PillButton';

interface NotificationsProps {
  onNavigate: (view: string, id?: string) => void;
}

export function Notifications({ onNavigate }: NotificationsProps) {
  const { user } = useAuth();
  const { notifications, loading, markAsRead, markAllAsRead } = useNotificationsStore(user?.id);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center select-none font-mono text-slate-400">
        Please sign in to read notifications.
      </div>
    );
  }

  if (loading) {
    return <PulseBeatLoader message="Loading notifications" fullScreen={false} />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 select-none">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springBouncy}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-4 border-b border-slate-100 pb-5"
      >
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-[#B24724] font-bold uppercase tracking-widest leading-none">Security Feed</label>
          <h1 className="text-3xl font-serif font-semibold text-slate-900 tracking-tight leading-none">Your Escrow Activity Log</h1>
          <p className="text-xs text-slate-500 font-sans mt-1 block">Live notifications linked to crowdfunding milestones actions.</p>
        </div>

        {notifications.length > 0 && (
          <PillButton
            variant="muted"
            caps={false}
            onClick={markAllAsRead}
            className="px-4 py-2 text-xs font-mono shrink-0"
            Icon={CheckCircle}
          >
            Mark All Read
          </PillButton>
        )}
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 1 },
          visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
        }}
        className="space-y-3.5"
      >
        {notifications.map((not) => (
          <motion.div
            key={not.id}
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={springBouncy}
            onClick={() => markAsRead(not.id)}
            whileHover={{ x: 3 }}
            className={`group p-5 rounded-2xl border transition-all duration-200 flex justify-between gap-4 relative cursor-pointer ${
              not.isRead
                ? 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50/80 hover:shadow-sm'
                : 'bg-orange-50/40 border-orange-200/70 text-slate-800 shadow-xs hover:border-[#B24724]/30 hover:bg-orange-50/70 hover:shadow-md'
            }`}
          >
            <div className="flex gap-4 items-start text-xs font-mono min-w-0">
              <div
                className={`p-2 rounded-xl shrink-0 transition-colors duration-200 ${
                  not.isRead
                    ? 'bg-slate-100 text-slate-400 group-hover:bg-orange-50 group-hover:text-[#B24724]'
                    : 'bg-[#FFEDD5] text-[#B24724] group-hover:bg-[#B24724] group-hover:text-white'
                }`}
              >
                <Bell className="h-4 w-4" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0 select-all font-sans">
                <h4
                  className={`font-semibold text-sm leading-tight transition-colors ${
                    not.isRead ? 'text-slate-900 group-hover:text-[#9A3412]' : 'text-slate-900'
                  }`}
                >
                  {not.title}
                </h4>
                <p className="text-slate-500 text-xs leading-relaxed group-hover:text-slate-600">
                  {not.description}
                </p>

                <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400 pt-1 select-none">
                  <span>
                    LOG TIME: {new Date(not.createdAt).toLocaleDateString()} at{' '}
                    {new Date(not.createdAt).toLocaleTimeString()}
                  </span>
                  {!not.isRead && (
                    <span className="h-2 w-2 rounded-full bg-[#B24724] shrink-0 animate-pulse" />
                  )}
                </div>
              </div>
            </div>

            {not.projectId && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  markAsRead(not.id);
                  onNavigate('project_detail', not.projectId);
                }}
                className="p-2 border border-slate-100 rounded-xl shrink-0 self-start transition-all duration-200 text-slate-400 hover:text-[#B24724] hover:border-[#B24724]/25 hover:bg-orange-50"
                title="Go to project workspace"
              >
                <ArrowUpRight className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        ))}

        {notifications.length === 0 && (
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={springBouncy}
            className="text-center py-20 bg-white border border-slate-100 rounded-2xl p-8 space-y-3 max-w-sm mx-auto shadow-2xs select-none"
          >
            <div className="h-10 w-10 bg-orange-50 border border-orange-100 text-[#B24724] rounded-xl flex items-center justify-center mx-auto text-sm">
              <Bell className="h-5 w-5" />
            </div>
            <h3 className="font-serif font-semibold text-slate-800 text-base">Inbox Empty</h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              No transactions, milestone, or application updates flagged in your timeline. Pledges secure!
            </p>
          </motion.div>
        )}

      </motion.div>

    </div>
  );
}
