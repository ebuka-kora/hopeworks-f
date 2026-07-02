import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { LoadingOverlayProvider } from './context/LoadingOverlayContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Index } from './pages/Index';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { EditProfile } from './pages/EditProfile';
import { Notifications } from './pages/Notifications';
import { DashboardShell } from './pages/dashboards/DashboardShell';
import { Login } from './pages/Login';
import { TermsAndPrivacy } from './pages/TermsAndPrivacy';
import { HowItWorks } from './pages/HowItWorks';
import { ProjectAvailability } from './pages/ProjectAvailability';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { pageTransition, resolveVariants, springBouncy } from './lib/motion';
import { useReducedMotion } from './hooks/useReducedMotion';
import { supabase } from './lib/supabase';
import { PulseBeatLoader } from './components/PulseBeatLoader';
import {
  getActionDeniedMessage,
  getPanelDeniedMessage,
  sanitizePanelForRoles,
  userCanAccessPanel,
  userCanPerformAction,
  viewToPanel,
} from './lib/roleAccess';
import { UserRole } from './types';
import { clearNav, readInitialNav, saveNav } from './lib/navPersistence';
import {
  clearCampaignShareUrl,
  readCampaignIdFromUrl,
  setCampaignShareUrl,
} from './lib/campaignShare';
import type { DashboardPanel, DeskTab } from './lib/roleAccess';

type ProjectDetailAction = 'donate' | 'volunteer';

