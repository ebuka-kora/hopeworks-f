import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/apiClient';

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  actionType: string;
  affectedEntityId: string;
  affectedEntityName: string;
  timestamp: string;
  rationale?: string;
}

function mapLog(row: AuditLog & { createdAt?: string }): AuditLog {
  return {
    ...row,
    timestamp: row.timestamp || row.createdAt || new Date().toISOString(),
  };
}

export function useAuditLogsStore(enabled = true) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setLogs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch<(AuditLog & { createdAt?: string })[]>('/api/audit-logs');
      setLogs(data.map(mapLog));
    } catch (e) {
      console.error('Failed to fetch audit logs:', e);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => { refresh(); }, [refresh]);

  return {
    logs,
    loading,
    refresh,
    addLog: async () => { /* server-side only */ },
  };
}
