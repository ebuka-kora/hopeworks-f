import { useNotificationsContext } from '../context/NotificationsContext';

/** Shared notifications state — badge counts update app-wide when items are read. */
export function useNotificationsStore(_userId?: string) {
  return useNotificationsContext();
}
