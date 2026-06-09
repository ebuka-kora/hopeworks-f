import React, { useState } from 'react';
import { motion } from 'motion/react';
import { springDashboard } from '../../lib/motion';
import { useAuth } from '../../context/AuthContext';
import { useApplicationsStore } from '../../hooks/useApplicationsStore';
import { BadgeCard, Badge } from '../../components/BadgeCard';
import {
  DashboardPageHeader,
  DashboardTabs,
  DashboardToolbar,
  DashboardCardGrid,
  TrackingCard,
  formatProjectCode,
} from '../../components/dashboard/DashboardUI';
import { Award } from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string, id?: string) => void;
}

export function VolunteerDashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const { listByVolunteer } = useApplicationsStore();

  const myApplications = user ? listByVolunteer(user.id) : [];

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSegment, setActiveSegment] = useState<'all' | 'approved' | 'pending' | 'badges'>('all');

  const badgeTypeFromProject = (name: string): Badge['type'] => {
    const lower = name.toLowerCase();
    if (lower.includes('water') || lower.includes('reservoir')) return 'water_guardian';
    if (lower.includes('coral') || lower.includes('reef')) return 'coral_conservationist';
    if (lower.includes('eco') || lower.includes('school') || lower.includes('literacy')) return 'eco_scholar';
    return 'universal_giver';
  };

  const derivedBadges: Badge[] = myApplications
    .filter(a => a.status === 'approved')
    .map((app) => ({
      id: `badge-${app.id}`,
      type: badgeTypeFromProject(app.projectName),
      title: `${badgeTypeFromProject(app.projectName).split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Badge`,
      description: `Recognized sweat equity contribution to "${app.projectName}".`,
      recipientName: user?.name || 'Volunteer',
      recipientRole: 'Volunteer',
      projectName: app.projectName,
      dateAwarded: app.createdAt,
      serialNumber: `HW-${app.projectId.slice(0, 6).toUpperCase()}`,
    }));

  const approvedCount = myApplications.filter(a => a.status === 'approved').length;
  const pendingCount = myApplications.filter(a => a.status === 'pending' || !a.status).length;

  // Filter application list
  const filteredApps = myApplications.filter((app) => {
    const matchesSearch = app.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          app.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeSegment === 'approved') return matchesSearch && app.status === 'approved';
    if (activeSegment === 'pending') return matchesSearch && (app.status === 'pending' || !app.status);
    return matchesSearch;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={springDashboard} className="select-none">
      <DashboardPageHeader
        title="Volunteer shifts"
        count={myApplications.length}
        countLabel="applications"
        actionLabel="Find project"
        onAction={() => onNavigate('explore')}
      />

      <DashboardTabs
        activeId={activeSegment}
        onChange={(id) => setActiveSegment(id as typeof activeSegment)}
        tabs={[
          { id: 'all', label: 'All', count: myApplications.length },
          { id: 'approved', label: 'Matched', count: approvedCount },
          { id: 'pending', label: 'Waiting', count: pendingCount },
          { id: 'badges', label: 'Badges', count: derivedBadges.length },
        ]}
      />

      {activeSegment === 'badges' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {derivedBadges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
          {derivedBadges.length === 0 && (
            <p className="col-span-full text-center py-12 text-slate-400 text-sm">Complete approved shifts to earn badges.</p>
          )}
        </div>
      ) : (
        <>
          <DashboardToolbar
            search={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search shifts..."
          />

          <DashboardCardGrid
            isEmpty={filteredApps.length === 0}
            emptyMessage="No volunteer applications yet. Browse projects to sign up."
          >
            {filteredApps.map((app) => {
              const isApproved = app.status === 'approved';
              return (
                <TrackingCard
                  key={app.id}
                  status={isApproved ? 'active' : 'pending'}
                  statusLabel={isApproved ? 'Matched' : 'Awaiting review'}
                  timeLabel={app.dates[0] || 'Flexible'}
                  code={formatProjectCode(app.id)}
                  title={app.projectName}
                  route={app.skills.slice(0, 2).join(' · ') || 'General volunteer'}
                  metrics={[
                    { label: 'Skills', value: `${app.skills.length} listed` },
                    { label: 'Shifts', value: `${app.dates.length} dates` },
                  ]}
                  timeline={app.dates.slice(0, 3).length ? app.dates.slice(0, 3) : ['Applied', 'Review', 'Matched']}
                  progress={isApproved ? 100 : 35}
                  onClick={() => onNavigate('project_detail', app.projectId)}
                />
              );
            })}
          </DashboardCardGrid>
        </>
      )}
    </motion.div>
  );
}
