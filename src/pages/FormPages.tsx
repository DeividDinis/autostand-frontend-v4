import { useEffect } from 'react';
import type { FormEventHandler, ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { z } from 'zod';
import { Button } from '../components/Button';
import { Field, inputClass } from '../components/Field';
import { PageHeader } from '../components/PageHeader';
import { useToast } from '../hooks/useToast';
import { Toast } from '../components/Toast';
import { vehicleSchema, clientSchema, standSchema, processSchema, paymentSchema, returnSchema, transferSchema, userSchema, saleContractSchema, rentalContractSchema } from '../schemas/forms';
import { vehiclesApi } from '../api/vehicles.api';
import { clientsApi } from '../api/clients.api';
import { standsApi } from '../api/stands.api';
import { processesApi } from '../api/processes.api';
import { paymentsApi } from '../api/payments.api';
import { contractsApi } from '../api/contracts.api';
import { transfersApi } from '../api/transfers.api';
import { usersApi } from '../api/users.api';
import { useAuth } from '../contexts/AuthContext';

type VehicleForm = z.infer<typeof vehicleSchema>;
type ClientForm = z.infer<typeof clientSchema>;
type StandForm = z.infer<typeof standSchema>;
type ProcessForm = z.infer<typeof processSchema>;
type PaymentForm = z.infer<typeof paymentSchema>;
type ReturnForm = z.infer<typeof returnSchema>;
type TransferForm = z.infer<typeof transferSchema>;
type UserForm = z.infer<typeof userSchema>;
type SaleContractForm = z.infer<typeof saleContractSchema>;
type RentalContractForm = z.infer<typeof rentalContractSchema>;

type ToastApi = ReturnType<typeof useToast>;
function FormShell({ title, subtitle, children, onSubmit, loading, toast }: { title: string; subtitle: string; children: ReactNode; onSubmit: FormEventHandler<HTMLFormElement>; loading: boolean; toast: ToastApi }) {
  return <><PageHeader title={title} subtitle={subtitle} action={<button type="button" onClick={() => window.history.back()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold"><ArrowLeft size={16} /> Voltar</button>} /><form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="grid gap-5 md:grid-cols-2">{children}</div><div className="mt-6 flex justify-end border-t border-slate-100 pt-5"><Button type="submit" loading={loading}><Save size={16} /> Guardar</Button></div></form>{toast.toast && <Toast message={toast.toast.message} type={toast.toast.type} onClose={toast.clear} />}</>;
}
function Input({ reg, type = 'text', placeholder }: { reg: any; type?: string; placeholder?: string }) { return <input {...reg} type={type} placeholder={placeholder} className={inputClass} />; }

export function VehicleFormPage() {
  const nav = useNavigate(); const { id } = useParams(); const { user } = useAuth(); const toast = useToast(); const edit = Boolean(id);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<VehicleForm>({ resolver: zodResolver(vehicleSchema) });
  useEffect(() => { if (!edit) return; vehiclesApi.get(Number(id)).then((vehicle) => reset({ standId: vehicle.standId, brand: vehicle.brand, model: vehicle.model, year: vehicle.year, plate: vehicle.plate, vin: vehicle.vin || '', color: vehicle.color || '', fuel: vehicle.fuel || '', transmission: vehicle.transmission || '', mileage: vehicle.mileage, salePrice: vehicle.salePrice, rentalDailyRate: vehicle.rentalDailyRate, description: vehicle.description || '' })).catch((e) => toast.error(e instanceof Error ? e.message : 'Não foi possível carregar a viatura.')); }, [edit, id, reset]);
  if (edit && !['ADMIN_GLOBAL', 'MINI_ADMIN'].includes(user?.role ?? '')) return null;
  const submit = async (data: VehicleForm) => {
    try {
      const common = { brand: data.brand, model: data.model, year: data.year, plate: data.plate, vin: data.vin || undefined, color: data.color || undefined, fuel: data.fuel || undefined, transmission: data.transmission || undefined, mileage: data.mileage, salePrice: data.salePrice, rentalDailyRate: data.rentalDailyRate, description: data.description || undefined };
      if (edit) await vehiclesApi.update(Number(id), common); else await vehiclesApi.create({ standId: data.standId, ...common });
      toast.success(edit ? 'Viatura atualizada com sucesso.' : 'Viatura criada com sucesso.'); window.setTimeout(() => nav('/vehicles'), 300);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Não foi possível guardar a viatura.'); }
  };
  return <FormShell title={edit ? 'Editar viatura' : 'Nova viatura'} subtitle="Dados de inventário e operação" onSubmit={handleSubmit(submit)} loading={isSubmitting} toast={toast}>
    {!edit && <Field label="Stand" error={errors.standId?.message}><Input reg={register('standId')} type="number" placeholder="ID do stand" /></Field>}
    <Field label="Marca" error={errors.brand?.message}><Input reg={register('brand')} placeholder="Toyota" /></Field><Field label="Modelo" error={errors.model?.message}><Input reg={register('model')} placeholder="Hilux" /></Field><Field label="Ano" error={errors.year?.message}><Input reg={register('year')} type="number" placeholder="2024" /></Field><Field label="Matrícula" error={errors.plate?.message}><Input reg={register('plate')} placeholder="LD-45-23-AB" /></Field><Field label="VIN"><Input reg={register('vin')} placeholder="Opcional" /></Field><Field label="Cor"><Input reg={register('color')} placeholder="Preto" /></Field><Field label="Combustível"><Input reg={register('fuel')} placeholder="DIESEL" /></Field><Field label="Transmissão"><Input reg={register('transmission')} placeholder="AUTOMATIC" /></Field><Field label="Quilometragem"><Input reg={register('mileage')} type="number" placeholder="15000" /></Field><Field label="Preço de venda"><Input reg={register('salePrice')} type="number" placeholder="35000000" /></Field><Field label="Preço diário de aluguer"><Input reg={register('rentalDailyRate')} type="number" placeholder="150000" /></Field><Field label="Descrição"><textarea {...register('description')} className={`${inputClass} min-h-24`} /></Field>
  </FormShell>;
}

export function ClientFormPage() {
  const nav = useNavigate(); const toast = useToast(); const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ClientForm>({ resolver: zodResolver(clientSchema) });
  const submit = async (data: ClientForm) => { try { await clientsApi.create({ ...data, email: data.email || undefined, document: data.document || undefined }); toast.success('Cliente criado com sucesso.'); window.setTimeout(() => nav('/clients'), 300); } catch (e) { toast.error(e instanceof Error ? e.message : 'Não foi possível criar o cliente.'); } };
  return <FormShell title="Novo cliente" subtitle="Regista os dados do cliente" onSubmit={handleSubmit(submit)} loading={isSubmitting} toast={toast}><Field label="Nome" error={errors.name?.message}><Input reg={register('name')} placeholder="João Manuel" /></Field><Field label="Telefone" error={errors.phone?.message}><Input reg={register('phone')} placeholder="923000000" /></Field><Field label="Email" error={errors.email?.message}><Input reg={register('email')} type="email" placeholder="cliente@email.com" /></Field><Field label="Documento"><Input reg={register('document')} /></Field><Field label="Endereço"><Input reg={register('address')} placeholder="Talatona" /></Field></FormShell>;
}

export function StandFormPage() {
  const nav = useNavigate(); const { id } = useParams(); const { user } = useAuth(); const toast = useToast(); const edit = Boolean(id);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<StandForm>({ resolver: zodResolver(standSchema) });
  useEffect(() => { if (!edit) return; standsApi.get(Number(id)).then((stand) => reset({ name: stand.name, code: stand.code, phone: stand.phone || '', address: stand.address || '', parentStandId: stand.parentStandId ?? '' })).catch((e) => toast.error(e instanceof Error ? e.message : 'Não foi possível carregar o stand.')); }, [edit, id, reset]);
  const submit = async (data: StandForm) => { try { const body = { name: data.name, code: data.code, phone: data.phone || undefined, address: data.address || undefined, ...(data.active !== undefined ? { active: data.active } : {}), ...(user?.role === 'ADMIN_GLOBAL' ? { parentStandId: data.parentStandId === '' ? null : data.parentStandId } : {}) }; if (edit) await standsApi.update(Number(id), body); else await standsApi.create(body); toast.success(edit ? 'Stand atualizado com sucesso.' : 'Stand criado com sucesso.'); window.setTimeout(() => nav('/stands'), 300); } catch (e) { toast.error(e instanceof Error ? e.message : 'Não foi possível guardar o stand.'); } };
  return <FormShell title={edit ? 'Editar stand' : 'Novo stand'} subtitle="Stand principal ou substand" onSubmit={handleSubmit(submit)} loading={isSubmitting} toast={toast}><Field label="Nome" error={errors.name?.message}><Input reg={register('name')} /></Field><Field label="Código" error={errors.code?.message}><Input reg={register('code')} /></Field><Field label="Telefone"><Input reg={register('phone')} /></Field><Field label="Endereço"><Input reg={register('address')} /></Field>{user?.role === 'ADMIN_GLOBAL' && <Field label="Stand pai"><Input reg={register('parentStandId')} type="number" placeholder="Vazio para principal" /></Field>}</FormShell>;
}

export function ProcessFormPage() {
  const nav = useNavigate(); const toast = useToast(); const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProcessForm>({ resolver: zodResolver(processSchema) });
  const submit = async (data: ProcessForm) => { try { await processesApi.create({ vehicleId: data.vehicleId, clientId: data.clientId, type: data.type, expiresAt: data.expiresAt || undefined, notes: data.notes || undefined }); toast.success('Processo criado com sucesso.'); window.setTimeout(() => nav('/processes'), 300); } catch (e) { toast.error(e instanceof Error ? e.message : 'Não foi possível criar o processo.'); } };
  return <FormShell title="Novo processo" subtitle="Inicia uma operação de venda ou aluguer" onSubmit={handleSubmit(submit)} loading={isSubmitting} toast={toast}><Field label="Viatura" error={errors.vehicleId?.message}><Input reg={register('vehicleId')} type="number" /></Field><Field label="Cliente" error={errors.clientId?.message}><Input reg={register('clientId')} type="number" /></Field><Field label="Tipo" error={errors.type?.message}><select {...register('type')} className={inputClass}><option value="SALE">Venda</option><option value="RENTAL">Aluguer</option></select></Field><Field label="Expira em"><Input reg={register('expiresAt')} type="datetime-local" /></Field><Field label="Notas"><textarea {...register('notes')} className={`${inputClass} min-h-24`} /></Field></FormShell>;
}

export function SaleContractFormPage() {
  const nav = useNavigate(); const toast = useToast(); const [params] = useSearchParams(); const processIdDefault = params.get('processId') || '';
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SaleContractForm>({ resolver: zodResolver(saleContractSchema), defaultValues: { processId: processIdDefault ? Number(processIdDefault) : undefined } as Partial<SaleContractForm> });
  const submit = async (data: SaleContractForm) => { try { await contractsApi.createSale({ processId: data.processId, totalAmount: data.totalAmount, downPayment: data.downPayment, installments: data.installments, firstDueDate: data.firstDueDate || undefined, intervalMonths: data.intervalMonths }); toast.success('Contrato de venda criado com sucesso.'); window.setTimeout(() => nav('/sales'), 300); } catch (e) { toast.error(e instanceof Error ? e.message : 'Não foi possível criar o contrato de venda.'); } };
  return <FormShell title="Contrato de venda" subtitle="Cria o contrato e o plano de pagamento" onSubmit={handleSubmit(submit)} loading={isSubmitting} toast={toast}><Field label="Processo" error={errors.processId?.message}><Input reg={register('processId')} type="number" /></Field><Field label="Valor total" error={errors.totalAmount?.message}><Input reg={register('totalAmount')} type="number" /></Field><Field label="Entrada"><Input reg={register('downPayment')} type="number" /></Field><Field label="Número de prestações"><Input reg={register('installments')} type="number" /></Field><Field label="Primeiro vencimento"><Input reg={register('firstDueDate')} type="date" /></Field><Field label="Intervalo em meses"><Input reg={register('intervalMonths')} type="number" /></Field></FormShell>;
}

export function RentalContractFormPage() {
  const nav = useNavigate(); const toast = useToast(); const [params] = useSearchParams(); const processIdDefault = params.get('processId') || '';
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RentalContractForm>({ resolver: zodResolver(rentalContractSchema), defaultValues: { processId: processIdDefault ? Number(processIdDefault) : undefined } as Partial<RentalContractForm> });
  const submit = async (data: RentalContractForm) => { try { await contractsApi.createRental({ processId: data.processId, endDate: data.endDate, startDate: data.startDate || undefined, dailyRate: data.dailyRate, totalAmount: data.totalAmount }); toast.success('Contrato de aluguer criado com sucesso.'); window.setTimeout(() => nav('/rentals'), 300); } catch (e) { toast.error(e instanceof Error ? e.message : 'Não foi possível criar o contrato de aluguer.'); } };
  return <FormShell title="Contrato de aluguer" subtitle="Define período e valores do aluguer" onSubmit={handleSubmit(submit)} loading={isSubmitting} toast={toast}><Field label="Processo" error={errors.processId?.message}><Input reg={register('processId')} type="number" /></Field><Field label="Data final" error={errors.endDate?.message}><Input reg={register('endDate')} type="date" /></Field><Field label="Data inicial"><Input reg={register('startDate')} type="date" /></Field><Field label="Diária"><Input reg={register('dailyRate')} type="number" /></Field><Field label="Valor total"><Input reg={register('totalAmount')} type="number" /></Field></FormShell>;
}

export function PaymentFormPage() {
  const nav = useNavigate(); const toast = useToast(); const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PaymentForm>({ resolver: zodResolver(paymentSchema) });
  const submit = async (data: PaymentForm) => { try { await paymentsApi.create({ contractId: data.contractId, installmentId: data.installmentId, amount: data.amount, method: data.method, reference: data.reference || undefined, paidAt: data.paidAt || undefined, notes: data.notes || undefined }); toast.success('Pagamento registado com sucesso.'); window.setTimeout(() => nav('/payments'), 300); } catch (e) { toast.error(e instanceof Error ? e.message : 'Não foi possível registar o pagamento.'); } };
  return <FormShell title="Registar pagamento" subtitle="A API é a fonte de verdade financeira" onSubmit={handleSubmit(submit)} loading={isSubmitting} toast={toast}><Field label="Contrato" error={errors.contractId?.message}><Input reg={register('contractId')} type="number" /></Field><Field label="Prestação"><Input reg={register('installmentId')} type="number" /></Field><Field label="Valor" error={errors.amount?.message}><Input reg={register('amount')} type="number" /></Field><Field label="Método" error={errors.method?.message}><select {...register('method')} className={inputClass}><option value="CASH">Numerário</option><option value="TRANSFER">Transferência</option><option value="POS">POS</option><option value="OTHER">Outro</option></select></Field><Field label="Referência"><Input reg={register('reference')} /></Field><Field label="Data do pagamento"><Input reg={register('paidAt')} type="datetime-local" /></Field><Field label="Notas"><textarea {...register('notes')} className={`${inputClass} min-h-24`} /></Field></FormShell>;
}

export function ReturnFormPage() {
  const nav = useNavigate(); const toast = useToast(); const [params] = useSearchParams(); const contractId = Number(params.get('contractId') || 0);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ReturnForm>({ resolver: zodResolver(returnSchema) });
  const submit = async (data: ReturnForm) => { try { if (!contractId) throw new Error('Contrato de aluguer não informado.'); await contractsApi.returnRental(contractId, { mileage: data.mileage, condition: data.condition || undefined, damages: data.damages || undefined, notes: data.notes || undefined }); toast.success('Devolução registada com sucesso.'); window.setTimeout(() => nav('/rental-returns'), 300); } catch (e) { toast.error(e instanceof Error ? e.message : 'Não foi possível registar a devolução.'); } };
  return <FormShell title="Registar devolução" subtitle={contractId ? `Contrato #${contractId}` : 'Seleciona um contrato de aluguer'} onSubmit={handleSubmit(submit)} loading={isSubmitting} toast={toast}><Field label="Quilometragem"><Input reg={register('mileage')} type="number" /></Field><Field label="Condição"><Input reg={register('condition')} placeholder="GOOD" /></Field><Field label="Danos"><textarea {...register('damages')} className={`${inputClass} min-h-24`} /></Field><Field label="Notas"><textarea {...register('notes')} className={`${inputClass} min-h-24`} /></Field></FormShell>;
}

export function TransferFormPage() {
  const nav = useNavigate(); const toast = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TransferForm>({ resolver: zodResolver(transferSchema) });
  const submit = async (data: TransferForm) => { try { await transfersApi.create({ vehicleId: data.vehicleId, toStandId: data.toStandId, notes: data.notes || undefined }); toast.success('Transferência solicitada com sucesso.'); window.setTimeout(() => nav('/transfers'), 300); } catch (e) { toast.error(e instanceof Error ? e.message : 'Não foi possível solicitar a transferência.'); } };
  return <FormShell title="Nova transferência" subtitle="O stand de origem é determinado pela API pela viatura" onSubmit={handleSubmit(submit)} loading={isSubmitting} toast={toast}><Field label="Viatura" error={errors.vehicleId?.message}><Input reg={register('vehicleId')} type="number" /></Field><Field label="Stand de destino" error={errors.toStandId?.message}><Input reg={register('toStandId')} type="number" /></Field><Field label="Notas"><textarea {...register('notes')} className={`${inputClass} min-h-24`} /></Field></FormShell>;
}

export function UserFormPage() {
  const nav = useNavigate(); const toast = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UserForm>({ resolver: zodResolver(userSchema), defaultValues: { role: 'GESTOR', status: 'ACTIVE' } });
  const submit = async (data: UserForm) => { try { const user = await usersApi.create({ name: data.name, email: data.email, password: data.password, phone: data.phone || undefined, role: data.role, status: data.status || 'ACTIVE' }); const ids = (data.standIdsText || '').split(',').map((x) => Number(x.trim())).filter((x) => Number.isInteger(x) && x > 0); for (const standId of ids) await usersApi.assignStand(user.id, standId); toast.success('Utilizador criado com sucesso.'); window.setTimeout(() => nav('/users'), 300); } catch (e) { toast.error(e instanceof Error ? e.message : 'Não foi possível criar o utilizador.'); } };
  return <FormShell title="Novo utilizador" subtitle="Cria o acesso e associa-o aos stands" onSubmit={handleSubmit(submit)} loading={isSubmitting} toast={toast}><Field label="Nome" error={errors.name?.message}><Input reg={register('name')} /></Field><Field label="Email" error={errors.email?.message}><Input reg={register('email')} type="email" /></Field><Field label="Telefone"><Input reg={register('phone')} /></Field><Field label="Palavra-passe" error={errors.password?.message}><Input reg={register('password')} type="password" /></Field><Field label="Cargo" error={errors.role?.message}><select {...register('role')} className={inputClass}><option value="ADMIN_GLOBAL">ADMIN_GLOBAL</option><option value="MINI_ADMIN">MINI_ADMIN</option><option value="GESTOR">GESTOR</option><option value="CLIENTE">CLIENTE</option></select></Field><Field label="Estado"><select {...register('status')} className={inputClass}><option value="ACTIVE">Ativo</option><option value="INACTIVE">Inativo</option></select></Field><Field label="IDs dos stands"><Input reg={register('standIdsText')} placeholder="Ex.: 2,3" /></Field></FormShell>;
}