type RegisterDefaults = {
  roles: UserRole[];
  redirectTo: string;
  pendingAction?: ProjectDetailAction;
};

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const initialNav = readInitialNav();
  const [view, setView] = useState<string>(initialNav.view);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialNav.selectedProjectId ?? '');
  const [dashboardPanel, setDashboardPanel] = useState<string | undefined>(initialNav.dashboardPanel);
  const [activeDesk, setActiveDesk] = useState<string | undefined>(initialNav.activeDesk);
  const [registerDefaults, setRegisterDefaults] = useState<RegisterDefaults | null>(null);
  const [projectDetailAction, setProjectDetailAction] = useState<ProjectDetailAction | null>(null);
  const [exploreSdgFilter, setExploreSdgFilter] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const WORKSPACE_VIEWS = new Set([
    'dashboard',
    'all_dashboards',
    'explore',
    'project_detail',
    'create_campaign',
    'notifications',
    'profile',
    'availability',
  ]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    if (hash.includes('type=recovery')) {
      setView('reset_password');
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setView('reset_password');
      }
      if (event === 'SIGNED_IN') {
        const hasOAuthCallback =
          window.location.hash.includes('access_token') ||
          window.location.search.includes('code=');
        if (hasOAuthCallback) {
          setView('dashboard');
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;
    const hasOAuthCallback =
      window.location.hash.includes('access_token') ||
      window.location.search.includes('code=');
    if (hasOAuthCallback) {
      setView('dashboard');
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (authLoading) return;
    if (user && (view === 'dashboard' || view === 'all_dashboards') && dashboardPanel) {
      const safe = sanitizePanelForRoles(user.roles, dashboardPanel as DashboardPanel);
      if (safe !== dashboardPanel) setDashboardPanel(safe);
    }
  }, [authLoading, user, view, dashboardPanel]);

  useEffect(() => {
    if (authLoading) return;
    const campaignId = readCampaignIdFromUrl();
    if (!campaignId) return;

    setSelectedProjectId(campaignId);
    if (user) {
      setView('dashboard');
      setDashboardPanel('project_detail');
    } else {
      setView('project_detail');
      setDashboardPanel(undefined);
    }
  }, [authLoading, user]);

  useEffect(() => {
    const isDashboard = view === 'dashboard' || view === 'all_dashboards';
    saveNav({
      view,
      dashboardPanel: isDashboard ? dashboardPanel ?? 'desk' : undefined,
      selectedProjectId: selectedProjectId || undefined,
      activeDesk: isDashboard ? activeDesk : undefined,
    });
  }, [view, dashboardPanel, selectedProjectId, activeDesk]);

  const handleDashboardStateChange = useCallback(
    ({
      panel,
      activeTab,
      selectedProjectId: projectId,
    }: {
      panel: DashboardPanel;
      activeTab: DeskTab;
      selectedProjectId: string;
    }) => {
      setDashboardPanel(panel);
      setActiveDesk(activeTab);
      setSelectedProjectId(projectId);
      if (panel === 'project_detail' && projectId) {
        setCampaignShareUrl(projectId);
      } else {
        clearCampaignShareUrl();
      }
    },
    []
  );

  const handleNavigate = (newView: string, id?: string) => {
    if (newView === 'explore') {
      const sdgNum = id && /^\d+$/.test(id) ? parseInt(id, 10) : null;
      setExploreSdgFilter(sdgNum && sdgNum >= 1 && sdgNum <= 17 ? sdgNum : null);
    } else {
      setExploreSdgFilter(null);
    }

    if (newView === 'create_campaign') {
      if (!user) {
        toast.info('Sign up as a Project Owner to create a campaign.');
        setRegisterDefaults({ roles: ['entrepreneur'], redirectTo: 'create_campaign' });
        setView('register');
        setDashboardPanel(undefined);
        if (id) setSelectedProjectId(id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (!userCanAccessPanel(user.roles, 'create_campaign')) {
        toast.warning(getPanelDeniedMessage('create_campaign'));
        setView('dashboard');
        setDashboardPanel('desk');
        if (id) setSelectedProjectId(id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      setView('dashboard');
      setDashboardPanel('create_campaign');
      if (id) setSelectedProjectId(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (newView === 'register_donor' || newView === 'register_volunteer') {
      const action: ProjectDetailAction = newView === 'register_donor' ? 'donate' : 'volunteer';
      const role: UserRole = action === 'donate' ? 'donor' : 'volunteer';
      const platformAction = action === 'donate' ? 'donate' : 'volunteer_apply';

      if (!user) {
        toast.info(
          action === 'donate'
            ? 'Sign up as a Donor to pledge to this campaign.'
            : 'Sign up as a Volunteer to apply for this campaign.'
        );
        setRegisterDefaults({ roles: [role], redirectTo: 'project_detail', pendingAction: action });
        setView('register');
        setDashboardPanel(undefined);
        if (id) setSelectedProjectId(id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (!userCanPerformAction(user.roles, platformAction)) {
        toast.warning(getActionDeniedMessage(platformAction));
        return;
      }
      setProjectDetailAction(action);
      setView('dashboard');
      setDashboardPanel('project_detail');
      if (id) setSelectedProjectId(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (newView === 'project_detail') {
      if (registerDefaults?.pendingAction) {
        setProjectDetailAction(registerDefaults.pendingAction);
      }
      setRegisterDefaults(null);

      if (user) {
        setView('dashboard');
        setDashboardPanel('project_detail');
        if (id) {
          setSelectedProjectId(id);
          setCampaignShareUrl(id);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      setView('project_detail');
      setDashboardPanel(undefined);
      if (id) {
        setSelectedProjectId(id);
        setCampaignShareUrl(id);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setRegisterDefaults(null);

    if (newView === 'home') {
      clearNav();
      clearCampaignShareUrl();
    } else if (newView !== 'project_detail') {
      clearCampaignShareUrl();
    }

    if (user && WORKSPACE_VIEWS.has(newView)) {
      setView('dashboard');
      const rawPanel = viewToPanel(newView);
      const safePanel = sanitizePanelForRoles(user.roles, rawPanel);
      setDashboardPanel(safePanel === 'desk' ? 'desk' : safePanel);
      if (id) setSelectedProjectId(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setView(newView);
    setDashboardPanel(undefined);
    if (id) setSelectedProjectId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isDashboardView = view === 'dashboard' || view === 'all_dashboards';
  const isAuthView =
    view === 'login' ||
    view === 'register' ||
    view === 'forgot_password' ||
    view === 'reset_password';
  const isFullHeightView = isDashboardView || isAuthView;
  const reducedMotion = useReducedMotion();
  const pageVariants = resolveVariants(pageTransition, reducedMotion);

  return (
    <div className={`bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white ${
      isFullHeightView
        ? 'h-dvh max-h-dvh overflow-hidden'
        : 'min-h-screen justify-between'
    }`}>
      {authLoading && !user && <PulseBeatLoader message="Verifying your session" />}

      {/* NAVBAR */}
      {view !== 'home' && view !== 'dashboard' && view !== 'all_dashboards' && view !== 'login' && view !== 'register' && view !== 'forgot_password' && view !== 'reset_password' && (
        <Navbar onNavigate={handleNavigate} currentView={view} />
      )}

      {/* CORE PAGES CANVAS WITH TRANSITIONS */}
      <main className={`flex-1 min-h-0 ${isFullHeightView ? 'flex flex-col overflow-hidden' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={view + (selectedProjectId || '')}
            className={isFullHeightView ? 'flex flex-1 flex-col min-h-0 h-full' : 'h-full'}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={reducedMotion ? { duration: 0 } : springBouncy}
          >
            {view === 'home' && <Index onNavigate={handleNavigate} />}
            {view === 'explore' && (
              <Projects onNavigate={handleNavigate} initialSdg={exploreSdgFilter} />
            )}
            {view === 'project_detail' && (
              <ProjectDetail
                projectId={selectedProjectId}
                onNavigate={handleNavigate}
                initialAction={projectDetailAction}
                onInitialActionConsumed={() => setProjectDetailAction(null)}
              />
            )}
            {view === 'profile' && <EditProfile />}
            {view === 'notifications' && <Notifications onNavigate={handleNavigate} />}
            {(view === 'dashboard' || view === 'all_dashboards') && (
              !user ? (
                <Login mode="login" onNavigate={handleNavigate} />
              ) : (
                <DashboardShell
                  onNavigate={handleNavigate}
                  initialPanel={
                    (dashboardPanel as
                      | 'desk'
                      | 'explore'
                      | 'project_detail'
                      | 'create_campaign'
                      | 'notifications'
                      | 'profile'
                      | 'availability'
                      | undefined) ?? 'desk'
                  }
                  initialExploreSdg={exploreSdgFilter}
                  onClearExploreSdg={() => setExploreSdgFilter(null)}
                  initialActiveTab={activeDesk as DeskTab | undefined}
                  initialProjectId={selectedProjectId || undefined}
                  initialProjectAction={projectDetailAction}
                  onProjectActionConsumed={() => setProjectDetailAction(null)}
                  onDashboardStateChange={handleDashboardStateChange}
                />
              )
            )}
            {(view === 'login' || view === 'register') && (
              <Login
                mode={view as 'login' | 'register'}
                onNavigate={handleNavigate}
                preselectedRoles={registerDefaults?.roles}
                redirectAfterAuth={registerDefaults?.redirectTo}
              />
            )}
            {view === 'terms' && (
              <TermsAndPrivacy initialTab="terms" onNavigate={handleNavigate} />
            )}
            {view === 'privacy' && (
              <TermsAndPrivacy initialTab="privacy" onNavigate={handleNavigate} />
            )}
            {view === 'how_it_works' && (
              <HowItWorks onNavigate={handleNavigate} />
            )}
            {view === 'availability' && (
              <ProjectAvailability onNavigate={handleNavigate} initialProjectId={selectedProjectId} />
            )}
            {view === 'forgot_password' && (
              <ForgotPassword onNavigate={handleNavigate} />
            )}
            {view === 'reset_password' && (
              <ResetPassword onNavigate={handleNavigate} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      {!isFullHeightView && (
        <Footer onNavigate={handleNavigate} />
      )}

      {/* BACK TO TOP BUTTON */}
      <AnimatePresence>
        {showScrollTop && !isDashboardView && (
          <motion.button
            id="back-to-top-btn"
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={scrollToTop}
            title="Scroll to Top"
            aria-label="Scroll to Top"
            className="fixed bottom-6 right-6 z-[100] p-3 bg-white text-[#B24724] border border-slate-200 hover:border-[#B24724]/50 hover:bg-[#B24724]/5 rounded-full cursor-pointer shadow-md transition-all flex items-center justify-center group focus:outline-none"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUp className="h-5 w-5 group-hover:-translate-y-0.5 transition-transform" strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function App() {
  return (
    <div className="h-full min-h-0">
      <AuthProvider>
        <NotificationsProvider>
          <LoadingOverlayProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </LoadingOverlayProvider>
        </NotificationsProvider>
      </AuthProvider>
    </div>
  );
}
