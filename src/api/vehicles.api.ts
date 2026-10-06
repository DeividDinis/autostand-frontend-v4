import { api, unwrap, unwrapList } from './client';
import type { Vehicle, VehicleStatus } from '../types/domain';

export type VehicleListQuery = { search?: string; standId?: number; status?: VehicleStatus; brand?: string; model?: string; year?: number; page?: number; limit?: number };
export type VehicleCreateData = {
  standId: number; brand: string; model: string; year: number; plate: string;
  vin?: string; color?: string; fuel?: string; transmission?: string; mileage?: number;
  salePrice?: number; rentalDailyRate?: number; description?: string;
};
export const vehiclesApi = {
  list: async (query: VehicleListQuery = {}) => unwrapList(await api.get<Vehicle[]>('/cars', query)),
  get: async (id: number) => unwrap(await api.get<Vehicle>(`/cars/${id}`)),
  create: async (body: VehicleCreateData) => unwrap(await api.post<Vehicle>('/cars', body)),
  update: async (id: number, body: Partial<Omit<VehicleCreateData, 'standId'>>) => unwrap(await api.patch<Vehicle>(`/cars/${id}`, body)),
};
