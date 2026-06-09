import { UserRole } from '../types';

export type DeskTab = 'entrepreneur' | 'volunteer' | 'donor' | 'project_manager' | 'admin';

export type DashboardPanel =
  | 'desk'
  | 'explore'
  | 'project_detail'
  | 'create_campaign'
  | 'notifications'
  | 'profile'
  | 'availability';

export type PlatformAction =
  | 'donate'
  | 'volunteer_apply'
  | 'milestone_submit'
  | 'milestone_review'
  | 'create_campaign'
  | 'manage_volunteers';

const DESK_ROLE_MAP: Record<DeskTab, UserRole> = {
  entrepreneur: 'entrepreneur',
  volunteer: 'volunteer',
  donor: 'donor',
  project_manager: 'project_manager',
  admin: 'admin',
};

const PANEL_REQUIRED_ROLES: Partial<Record<DashboardPanel, UserRole[]>> = {
  create_campaign: ['entrepreneur'],
  availability: ['volunteer'],
};

const ACTION_REQUIRED_ROLES: Record<PlatformAction, UserRole[]> = {
  donate: ['donor'],
  volunteer_apply: ['volunteer'],
  milestone_submit: ['entrepreneur'],
  milestone_review: ['project_manager'],
  create_campaign: ['entrepreneur'],
  manage_volunteers: ['entrepreneur'],
};

const ROLE_LABELS: Record<UserRole, string> = {
  entrepreneur: 'Project Owner',
  donor: 'Donor',
  volunteer: 'Volunteer',
  project_manager: 'Project Manager',
  admin: 'Administrator',
};

const DESK_PRIORITY: DeskTab[] = [
  'donor',
  'volunteer',
  'entrepreneur',
  'project_manager',
  'admin',
];

export function getAllowedDesks(roles: UserRole[]): DeskTab[] {
  return DESK_PRIORITY.filter((desk) => roles.includes(DESK_ROLE_MAP[desk]));
}

export function userCanAccessDesk(roles: UserRole[], desk: DeskTab): boolean {
  return roles.includes(DESK_ROLE_MAP[desk]);
}

export function userCanAccessPanel(roles: UserRole[], panel: DashboardPanel): boolean {
  if (panel === 'desk') return roles.length > 0;
  const required = PANEL_REQUIRED_ROLES[panel];
  if (!required) return roles.length > 0;
  return required.some((r) => roles.includes(r));
}

export function userCanPerformAction(roles: UserRole[], action: PlatformAction): boolean {
  return ACTION_REQUIRED_ROLES[action].some((r) => roles.includes(r));
}

export function getDefaultDesk(roles: UserRole[]): DeskTab {
  const allowed = getAllowedDesks(roles);
  return allowed[0] ?? 'donor';
}

export function getPanelDeniedMessage(panel: DashboardPanel): string {
  const required = PANEL_REQUIRED_ROLES[panel];
  if (!required?.length) return 'You do not have permission to access this area.';
  const labels = required.map((r) => ROLE_LABELS[r]).join(' or ');
  return `This area requires the ${labels} role.`;
}

export function getActionDeniedMessage(action: PlatformAction): string {
  const labels = ACTION_REQUIRED_ROLES[action].map((r) => ROLE_LABELS[r]).join(' or ');
  return `This action requires the ${labels} role.`;
}

export function viewToPanel(view: string): DashboardPanel | undefined {
  if (view === 'dashboard' || view === 'all_dashboards') return 'desk';
  if (
    view === 'explore' ||
    view === 'project_detail' ||
    view === 'create_campaign' ||
    view === 'notifications' ||
    view === 'profile' ||
    view === 'availability'
  ) {
    return view;
  }
  return undefined;
}

export function sanitizePanelForRoles(
  roles: UserRole[],
  panel: DashboardPanel | undefined
): DashboardPanel {
  if (!panel || panel === 'desk') return 'desk';
  if (userCanAccessPanel(roles, panel)) return panel;
  return 'desk';
}
