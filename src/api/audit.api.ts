import { api, unwrapList } from './client';
import type { AuditLog } from '../types/domain';

export const auditApi = {
  list: async (q?: { standId?: number; userId?: number; action?: string; page?: number; limit?: number }) => unwrapList(await api.get<AuditLog[]>('/audit-logs', q)),
};
