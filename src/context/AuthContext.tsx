import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { apiFetch, apiPublicFetch, apiUpload } from '../lib/apiClient';
import { DEMO_ACCOUNTS } from '../lib/demoAccounts';

interface AuthContextType {
  user: UserProfile | null;
  users: UserProfile[];
  loading: boolean;
  login: (email: string, passwordString: string) => Promise<UserProfile>;
  signUp: (email: string, name: string, selectedRoles: UserRole[], password: string) => Promise<UserProfile>;
  loginSimulatedUser: (userId: string) => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  uploadGovId: (base64Data: string, fileName?: string, contentType?: string) => Promise<void>;
  verifyUser: (userId: string, action: 'approve' | 'reject') => Promise<void>;
  allPms: UserProfile[];
  setUserRoles: (userId: string, roles: UserRole[]) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const ensureProfileInFlight = useRef<Promise<UserProfile | null> | null>(null);
  const loginInProgress = useRef(false);

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await apiFetch<UserProfile>('/api/auth/me');
      setUser(profile);
      return profile;
    } catch {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) setUser(null);
      return null;
    }
  }, []);

  const ensureProfile = useCallback(async () => {
    if (ensureProfileInFlight.current) {
      return ensureProfileInFlight.current;
    }

    const promise = (async () => {
      let profile = await fetchProfile();
      if (profile) return profile;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const u = session.user;
      const meta = u.user_metadata || {};
      const name =
        meta.full_name ||
        meta.name ||
        u.email?.split('@')[0] ||
        'User';

      await apiFetch('/api/auth/setup-profile', {
        method: 'POST',
        body: JSON.stringify({
          email: u.email,
          name,
          roles: meta.roles || ['donor'],
        }),
      });

      profile = await fetchProfile();
      return profile;
    })();

    ensureProfileInFlight.current = promise;
    try {
      return await promise;
    } finally {
      if (ensureProfileInFlight.current === promise) {
        ensureProfileInFlight.current = null;
      }
    }
  }, [fetchProfile]);

  const refreshUsers = useCallback(async () => {
    try {
      const allUsers = await apiFetch<UserProfile[]>('/api/users');
      setUsers(allUsers);
    } catch {
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const p = await ensureProfile();
        if (p?.roles.includes('admin')) await refreshUsers();
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUsers([]);
        setLoading(false);
        return;
      }

      if (!session || (event !== 'INITIAL_SESSION' && event !== 'SIGNED_IN')) return;
      if (loginInProgress.current && event === 'SIGNED_IN') return;

      // Defer async auth work — calling supabase.auth inside this callback deadlocks signInWithPassword.
      setTimeout(() => {
        void (async () => {
          setLoading(true);
          try {
            const p = await ensureProfile();
            if (p?.roles.includes('admin')) await refreshUsers();
          } finally {
            setLoading(false);
          }
        })();
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, [ensureProfile, refreshUsers]);

  const login = async (email: string, passwordString: string): Promise<UserProfile> => {
    loginInProgress.current = true;
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: passwordString,
      });
      if (error) throw new Error(error.message);

      const profile = await ensureProfile();
      if (!profile) {
        throw new Error('Profile not found after login. Run `cd backend && npm run seed` if using demo accounts.');
      }
      if (profile.roles.includes('admin')) await refreshUsers();
      return profile;
    } finally {
      loginInProgress.current = false;
    }
  };

  const signUp = async (email: string, name: string, selectedRoles: UserRole[], password: string): Promise<UserProfile> => {
    const selfSelected = selectedRoles.filter(r => ['entrepreneur', 'volunteer', 'donor'].includes(r));
    if (selfSelected.length > 2) {
      throw new Error('Validation Error: Users can select up to a maximum of 2 roles during self-sign up.');
    }
    if (selfSelected.length === 0) {
      throw new Error('Validation Error: Please select at least one role.');
    }

    const normalizedEmail = email.toLowerCase();
    let accountAlreadyExists = false;

    try {
      await apiPublicFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: normalizedEmail,
          password,
          name,
          roles: selectedRoles,
        }),
      });
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      const message = err instanceof Error ? err.message : '';
      if (status === 409) {
        accountAlreadyExists = true;
      } else if (message.toLowerCase().includes('rate limit')) {
        throw new Error(
          'Too many signup attempts. Wait a few minutes, or sign in if you already created an account.'
        );
      } else {
        throw err instanceof Error ? err : new Error('Registration failed.');
      }
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    if (signInError) {
      const msg = signInError.message.toLowerCase();
      if (msg.includes('rate limit') || msg.includes('429')) {
        throw new Error('Too many attempts. Please wait a few minutes and try signing in.');
      }
      if (msg.includes('confirm')) {
        throw new Error('Please verify your email, then sign in.');
      }
      throw new Error(
        accountAlreadyExists
          ? 'An account with this email already exists. Check your password or use Forgot Password.'
          : signInError.message
      );
    }

    const session = signInData.session;
    if (!session?.access_token) {
      throw new Error('Could not establish a session after signup. Please sign in manually.');
    }

    if (accountAlreadyExists) {
      await apiFetch('/api/auth/setup-profile', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ email: normalizedEmail, name, roles: selectedRoles }),
      });
    }

    const profile = await fetchProfile();
    if (!profile) throw new Error('Profile not found after signup');
    return profile;
  };

  const signInWithOAuth = async (provider: 'google' | 'apple') => {
    const redirectTo = window.location.origin;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data?.url) {
      throw new Error(
        `${provider === 'google' ? 'Google' : 'Apple'} sign-in is not configured. Enable the provider in Supabase Dashboard → Authentication → Providers.`
      );
    }

    window.location.assign(data.url);
  };

  const loginSimulatedUser = async (simKey: string) => {
    const demo = DEMO_ACCOUNTS[simKey];
    if (demo) {
      await login(demo.email, demo.password);
      return;
    }
    const found = users.find(u => u.id === simKey);
    if (found) {
      const byEmail = Object.values(DEMO_ACCOUNTS).find(d => d.email === found.email);
      if (byEmail) await login(byEmail.email, byEmail.password);
      return;
    }
    throw new Error('Demo account not found. Use email login or run npm run seed.');
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUsers([]);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = await apiFetch<UserProfile>(`/api/users/${user.id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    setUser(updated);
    setUsers(prev => prev.map(u => (u.id === user.id ? updated : u)));
  };

  const uploadGovId = async (base64Data: string, fileName = 'gov-id', contentType = 'application/octet-stream') => {
    if (!user) return;
    const { url } = await apiUpload('gov-ids', fileName, base64Data, contentType);
    await updateProfile({ govIdUrl: url, verificationStatus: 'pending' });
  };

  const verifyUser = async (userId: string, action: 'approve' | 'reject') => {
    const updated = await apiFetch<UserProfile>(`/api/users/${userId}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    });
    setUsers(prev => prev.map(u => (u.id === userId ? updated : u)));
    if (user?.id === userId) setUser(updated);
  };

  const setUserRoles = async (userId: string, roles: UserRole[]) => {
    const updated = await apiFetch<UserProfile>(`/api/users/${userId}/roles`, {
      method: 'PATCH',
      body: JSON.stringify({ roles }),
    });
    setUsers(prev => prev.map(u => (u.id === userId ? updated : u)));
    if (user?.id === userId) setUser(updated);
  };

  const allPms = users.filter(u => u.roles.includes('project_manager'));

  return (
    <AuthContext.Provider value={{
      user,
      users,
      loading,
      login,
      signUp,
      loginSimulatedUser,
      signInWithOAuth,
      logout,
      updateProfile,
      uploadGovId,
      verifyUser,
      allPms,
      setUserRoles,
      refreshUsers,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
