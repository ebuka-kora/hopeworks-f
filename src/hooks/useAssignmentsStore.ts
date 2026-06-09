import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/apiClient';
import { ProjectAssignment } from '../types';

export function useAssignmentsStore() {
  const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);

  const refresh = useCallback(async () => {
    try {
      const data = await apiFetch<ProjectAssignment[]>('/api/assignments');
      setAssignments(data);
    } catch (e) {
      console.error('Failed to fetch assignments:', e);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return {
    assignments,
    refresh,
    assignProject: async (projectId: string, pmId: string, pmName: string) => {
      const created = await apiFetch<ProjectAssignment>('/api/assignments', {
        method: 'POST',
        body: JSON.stringify({ projectId, pmId, pmName }),
      });
      await refresh();
      return created;
    },
    unassignProject: async (projectId: string) => {
      await apiFetch(`/api/assignments/${projectId}`, { method: 'DELETE' });
      await refresh();
    },
    listByPm: (pmId: string) => assignments.filter(a => a.pmId === pmId),
    getForProject: (projectId: string) => assignments.find(a => a.projectId === projectId),
  };
}
