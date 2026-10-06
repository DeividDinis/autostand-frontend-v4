import { api, unwrap, unwrapList } from './client';
import type { Client } from '../types/domain';

export type ClientInput = { name: string; phone: string; email?: string; document?: string; address?: string };
export const clientsApi = {
  list: async (query: { search?: string; page?: number; limit?: number } = {}) => unwrapList(await api.get<Client[]>('/clients', query)),
  get: async (id: number) => unwrap(await api.get<Client>(`/clients/${id}`)),
  create: async (body: ClientInput) => unwrap(await api.post<Client>('/clients', body)),
  update: async (id: number, body: Partial<ClientInput>) => unwrap(await api.patch<Client>(`/clients/${id}`, body)),
};
