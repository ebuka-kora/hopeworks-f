import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { dashboardPanelVariants, resolveVariants, springBouncy } from '../../lib/motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useAuth } from '../../context/AuthContext';
import { PulseBeatLoader } from '../../components/PulseBeatLoader';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useProjectsStore } from '../../hooks/useProjectsStore';
import { EntrepreneurDashboard } from './EntrepreneurDashboard';
import { VolunteerDashboard } from './VolunteerDashboard';
import { DonorDashboard } from './DonorDashboard';
import { ProjectManagerDashboard, type PmSegment } from './ProjectManagerDashboard';
import { useAssignmentsStore } from '../../hooks/useAssignmentsStore';
import { useNotificationsStore } from '../../hooks/useNotificationsStore';
import { AdminDashboard, type AdminSegment } from './AdminDashboard';
import { useAuditLogsStore } from '../../hooks/useAuditLogsStore';
import { Projects } from '../Projects';
import { ProjectDetail } from '../ProjectDetail';
import { CreateCampaign } from '../CreateCampaign';
import { Notifications } from '../Notifications';
import { EditProfile } from '../EditProfile';
import { ProjectAvailability } from '../ProjectAvailability';
import { Logo } from '../../components/Logo';
import { RoleGate } from '../../components/RoleGate';
import { useToast } from '../../context/ToastContext';
import {
  type DashboardPanel,
  type DeskTab,
  getAllowedDesks,
  getDefaultDesk,
  getPanelDeniedMessage,
  userCanAccessDesk,
  userCanAccessPanel,
} from '../../lib/roleAccess';
import {
  ShieldCheck,
  Layers,
  ClipboardCheck,
  Heart,
  Award,
  LogOut,
  Menu,
  X,
  Bell,
  Compass,
  Plus,
  ChevronLeft,
  UserCheck,
  AppWindow,
  Users,
  ScrollText,
  Briefcase,
  Clock,
  CheckCircle2,
} from 'lucide-react';

type RoleTab = DeskTab;

type ProjectDetailAction = 'donate' | 'volunteer';

interface DashboardShellProps {
  onNavigate: (view: string, id?: string) => void;
  initialPanel?: DashboardPanel;
  initialProjectId?: string;
  initialProjectAction?: ProjectDetailAction | null;
  onProjectActionConsumed?: () => void;
}

const PANEL_TITLES: Record<Exclude<DashboardPanel, 'desk'>, string> = {
  explore: 'Explore Projects',
  project_detail: 'Project Details',
  create_campaign: 'Create Campaign',
  notifications: 'Notifications',
  profile: 'My Profile',
  availability: 'Volunteer Availability',
};

function sidebarNavClass(active: boolean) {
  return `w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border-l-[3px] ${
    active
      ? 'border-[#B24724] bg-[#FFEDD5]/50 text-[#9A3412]'
      : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
  }`;
}

function adminSegmentBadgeClass(segment: AdminSegment) {
  switch (segment) {
    case 'campaign_desk':
      return 'bg-orange-50 text-[#B24724]';
    case 'roles_desk':
      return 'bg-purple-50 text-violet-700';
    default:
      return 'bg-slate-100 text-slate-500';
  }
}

function pmSegmentBadgeClass(segment: PmSegment) {
  switch (segment) {
    case 'pending':
      return 'bg-orange-50 text-[#B24724]';
    case 'completed':
      return 'bg-amber-50 text-[#9A3412]';
    default:
      return 'bg-slate-100 text-slate-500';
  }
}

