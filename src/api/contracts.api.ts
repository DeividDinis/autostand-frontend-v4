import { api, unwrap, unwrapList } from './client';
import type { Contract, ContractType } from '../types/domain';

export type SaleContractInput = { processId: number; totalAmount: number; downPayment?: number; installments?: number; firstDueDate?: string; intervalMonths?: number };
export type RentalContractInput = { processId: number; endDate: string; startDate?: string; dailyRate?: number; totalAmount?: number };
export type RentalReturnInput = { mileage?: number; condition?: string; damages?: string; notes?: string };

export const contractsApi = {
  list: async (query: { status?: string; type?: ContractType; clientId?: number; vehicleId?: number; standId?: number; page?: number; limit?: number } = {}) => unwrapList(await api.get<Contract[]>('/contracts', query)),
  get: async (id: number) => unwrap(await api.get<Contract>(`/contracts/${id}`)),
  createSale: async (body: SaleContractInput) => unwrap(await api.post<Contract>('/contracts/sale', body)),
  createRental: async (body: RentalContractInput) => unwrap(await api.post<Contract>('/contracts/rental', body)),
  returnRental: async (id: number, body: RentalReturnInput) => unwrap(await api.post<Contract>(`/contracts/rental/${id}/return`, body)),
};
