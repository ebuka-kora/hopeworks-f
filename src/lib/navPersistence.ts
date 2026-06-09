export type SavedNav = {
  view: string;
  dashboardPanel?: string;
  selectedProjectId?: string;
  activeDesk?: string;
};

const STORAGE_KEY = 'hopeworks_nav';

export function loadNav(): SavedNav | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedNav;
  } catch {
    return null;
  }
}

export function saveNav(nav: SavedNav): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nav));
  } catch {
    // ignore quota / private mode errors
  }
}

export function clearNav(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function readInitialNav(): SavedNav {
  if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
    return { view: 'reset_password' };
  }
  return loadNav() ?? { view: 'home' };
}