export function DashboardShell({
  onNavigate,
  initialPanel,
  initialProjectId,
  initialProjectAction,
  onProjectActionConsumed,
}: DashboardShellProps) {
  const { user, logout, loading, users: allUsers } = useAuth();
  const { unreadCount } = useNotificationsStore(user?.id);
  const reducedMotion = useReducedMotion();
  const panelVariants = resolveVariants(dashboardPanelVariants, reducedMotion);
  const { projects, loading: projectsLoading } = useProjectsStore();
  const isAdmin = Boolean(user?.roles.includes('admin'));
  const { logs: auditLogs } = useAuditLogsStore(isAdmin);
  const { listByPm } = useAssignmentsStore();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<RoleTab>(() =>
    user?.roles.length ? getDefaultDesk(user.roles) : 'donor'
  );
  const [panel, setPanel] = useState<DashboardPanel>(initialPanel || 'desk');
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId || '');
  const panelKey = panel === 'desk' ? `desk-${activeTab}` : `${panel}-${selectedProjectId || ''}`;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [adminSegment, setAdminSegment] = useState<AdminSegment>('id_queue');
  const [pmSegment, setPmSegment] = useState<PmSegment>('all');

  const isAdminDesk = activeTab === 'admin';
  const isPmDesk = activeTab === 'project_manager';

  const pmAssignments = user ? listByPm(user.id) : [];
  const pmProjects = pmAssignments
    .map((a) => projects.find((p) => p.id === a.projectId))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const pmAuditQueueCount = pmProjects.filter((p) =>
    p.milestones.some((m) => m.status === 'submitted')
  ).length;
  const pmCompletedCount = pmProjects.filter((p) => p.status === 'completed').length;

  const pmDeskItems: {
    id: PmSegment;
    label: string;
    count: number;
    icon: typeof Briefcase;
  }[] = [
    { id: 'all', label: 'All Assignments', count: pmProjects.length, icon: Briefcase },
    { id: 'pending', label: 'Auditing Queue', count: pmAuditQueueCount, icon: Clock },
    { id: 'completed', label: 'Fully Cleared', count: pmCompletedCount, icon: CheckCircle2 },
  ];
  const adminVerificationCount = allUsers.filter((u) => u.verificationStatus === 'pending').length;
  const adminTotalCampaigns = projects.filter(
    (p) => p.status === 'pending' || p.status === 'active' || p.status === 'completed'
  ).length;

  const adminDeskItems: {
    id: AdminSegment;
    label: string;
    count: number;
    icon: typeof UserCheck;
  }[] = [
    { id: 'id_queue', label: 'Identity Registries Desk', count: adminVerificationCount, icon: UserCheck },
    { id: 'campaign_desk', label: 'Campaign Launch Valuations', count: adminTotalCampaigns, icon: AppWindow },
    { id: 'roles_desk', label: 'Civic Roles Desk', count: allUsers.length, icon: Users },
    { id: 'audit_desk', label: 'Audit Trail Desk', count: auditLogs.length, icon: ScrollText },
  ];

  useEffect(() => {
    if (!user?.roles.length) return;
    setActiveTab((current) =>
      userCanAccessDesk(user.roles, current) ? current : getDefaultDesk(user.roles)
    );
    setPanel((current) =>
      userCanAccessPanel(user.roles, current) ? current : 'desk'
    );
  }, [user?.roles, user?.id]);

  useEffect(() => {
    if (initialPanel && user && userCanAccessPanel(user.roles, initialPanel)) {
      setPanel(initialPanel);
    } else if (initialPanel) {
      setPanel('desk');
    }
    if (initialProjectId) setSelectedProjectId(initialProjectId);
  }, [initialPanel, initialProjectId, user?.id]);

  const goToDesk = useCallback((tab?: RoleTab) => {
    if (tab && user && !userCanAccessDesk(user.roles, tab)) {
      addToast({
        title: 'Access restricted',
        description: `You do not have access to this desk.`,
        type: 'error',
      });
      return;
    }
    if (tab) setActiveTab(tab);
    setPanel('desk');
    setMobileOpen(false);
  }, [user, addToast]);

  const handleConfirmLogout = useCallback(async () => {
    setShowLogoutConfirm(false);
    setLoggingOut(true);
    try {
      await logout();
      onNavigate('home');
    } finally {
      setLoggingOut(false);
    }
  }, [logout, onNavigate]);

  const navigateToPanel = useCallback(
    (target: DashboardPanel) => {
      if (!user) return;
      if (!userCanAccessPanel(user.roles, target)) {
        addToast({
          title: 'Access restricted',
          description: getPanelDeniedMessage(target),
          type: 'error',
        });
        setPanel('desk');
        return;
      }
      setPanel(target);
      setMobileOpen(false);
    },
    [user, addToast]
  );

  const handleDashboardNavigate = useCallback(
    (view: string, id?: string) => {
      if (id) setSelectedProjectId(id);

      switch (view) {
        case 'dashboard':
        case 'all_dashboards':
          navigateToPanel('desk');
          break;
        case 'explore':
          navigateToPanel('explore');
          break;
        case 'project_detail':
          navigateToPanel('project_detail');
          break;
        case 'create_campaign':
          navigateToPanel('create_campaign');
          break;
        case 'notifications':
          navigateToPanel('notifications');
          break;
        case 'profile':
          navigateToPanel('profile');
          break;
        case 'availability':
          navigateToPanel('availability');
          break;
        case 'home':
          onNavigate('home');
          return;
        default:
          break;
      }
    },
    [navigateToPanel, onNavigate]
  );

  if (loading) return <PulseBeatLoader message="Verifying your session" />;
  if (!user) return null;

  const tabs = [
    { id: 'donor' as const, label: 'Donor Desk', roleName: 'donor', category: 'MY IMPACT', icon: Heart },
    { id: 'volunteer' as const, label: 'Volunteer', roleName: 'volunteer', category: 'MY IMPACT', icon: Award },
    { id: 'entrepreneur' as const, label: 'Campaigns', roleName: 'entrepreneur', category: 'PROJECTS', icon: Layers },
    { id: 'project_manager' as const, label: 'Audits', roleName: 'project_manager', category: 'GOVERNANCE', icon: ClipboardCheck },
    { id: 'admin' as const, label: 'Admin', roleName: 'admin', category: 'GOVERNANCE', icon: ShieldCheck },
  ];

  const filteredTabs = tabs.filter((tab) =>
    user.roles.includes(tab.roleName as typeof user.roles[number])
  );

  const navGroups = ['MY IMPACT', 'PROJECTS', 'GOVERNANCE'] as const;
  const canCreateCampaign = user.roles.includes('entrepreneur');

  const primaryRole =
    user.roles.includes('admin') ? 'Administrator' :
    user.roles.includes('project_manager') ? 'Project Manager' :
    user.roles.includes('entrepreneur') ? 'Project Owner' :
    user.roles.includes('volunteer') ? 'Volunteer' :
    'Donor';

  const needsProjectsData =
    panel === 'desk' ||
    panel === 'explore' ||
    panel === 'project_detail' ||
    panel === 'availability';

  const renderDesk = () => {
    const deskRoleMap: Record<RoleTab, typeof user.roles[number]> = {
      entrepreneur: 'entrepreneur',
      volunteer: 'volunteer',
      donor: 'donor',
      project_manager: 'project_manager',
      admin: 'admin',
    };
    const requiredRole = deskRoleMap[activeTab];

    if (!userCanAccessDesk(user.roles, activeTab)) {
      return (
        <RoleGate
          allowedRoles={[requiredRole]}
          userRoles={user.roles}
          message={`The ${tabs.find((t) => t.id === activeTab)?.label ?? 'desk'} requires the ${requiredRole.replace('_', ' ')} role.`}
        />
      );
    }

    switch (activeTab) {
      case 'entrepreneur':
        return <EntrepreneurDashboard onNavigate={handleDashboardNavigate} />;
      case 'volunteer':
        return <VolunteerDashboard onNavigate={handleDashboardNavigate} />;
      case 'donor':
        return <DonorDashboard onNavigate={handleDashboardNavigate} />;
      case 'project_manager':
        return (
          <ProjectManagerDashboard
            onNavigate={handleDashboardNavigate}
            activeSegment={pmSegment}
            onSegmentChange={setPmSegment}
          />
        );
      case 'admin':
        return (
          <AdminDashboard
            activeSegment={adminSegment}
            onSegmentChange={setAdminSegment}
          />
        );
      default:
        return null;
    }
  };

  const renderPanel = () => {
    if (!userCanAccessPanel(user.roles, panel)) {
      return (
        <RoleGate
          allowedRoles={[]}
          userRoles={user.roles}
          message={getPanelDeniedMessage(panel)}
        />
      );
    }

    switch (panel) {
      case 'explore':
        return <Projects onNavigate={handleDashboardNavigate} />;
      case 'project_detail':
        return (
          <ProjectDetail
            projectId={selectedProjectId}
            onNavigate={handleDashboardNavigate}
            initialAction={initialProjectAction}
            onInitialActionConsumed={onProjectActionConsumed}
          />
        );
      case 'create_campaign':
        return (
          <RoleGate allowedRoles={['entrepreneur']} userRoles={user.roles}>
            <CreateCampaign onNavigate={handleDashboardNavigate} />
          </RoleGate>
        );
      case 'notifications':
        return <Notifications onNavigate={handleDashboardNavigate} />;
      case 'profile':
        return <EditProfile />;
      case 'availability':
        return (
          <RoleGate allowedRoles={['volunteer']} userRoles={user.roles}>
            <ProjectAvailability
              onNavigate={handleDashboardNavigate}
              initialProjectId={selectedProjectId}
            />
          </RoleGate>
        );
      case 'desk':
      default:
        return renderDesk();
    }
  };

  return (
    <div className="dashboard-compact h-full min-h-0 w-full bg-[#FAF9F6] flex flex-col md:flex-row select-none overflow-hidden relative">
      {loggingOut && <PulseBeatLoader message="Signing out" />}

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Sign out of HopeWorks?"
        message="You will leave your workspace and return to the public site. Any unsaved changes may be lost."
        confirmLabel="Sign out"
        cancelLabel="Stay signed in"
        variant="danger"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <div className="md:hidden bg-white px-4 py-3 border-b border-slate-200 flex justify-between items-center z-30 shrink-0">
        <Logo iconSize={28} showText />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg border border-slate-200 text-slate-600"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      <motion.aside
        initial={false}
        animate={{ x: mobileOpen ? 0 : 0 }}
        className={`${
          mobileOpen ? 'block' : 'hidden'
        } md:flex md:flex-col w-full md:w-[220px] md:h-full bg-white border-r border-slate-200 shrink-0 z-20 min-h-0`}
      >
        <div
          className="p-3 hidden md:block cursor-pointer"
          onClick={() => goToDesk()}
          title="Workspace home"
        >
          <Logo iconSize={26} />
        </div>

        <nav className="flex-grow px-2 space-y-4 overflow-y-auto min-h-0 mt-2">
          {navGroups.map((group) => {
            const groupTabs = filteredTabs.filter((t) => t.category === group);
            if (!groupTabs.length) return null;

            return (
              <div key={group}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
                  {group}
                </p>
                <div className="space-y-0.5">
                  {groupTabs.map((tab) => {
                    const isActive = panel === 'desk' && activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => goToDesk(tab.id)}
                        className={sidebarNavClass(isActive)}
                      >
                        <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-[#B24724]' : 'text-slate-400'}`} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {user.roles.includes('project_manager') && isPmDesk && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
                Audit Desk
              </p>
              <div className="space-y-0.5">
                {pmDeskItems.map((item) => {
                  const isActive = pmSegment === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setPanel('desk');
                        setActiveTab('project_manager');
                        setPmSegment(item.id);
                        setMobileOpen(false);
                      }}
                      className={`${sidebarNavClass(isActive)} justify-between`}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-[#B24724]' : 'text-slate-400'}`} />
                        <span className="truncate text-left leading-snug">{item.label}</span>
                      </span>
                      <span
                        className={`shrink-0 font-mono px-1.5 py-0.5 rounded-full text-[9px] font-bold ${pmSegmentBadgeClass(item.id)}`}
                      >
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {user.roles.includes('admin') && isAdminDesk && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
                Administration
              </p>
              <div className="space-y-0.5">
                {adminDeskItems.map((item) => {
                  const isActive = adminSegment === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setPanel('desk');
                        setActiveTab('admin');
                        setAdminSegment(item.id);
                        setMobileOpen(false);
                      }}
                      className={`${sidebarNavClass(isActive)} justify-between`}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-[#B24724]' : 'text-slate-400'}`} />
                        <span className="truncate text-left leading-snug">{item.label}</span>
                      </span>
                      <span
                        className={`shrink-0 font-mono px-1.5 py-0.5 rounded-full text-[9px] font-bold ${adminSegmentBadgeClass(item.id)}`}
                      >
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
              Workspace
            </p>
            <button
              onClick={() => handleDashboardNavigate('explore')}
              className={sidebarNavClass(panel === 'explore')}
            >
              <Compass className={`h-3.5 w-3.5 shrink-0 ${panel === 'explore' ? 'text-[#B24724]' : 'text-slate-400'}`} />
              Explore Projects
            </button>
            {canCreateCampaign && (
              <button
                onClick={() => handleDashboardNavigate('create_campaign')}
                className={sidebarNavClass(panel === 'create_campaign')}
              >
                <Plus className={`h-3.5 w-3.5 shrink-0 ${panel === 'create_campaign' ? 'text-[#B24724]' : 'text-slate-400'}`} />
                Create Campaign
              </button>
            )}
            <button
              onClick={() => handleDashboardNavigate('notifications')}
              className={sidebarNavClass(panel === 'notifications')}
            >
              <Bell className={`h-3.5 w-3.5 shrink-0 ${panel === 'notifications' ? 'text-[#B24724]' : 'text-slate-400'}`} />
              Notifications
            </button>
            {user.roles.includes('volunteer') && (
              <button
                onClick={() => handleDashboardNavigate('availability')}
                className={sidebarNavClass(panel === 'availability')}
              >
                <Award className={`h-3.5 w-3.5 shrink-0 ${panel === 'availability' ? 'text-[#B24724]' : 'text-slate-400'}`} />
                My Availability
              </button>
            )}
          </div>
        </nav>

        <div className="p-3 border-t border-slate-200 mt-auto shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDashboardNavigate('profile')}
              className="flex items-center gap-2 flex-1 min-w-0 hover:bg-slate-50 rounded-lg p-1 transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-full bg-[#B24724] text-white flex items-center justify-center text-xs font-bold shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-grow">
                <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{primaryRole}</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="p-1.5 text-slate-400 hover:text-[#B24724] rounded-lg hover:bg-orange-50 cursor-pointer shrink-0"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.aside>

      <main className="flex-grow flex flex-col min-w-0 min-h-0 overflow-hidden">
        <header className="h-10 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {panel !== 'desk' && (
              <>
                <button
                  onClick={() => goToDesk()}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-[#B24724] hover:bg-slate-50 rounded-lg cursor-pointer shrink-0"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Desk
                </button>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-semibold text-slate-800 truncate">
                  {PANEL_TITLES[panel]}
                </span>
              </>
            )}
          </div>
          <button
            onClick={() => handleDashboardNavigate('notifications')}
            className={`relative p-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
              panel === 'notifications'
                ? 'text-[#B24724] bg-orange-50'
                : 'text-slate-500 hover:text-[#B24724] hover:bg-slate-50'
            }`}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={springBouncy}
                className="absolute -top-0.5 -right-0.5 bg-[#B24724] text-white font-sans text-[8px] font-bold leading-none min-w-[14px] h-[14px] px-0.5 rounded-full flex items-center justify-center ring-2 ring-white"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto min-h-0 bg-[#FAF9F6]">
          {needsProjectsData && projectsLoading ? (
            <PulseBeatLoader message="Loading workspace" fullScreen={false} />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={panelKey}
                variants={panelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className={panel === 'desk' ? 'p-4 sm:p-5' : 'p-0'}
              >
                {renderPanel()}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}
