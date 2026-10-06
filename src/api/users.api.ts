import { api, unwrap, unwrapList } from './client';
import type { User, Stand } from '../types/domain';

export type UserInput = { name: string; email: string; password?: string; phone?: string; role?: User['role']; status?: string };
export const usersApi = {
  list: async (query: { search?: string; role?: string; status?: string; page?: number; limit?: number } = {}) => unwrapList(await api.get<User[]>('/users', query)),
  get: async (id: number) => unwrap(await api.get<User>(`/users/${id}`)),
  create: async (body: UserInput) => unwrap(await api.post<User>('/users', body)),
  update: async (id: number, body: Partial<UserInput>) => unwrap(await api.patch<User>(`/users/${id}`, body)),
  remove: async (id: number) => unwrap(await api.delete<{ id: number }>(`/users/${id}`)),
  stands: async (id: number) => unwrap(await api.get<Stand[]>(`/users/${id}/stands`)),
  assignStand: async (id: number, standId: number) => unwrap(await api.post<Stand>(`/users/${id}/stands`, { standId })),
  removeStand: async (id: number, standId: number) => unwrap(await api.delete<{ id: number; standId: number }>(`/users/${id}/stands/${standId}`)),
};
