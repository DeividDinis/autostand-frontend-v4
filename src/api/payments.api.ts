import { api, unwrap, unwrapList } from './client';
import type { Payment, PaymentMethod } from '../types/domain';

export type PaymentInput = { contractId: number; amount: number; method: PaymentMethod; installmentId?: number; reference?: string; paidAt?: string; notes?: string };
export const paymentsApi = {
  list: async (query: { contractId?: number; installmentId?: number; method?: PaymentMethod; from?: string; to?: string; page?: number; limit?: number } = {}) => unwrapList(await api.get<Payment[]>('/payments', query)),
  get: async (id: number) => unwrap(await api.get<Payment>(`/payments/${id}`)),
  create: async (body: PaymentInput) => unwrap(await api.post<Payment>('/payments', body)),
};
