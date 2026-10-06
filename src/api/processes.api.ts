import { api, unwrap, unwrapList } from './client';
import type { Process, ProcessStatus, ProcessType } from '../types/domain';

export type ProcessCreateData = { vehicleId: number; clientId: number; type: ProcessType; expiresAt?: string; notes?: string };
export const processesApi = {
  list: async (query: { status?: ProcessStatus; type?: ProcessType; vehicleId?: number; clientId?: number; standId?: number; page?: number; limit?: number } = {}) => unwrapList(await api.get<Process[]>('/processes', query)),
  get: async (id: number) => unwrap(await api.get<Process>(`/processes/${id}`)),
  create: async (body: ProcessCreateData) => unwrap(await api.post<Process>('/processes', body)),
  cancel: async (id: number) => unwrap(await api.post<Process>(`/processes/${id}/cancel`)),
};
