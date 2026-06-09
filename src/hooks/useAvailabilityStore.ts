import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/apiClient';
import { VolunteerAvailability } from '../types';

export function useAvailabilityStore() {
  const [availabilities, setAvailabilities] = useState<VolunteerAvailability[]>([]);

  const refresh = useCallback(async () => {
    try {
      const data = await apiFetch<VolunteerAvailability[]>('/api/availability');
      setAvailabilities(data);
    } catch (e) {
      console.error('Failed to fetch availability:', e);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return {
    availabilities,
    refresh,
    getForProject: (projectId: string) => availabilities.filter(av => av.projectId === projectId),
    getForUserAndProject: (userId: string, projectId: string) =>
      availabilities.find(av => av.volunteerId === userId && av.projectId === projectId),
    setAvailability: async (_projectId: string, _volunteerId: string, _volunteerName: string, availableDates: string[], notes?: string) => {
      const created = await apiFetch<VolunteerAvailability>('/api/availability', {
        method: 'POST',
        body: JSON.stringify({ projectId: _projectId, availableDates, notes }),
      });
      await refresh();
      return created;
    },
  };
}
