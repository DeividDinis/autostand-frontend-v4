import { api, unwrap } from './client';
import type { DashboardData } from '../types/domain';

export const dashboardApi = {
  get: async (query?: { standId?: number; from?: string; to?: string }) => unwrap(await api.get<DashboardData>('/dashboard', query)),
};
