import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/apiClient';
import { Project } from '../types';

export function useProjectsStore() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await apiFetch<Project[]>('/api/projects');
      setProjects(data);
    } catch (e) {
      console.error('Failed to fetch projects:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return {
    projects,
    loading,
    refresh,
    getById: (id: string) => projects.find(p => p.id === id),
    createCampaign: async (data: Omit<Project, 'id' | 'fundingRaised' | 'volunteersFilled' | 'createdAt'>) => {
      const created = await apiFetch<Project>('/api/projects', { method: 'POST', body: JSON.stringify(data) });
      await refresh();
      return created;
    },
    updateCampaign: async (id: string, data: Partial<Project>) => {
      const updated = await apiFetch<Project>(`/api/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
      await refresh();
      return updated;
    },
    deleteCampaign: async (id: string) => {
      await apiFetch(`/api/projects/${id}`, { method: 'DELETE' });
      await refresh();
    },
    startMilestone: async (projectId: string, index: number) => {
      await apiFetch(`/api/projects/${projectId}/milestones/${index}/start`, { method: 'POST' });
      await refresh();
    },
    autoAdvanceMilestones: async (projectId: string) => {
      const result = await apiFetch<{
        project: Project;
        started: boolean;
        startedIndex?: number;
        blocked: boolean;
        blockingIndex?: number;
        nextIndex?: number;
        submissionNeededIndex?: number;
      }>(`/api/projects/${projectId}/milestones/auto-advance`, { method: 'POST' });
      await refresh();
      return result;
    },
    submitMilestoneEvidence: async (projectId: string, index: number, urls: string[], description: string) => {
      await apiFetch(`/api/projects/${projectId}/milestones/${index}/submit`, {
        method: 'POST',
        body: JSON.stringify({ urls, description }),
      });
      await refresh();
    },
    reviewMilestone: async (projectId: string, index: number, status: 'approved' | 'rejected', feedback?: string) => {
      await apiFetch(`/api/projects/${projectId}/milestones/${index}/review`, {
        method: 'POST',
        body: JSON.stringify({ status, feedback }),
      });
      await refresh();
    },
  };
}
