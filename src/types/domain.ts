export type Role = 'ADMIN_GLOBAL' | 'MINI_ADMIN' | 'GESTOR' | 'CLIENTE';
export type VehicleStatus = 'AVAILABLE' | 'PROCESSING' | 'SOLD' | 'RENTED' | 'MAINTENANCE' | 'TRANSFER_PENDING' | 'INACTIVE';
export type ProcessType = 'SALE' | 'RENTAL';
export type ProcessStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
export type ContractType = 'SALE' | 'RENTAL';
export type PaymentMethod = 'CASH' | 'TRANSFER' | 'POS' | 'OTHER';
export type TransferStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

export type AuthUser = { id: number; name: string; email: string; role: Role; standIds: number[] };

export type Vehicle = {
  id: number;
  standId: number;
  brand: string;
  model: string;
  year: number;
  plate: string;
  vin?: string;
  color?: string;
  fuel?: string;
  transmission?: string;
  mileage?: number;
  salePrice?: number;
  rentalDailyRate?: number;
  status: VehicleStatus;
  description?: string;
  photos?: string[];
  images?: string[];
  photoUrls?: string[];
  stand?: { id: number; name: string };
};

export type Client = { id: number; name: string; phone: string; email?: string; document?: string; address?: string; processesCount?: number; contractsCount?: number };
export type Stand = { id: number; name: string; code: string; phone?: string; address?: string; parentStandId?: number | null; parentStand?: { id: number; name: string }; vehicleCount?: number; active?: boolean; status?: string };
export type User = AuthUser & { phone?: string; status?: string };
export type Process = { id: number; vehicleId: number; clientId: number; type: ProcessType; status: ProcessStatus; expiresAt?: string; notes?: string; createdAt?: string; vehicle?: Vehicle; client?: Client; standId?: number; stand?: Stand; managerId?: number; manager?: User; contract?: Contract; payments?: Payment[]; installments?: unknown[] };
export type Contract = { id: number; processId: number; vehicleId: number; clientId: number; standId?: number; managerId?: number; type: ContractType; totalAmount?: number; downPayment?: number; amountPaid?: number; balance?: number; status?: string; startDate?: string; endDate?: string; dailyRate?: number; vehicle?: Vehicle; client?: Client; stand?: Stand; installments?: unknown[]; payments?: Payment[]; rentalReturn?: unknown };
export type Payment = { id: number; contractId: number; installmentId?: number; amount: number; method: PaymentMethod; reference?: string; paidAt?: string; notes?: string; createdAt?: string; contract?: Contract };
export type Transfer = { id: number; vehicleId: number; fromStandId: number; toStandId: number; notes?: string; status: TransferStatus; createdAt?: string; vehicle?: Vehicle; fromStand?: Stand; toStand?: Stand };
export type AuditLog = { id: number; createdAt: string; userId: number; user?: User; action: string; method: string; endpoint: string; status: number; entity?: string; standId?: number };

export type DashboardData = {
  cards: { totalVehicles?: number; available?: number; sold?: number; rented?: number; maintenance?: number; activeProcesses?: number; activeContracts?: number; pendingPayments?: number; overduePayments?: number; pendingTransfers?: number; };
  salesByPeriod?: { label: string; value: number }[];
  rentalsByPeriod?: { label: string; value: number }[];
  receiptsByPeriod?: { label: string; value: number }[];
  vehiclesByStatus?: { label: string; value: number }[];
  performanceByStand?: { label: string; value: number }[];
  recentActivity?: { id: number; type: string; description: string; createdAt: string }[];
} & Record<string, unknown>;
