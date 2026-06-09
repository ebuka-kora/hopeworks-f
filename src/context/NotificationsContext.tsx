import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiFetch } from '../lib/apiClient';
import { Notification } from '../types';
import { useAuth } from './AuthContext';

interface NotificationsContextType {
  notifications: Notification[];
  loading: boolean;
  unreadCount: number;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch<Notification[]>('/api/notifications');
      setNotifications(data);
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markAsRead = useCallback(
    async (id: string) => {
      let wasUnread = false;
      setNotifications((prev) =>
        prev.map((n) => {
          if (n.id === id && !n.isRead) {
            wasUnread = true;
            return { ...n, isRead: true };
          }
          return n;
        })
      );
      if (!wasUnread) return;

      try {
        await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      } catch (e) {
        console.error('Failed to mark notification read:', e);
        await refresh();
      }
    },
    [refresh]
  );

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await apiFetch('/api/notifications/read-all', { method: 'PATCH' });
    } catch (e) {
      console.error('Failed to mark all notifications read:', e);
      await refresh();
    }
  }, [refresh]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      loading,
      unreadCount,
      refresh,
      markAsRead,
      markAllAsRead,
    }),
    [notifications, loading, unreadCount, refresh, markAsRead, markAllAsRead]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error('useNotificationsContext must be used within NotificationsProvider');
  }
  return ctx;
}
