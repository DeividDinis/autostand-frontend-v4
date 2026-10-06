import type { AuthUser, Role } from '../types/domain';

export const isAdminGlobal = (user?: AuthUser | null) => user?.role === 'ADMIN_GLOBAL';
export const isMiniAdmin = (user?: AuthUser | null) => user?.role === 'MINI_ADMIN';
export const isGestor = (user?: AuthUser | null) => user?.role === 'GESTOR';
export const isClient = (user?: AuthUser | null) => user?.role === 'CLIENTE';

export const canCreateVehicle = (user?: AuthUser | null) => ['ADMIN_GLOBAL', 'MINI_ADMIN'].includes(user?.role ?? '');
export const canEditVehicle = canCreateVehicle;
export const canManageStand = (user?: AuthUser | null, standId?: number) => isAdminGlobal(user) || (isMiniAdmin(user) && (standId === undefined || user?.standIds.includes(standId)));
export const canCreateStand = isAdminGlobal;
export const canManageUsers = isAdminGlobal;
export const canRequestTransfer = (user?: AuthUser | null) => isAdminGlobal(user) || isMiniAdmin(user);
export const canApproveTransfer = isAdminGlobal;
export const canSeeReports = isAdminGlobal;
export const canSeeAudit = (user?: AuthUser | null) => isAdminGlobal(user) || isMiniAdmin(user);
export const allowedStaffRoles: Role[] = ['ADMIN_GLOBAL', 'MINI_ADMIN', 'GESTOR'];
