import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/apiClient';
import { VolunteerApplication } from '../types';

export function useApplicationsStore() {
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);

  const refresh = useCallback(async () => {
    try {
      const data = await apiFetch<VolunteerApplication[]>('/api/applications');
      setApplications(data);
    } catch (e) {
      console.error('Failed to fetch applications:', e);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return {
    applications,
    refresh,
    listByProject: (projectId: string) => applications.filter(a => a.projectId === projectId),
    listByVolunteer: (volunteerId: string) => applications.filter(a => a.volunteerId === volunteerId),
    createApplication: async (data: Omit<VolunteerApplication, 'id' | 'status' | 'createdAt' | 'volunteerId' | 'volunteerName'>) => {
      const created = await apiFetch<VolunteerApplication>('/api/applications', { method: 'POST', body: JSON.stringify(data) });
      await refresh();
      return created;
    },
    updateApplicationStatus: async (id: string, status: 'approved' | 'rejected') => {
      await apiFetch(`/api/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      await refresh();
    },
  };
}
