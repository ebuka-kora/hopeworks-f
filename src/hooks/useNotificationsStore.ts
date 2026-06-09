import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/apiClient';
import { Notification } from '../types';

export function useNotificationsStore(userId?: string) {
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

  useEffect(() => { refresh(); }, [refresh]);

  return {
    notifications,
    loading,
    unreadCount: notifications.filter(n => !n.isRead).length,
    refresh,
    markAsRead: async (id: string) => {
      await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      await refresh();
    },
    markAllAsRead: async () => {
      await apiFetch('/api/notifications/read-all', { method: 'PATCH' });
      await refresh();
    },
  };
}
