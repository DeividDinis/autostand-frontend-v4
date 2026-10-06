import { api, unwrap, unwrapList } from './client';
import type { Transfer, TransferStatus } from '../types/domain';

export type TransferInput = { vehicleId: number; toStandId: number; notes?: string };
export const transfersApi = {
  list: async (query: { status?: TransferStatus; fromStandId?: number; toStandId?: number; page?: number; limit?: number } = {}) => unwrapList(await api.get<Transfer[]>('/transfers', query)),
  get: async (id: number) => unwrap(await api.get<Transfer>(`/transfers/${id}`)),
  create: async (body: TransferInput) => unwrap(await api.post<Transfer>('/transfers', body)),
  approve: async (id: number) => unwrap(await api.post<Transfer>(`/transfers/${id}/approve`)),
  reject: async (id: number, notes?: string) => unwrap(await api.post<Transfer>(`/transfers/${id}/reject`, notes ? { notes } : undefined)),
  complete: async (id: number) => unwrap(await api.post<Transfer>(`/transfers/${id}/complete`)),
  cancel: async (id: number) => unwrap(await api.post<Transfer>(`/transfers/${id}/cancel`)),
};
