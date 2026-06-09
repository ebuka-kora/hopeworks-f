import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/apiClient';
import { Donation } from '../types';

export function useDonationsStore() {
  const [donations, setDonations] = useState<Donation[]>([]);

  const refresh = useCallback(async () => {
    try {
      const data = await apiFetch<Donation[]>('/api/donations');
      setDonations(data);
    } catch (e) {
      console.error('Failed to fetch donations:', e);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return {
    donations,
    refresh,
    listByProject: (projectId: string) => donations.filter(d => d.projectId === projectId),
    listByDonor: (donorId: string) => donations.filter(d => d.donorId === donorId),
    createDonation: async (data: Omit<Donation, 'id' | 'createdAt' | 'donorId' | 'donorName'>) => {
      const created = await apiFetch<Donation>('/api/donations', { method: 'POST', body: JSON.stringify(data) });
      await refresh();
      return created;
    },
  };
}
