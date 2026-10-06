import { api, unwrap } from './client';

export type ReportQuery = { from?: string; to?: string; standId?: number };
export const reportsApi = {
  vehicles: async (q?: ReportQuery) => unwrap(await api.get<unknown>('/reports/vehicles', q)),
  sales: async (q?: ReportQuery) => unwrap(await api.get<unknown>('/reports/sales', q)),
  rentals: async (q?: ReportQuery) => unwrap(await api.get<unknown>('/reports/rentals', q)),
  receivables: async (q?: ReportQuery) => unwrap(await api.get<unknown>('/reports/receivables', q)),
  transfers: async (q?: ReportQuery) => unwrap(await api.get<unknown>('/reports/transfers', q)),
};
