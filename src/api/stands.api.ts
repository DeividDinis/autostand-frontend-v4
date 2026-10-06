import { api, unwrap, unwrapList } from './client';
import type { Stand } from '../types/domain';

export type StandInput = { name: string; code: string; phone?: string; address?: string; parentStandId?: number | null; active?: boolean };
export const standsApi = {
  list: async (query: { search?: string; parentStandId?: number; active?: boolean; page?: number; limit?: number } = {}) => unwrapList(await api.get<Stand[]>('/stands', query)),
  get: async (id: number) => unwrap(await api.get<Stand>(`/stands/${id}`)),
  create: async (body: StandInput) => unwrap(await api.post<Stand>('/stands', body)),
  update: async (id: number, body: Partial<StandInput>) => unwrap(await api.patch<Stand>(`/stands/${id}`, body)),
  remove: async (id: number) => unwrap(await api.delete<{ id: number }>(`/stands/${id}`)),
};
