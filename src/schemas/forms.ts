import { z } from 'zod';

export const vehicleSchema = z.object({
  standId: z.coerce.number().positive(),
  brand: z.string().trim().min(1),
  model: z.string().trim().min(1),
  year: z.coerce.number().int().min(1900).max(2100),
  plate: z.string().trim().min(3),
  vin: z.string().trim().optional().or(z.literal('')),
  color: z.string().optional(),
  fuel: z.string().optional(),
  transmission: z.string().optional(),
  mileage: z.coerce.number().min(0).optional(),
  salePrice: z.coerce.number().min(0).optional(),
  rentalDailyRate: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
});

export const clientSchema = z.object({ name: z.string().trim().min(2), phone: z.string().trim().min(6), email: z.string().email().optional().or(z.literal('')), document: z.string().optional(), address: z.string().optional() });
export const standSchema = z.object({ name: z.string().trim().min(2), code: z.string().trim().min(2), phone: z.string().optional(), address: z.string().optional(), parentStandId: z.union([z.coerce.number().positive(), z.literal('')]).optional(), active: z.boolean().optional() });
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export const processSchema = z.object({ vehicleId: z.coerce.number().positive(), clientId: z.coerce.number().positive(), type: z.enum(['SALE', 'RENTAL']), expiresAt: z.string().optional(), notes: z.string().optional() });
export const paymentSchema = z.object({ contractId: z.coerce.number().positive(), installmentId: z.preprocess((value) => value === '' || value === undefined || value === null ? undefined : Number(value), z.number().int().positive().optional()), amount: z.coerce.number().positive(), method: z.enum(['CASH', 'TRANSFER', 'POS', 'OTHER']), reference: z.string().optional(), paidAt: z.string().optional(), notes: z.string().optional() });
export const saleContractSchema = z.object({ processId: z.coerce.number().positive(), totalAmount: z.coerce.number().positive(), downPayment: z.coerce.number().min(0).optional(), installments: z.coerce.number().int().positive().optional(), firstDueDate: z.string().optional(), intervalMonths: z.coerce.number().int().positive().optional() });
export const rentalContractSchema = z.object({ processId: z.coerce.number().positive(), endDate: z.string().min(1), startDate: z.string().optional(), dailyRate: z.coerce.number().min(0).optional(), totalAmount: z.coerce.number().min(0).optional() });
export const returnSchema = z.object({ mileage: z.coerce.number().min(0).optional(), condition: z.string().optional(), damages: z.string().optional(), notes: z.string().optional() });
export const transferSchema = z.object({ vehicleId: z.coerce.number().positive(), toStandId: z.coerce.number().positive(), notes: z.string().optional() });
export const userSchema = z.object({ name: z.string().trim().min(2), email: z.string().email(), phone: z.string().optional(), password: z.string().min(6), role: z.enum(['ADMIN_GLOBAL', 'MINI_ADMIN', 'GESTOR', 'CLIENTE']), status: z.string().optional(), standIdsText: z.string().optional() });
