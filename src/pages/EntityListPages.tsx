import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Pencil, Plus, RotateCcw } from 'lucide-react';
import { DataTable, type Column } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { ErrorState } from '../components/StateView';
import { money, date } from '../utils/format';
import { useAuth } from '../contexts/AuthContext';
import { canCreateVehicle, isAdminGlobal, isMiniAdmin } from '../utils/permissions';
import { vehiclesApi } from '../api/vehicles.api';
import { clientsApi } from '../api/clients.api';
import { standsApi } from '../api/stands.api';
import { processesApi } from '../api/processes.api';
import { contractsApi } from '../api/contracts.api';
import { paymentsApi } from '../api/payments.api';
import { transfersApi } from '../api/transfers.api';
import { usersApi } from '../api/users.api';
import type { Vehicle, Client, Stand, Process, Contract, Payment, Transfer, User } from '../types/domain';

type ListResponse<T> = { data: T[]; total: number };
function useList<T>(load: (page: number) => Promise<ListResponse<T>>, watch: readonly unknown[] = []) {
  const [state, setState] = useState({ rows: [] as T[], total: 0, loading: true, error: '' });
  const [page, setPage] = useState(1);
  const run = (pageNumber = page) => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    load(pageNumber).then((r) => setState({ rows: r.data ?? [], total: r.total ?? 0, loading: false, error: '' })).catch((e) => setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : 'Não foi possível carregar os dados.' })));
  };
  useEffect(() => { run(page); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, ...watch]);
  return { ...state, page, setPage, reload: () => run(page) };
}
function ErrorSlot({ state }: { state: { error: string; reload: () => void } }) { return state.error ? <div className="mt-4"><ErrorState text={state.error} retry={state.reload} /></div> : null; }

export function VehiclesPage() {
  const nav = useNavigate(); const { user } = useAuth(); const [search, setSearch] = useState(''); const [status, setStatus] = useState('');
  const list = useList<Vehicle>((page) => vehiclesApi.list({ page, limit: 20, search, status: status as any || undefined, standId: isAdminGlobal(user) ? undefined : user?.standIds[0] }), [search, status, user?.role, user?.standIds.join(',')]);
  const columns: Column<Vehicle>[] = [
    { key: 'brand', header: 'Viatura', render: (r) => <div><b>{r.brand} {r.model}</b><div className="text-xs text-slate-400">{r.color || '—'}</div></div> },
    { key: 'plate', header: 'Matrícula' }, { key: 'year', header: 'Ano' }, { key: 'stand', header: 'Stand', render: (r) => r.stand?.name || r.standId }, { key: 'salePrice', header: 'Preço', render: (r) => money(r.salePrice) }, { key: 'status', header: 'Estado', render: (r) => <Badge value={r.status} /> },
    { key: 'actions', header: '', render: (r) => <div className="flex gap-1"><button onClick={() => nav(`/vehicles/${r.id}`)} className="rounded-lg p-2 hover:bg-slate-100"><Eye size={16} /></button>{canCreateVehicle(user) && <button onClick={() => nav(`/vehicles/${r.id}/edit`)} className="rounded-lg p-2 hover:bg-slate-100"><Pencil size={16} /></button>}</div> },
  ];
  return <><PageHeader title="Veículos" subtitle="Inventário operacional por stand" action={canCreateVehicle(user) ? <Link to="/vehicles/new" className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white"><Plus size={17} /> Nova viatura</Link> : undefined} /><div className="mb-4 flex flex-wrap gap-2"><select value={status} onChange={(e) => { setStatus(e.target.value); list.setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="">Todos os estados</option>{['AVAILABLE','PROCESSING','SOLD','RENTED','MAINTENANCE','TRANSFER_PENDING','INACTIVE'].map((x) => <option key={x} value={x}>{x}</option>)}</select></div><DataTable columns={columns} rows={list.rows} loading={list.loading} total={list.total} page={list.page} onPageChange={list.setPage} search={search} onSearch={(v) => { setSearch(v); list.setPage(1); }} emptyText="Nenhuma viatura encontrada." /><ErrorSlot state={list} /></>;
}

export function ClientsPage() {
  const nav = useNavigate(); const [search, setSearch] = useState(''); const list = useList<Client>((page) => clientsApi.list({ page, limit: 20, search }), [search]);
  const columns: Column<Client>[] = [{ key: 'name', header: 'Cliente', render: (r) => <b>{r.name}</b> }, { key: 'phone', header: 'Telefone' }, { key: 'email', header: 'Email' }, { key: 'document', header: 'Documento' }, { key: 'processesCount', header: 'Processos' }, { key: 'contractsCount', header: 'Contratos' }, { key: 'actions', header: '', render: (r) => <button onClick={() => nav(`/clients/${r.id}`)} className="rounded-lg p-2 hover:bg-slate-100"><Eye size={16} /></button> }];
  return <><PageHeader title="Clientes" subtitle="Base de clientes e histórico operacional" action={<Link to="/clients/new" className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white"><Plus size={17} /> Novo cliente</Link>} /><DataTable columns={columns} rows={list.rows} loading={list.loading} total={list.total} page={list.page} onPageChange={list.setPage} search={search} onSearch={(v) => { setSearch(v); list.setPage(1); }} emptyText="Nenhum cliente encontrado." /><ErrorSlot state={list} /></>;
}

export function StandsPage() {
  const nav = useNavigate(); const { user } = useAuth();
  const list = useList<Stand>((page) => isMiniAdmin(user) ? Promise.all((user.standIds ?? []).map((id) => standsApi.get(id))).then((data) => ({ data, total: data.length })) : standsApi.list({ page, limit: 20 }), [user?.role, user?.standIds.join(',')]);
  const columns: Column<Stand>[] = [{ key: 'name', header: 'Stand', render: (r) => <div><b>{r.name}</b><div className="text-xs text-slate-400">{r.code}</div></div> }, { key: 'phone', header: 'Telefone' }, { key: 'address', header: 'Endereço' }, { key: 'parentStand', header: 'Stand pai', render: (r) => r.parentStand?.name || r.parentStandId || 'Principal' }, { key: 'vehicleCount', header: 'Veículos' }, { key: 'active', header: 'Estado', render: (r) => <Badge value={r.active === false ? 'INACTIVE' : 'ACTIVE'} /> }, { key: 'actions', header: '', render: (r) => <button onClick={() => nav(`/stands/${r.id}`)} className="rounded-lg p-2 hover:bg-slate-100"><Eye size={16} /></button> }];
  return <><PageHeader title="Stands" subtitle="Estrutura multi-stand e substands" action={isAdminGlobal(user) ? <Link to="/stands/new" className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white"><Plus size={17} /> Novo stand</Link> : undefined} /><DataTable columns={columns} rows={list.rows} loading={list.loading} total={list.total} page={list.page} onPageChange={list.setPage} emptyText="Nenhum stand encontrado." /><ErrorSlot state={list} /></>;
}

export function UsersPage() {
  const nav = useNavigate(); const list = useList<User>((page) => usersApi.list({ page, limit: 20 }));
  const columns: Column<User>[] = [{ key: 'name', header: 'Utilizador', render: (r) => <b>{r.name}</b> }, { key: 'email', header: 'Email' }, { key: 'role', header: 'Cargo', render: (r) => <Badge value={r.role} /> }, { key: 'status', header: 'Estado', render: (r) => <Badge value={r.status || 'ACTIVE'} /> }, { key: 'actions', header: '', render: (r) => <button onClick={() => nav(`/users/${r.id}`)} className="rounded-lg p-2 hover:bg-slate-100"><Eye size={16} /></button> }];
  return <><PageHeader title="Utilizadores" subtitle="Cargos, estados e associações a stands" action={<Link to="/users/new" className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white"><Plus size={17} /> Novo utilizador</Link>} /><DataTable columns={columns} rows={list.rows} loading={list.loading} total={list.total} page={list.page} onPageChange={list.setPage} emptyText="Nenhum utilizador encontrado." /><ErrorSlot state={list} /></>;
}

export function ProcessesPage({ type }: { type?: 'SALE' | 'RENTAL' }) {
  const nav = useNavigate(); const { user } = useAuth(); const list = useList<Process>((page) => processesApi.list({ page, limit: 20, type, standId: isAdminGlobal(user) ? undefined : user?.standIds[0] }), [type, user?.role, user?.standIds.join(',')]);
  const columns: Column<Process>[] = [{ key: 'id', header: 'Processo', render: (r) => <b>#{r.id}</b> }, { key: 'type', header: 'Tipo', render: (r) => <Badge value={r.type} /> }, { key: 'client', header: 'Cliente', render: (r) => r.client?.name || `#${r.clientId}` }, { key: 'vehicle', header: 'Viatura', render: (r) => r.vehicle ? `${r.vehicle.brand} ${r.vehicle.model}` : `#${r.vehicleId}` }, { key: 'status', header: 'Estado', render: (r) => <Badge value={r.status} /> }, { key: 'createdAt', header: 'Data', render: (r) => date(r.createdAt) }, { key: 'actions', header: '', render: (r) => <button onClick={() => nav(`/processes/${r.id}`)} className="rounded-lg p-2 hover:bg-slate-100"><Eye size={16} /></button> }];
  return <><PageHeader title={type === 'SALE' ? 'Processos de venda' : type === 'RENTAL' ? 'Processos de aluguer' : 'Processos'} subtitle="Negociação e operacionalização antes do contrato" action={!type ? <Link to="/processes/new" className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white"><Plus size={17} /> Novo processo</Link> : undefined} /><DataTable columns={columns} rows={list.rows} loading={list.loading} total={list.total} page={list.page} onPageChange={list.setPage} emptyText="Nenhum processo encontrado." /><ErrorSlot state={list} /></>;
}

export function ContractsPage({ type }: { type?: 'SALE' | 'RENTAL' }) {
  const nav = useNavigate(); const { user } = useAuth(); const list = useList<Contract>((page) => contractsApi.list({ page, limit: 20, type, standId: isAdminGlobal(user) ? undefined : user?.standIds[0] }), [type, user?.role, user?.standIds.join(',')]);
  const columns: Column<Contract>[] = [{ key: 'id', header: 'Contrato', render: (r) => <b>#{r.id}</b> }, { key: 'type', header: 'Tipo', render: (r) => <Badge value={r.type} /> }, { key: 'client', header: 'Cliente', render: (r) => r.client?.name || `#${r.clientId}` }, { key: 'vehicle', header: 'Viatura', render: (r) => r.vehicle ? `${r.vehicle.brand} ${r.vehicle.model}` : `#${r.vehicleId}` }, { key: 'totalAmount', header: 'Valor', render: (r) => money(r.totalAmount) }, { key: 'amountPaid', header: 'Pago', render: (r) => money(r.amountPaid) }, { key: 'balance', header: 'Saldo', render: (r) => money(r.balance) }, { key: 'status', header: 'Estado', render: (r) => <Badge value={r.status} /> }, { key: 'actions', header: '', render: (r) => <button onClick={() => nav(`/contracts/${r.id}`)} className="rounded-lg p-2 hover:bg-slate-100"><Eye size={16} /></button> }];
  return <><PageHeader title={type === 'SALE' ? 'Vendas' : type === 'RENTAL' ? 'Alugueres' : 'Contratos'} subtitle="Contratos, valores e estado operacional" action={type === 'SALE' ? <Link to="/contracts/sale/new" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold"><Plus size={17} /> Contrato de venda</Link> : type === 'RENTAL' ? <Link to="/contracts/rental/new" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold"><Plus size={17} /> Contrato de aluguer</Link> : undefined} /><DataTable columns={columns} rows={list.rows} loading={list.loading} total={list.total} page={list.page} onPageChange={list.setPage} emptyText="Nenhum contrato encontrado." /><ErrorSlot state={list} /></>;
}

export function PaymentsPage() {
  const list = useList<Payment>((page) => paymentsApi.list({ page, limit: 20 }));
  const columns: Column<Payment>[] = [{ key: 'id', header: 'Pagamento', render: (r) => <b>#{r.id}</b> }, { key: 'contractId', header: 'Contrato', render: (r) => `#${r.contractId}` }, { key: 'installmentId', header: 'Prestação', render: (r) => r.installmentId ? `#${r.installmentId}` : '—' }, { key: 'amount', header: 'Valor', render: (r) => money(r.amount) }, { key: 'method', header: 'Método', render: (r) => <Badge value={r.method} /> }, { key: 'reference', header: 'Referência' }, { key: 'paidAt', header: 'Pago em', render: (r) => date(r.paidAt || r.createdAt) }];
  return <><PageHeader title="Pagamentos" subtitle="Comprovativos e movimentos operacionais" action={<Link to="/payments/new" className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold"><Plus size={17} /> Registar pagamento</Link>} /><DataTable columns={columns} rows={list.rows} loading={list.loading} total={list.total} page={list.page} onPageChange={list.setPage} emptyText="Nenhum pagamento encontrado." /><ErrorSlot state={list} /></>;
}

export function RentalReturnsPage() {
  const nav = useNavigate(); const [list, setList] = useState({ rows: [] as Contract[], total: 0, loading: true, error: '' });
  const load = () => { setList((s) => ({ ...s, loading: true, error: '' })); contractsApi.list({ type: 'RENTAL', page: 1, limit: 100 }).then((r) => setList({ rows: r.data, total: r.total, loading: false, error: '' })).catch((e) => setList((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : 'Não foi possível carregar os alugueres.' }))); };
  useEffect(load, []);
  const columns: Column<Contract>[] = [{ key: 'id', header: 'Contrato', render: (r) => <b>#{r.id}</b> }, { key: 'vehicle', header: 'Viatura', render: (r) => r.vehicle ? `${r.vehicle.brand} ${r.vehicle.model}` : `#${r.vehicleId}` }, { key: 'client', header: 'Cliente', render: (r) => r.client?.name || `#${r.clientId}` }, { key: 'endDate', header: 'Fim', render: (r) => date(r.endDate) }, { key: 'status', header: 'Estado', render: (r) => <Badge value={r.status} /> }, { key: 'actions', header: '', render: (r) => r.status === 'ACTIVE' ? <button onClick={() => nav(`/rental-returns/new?contractId=${r.id}`)} className="rounded-lg p-2 hover:bg-slate-100" title="Registar devolução"><RotateCcw size={16} /></button> : null }];
  return <><PageHeader title="Devoluções" subtitle="Alugueres disponíveis para registo de devolução" /><DataTable columns={columns} rows={list.rows} loading={list.loading} total={list.total} page={1} onPageChange={() => {}} emptyText="Nenhum aluguer encontrado." />{list.error && <ErrorState text={list.error} retry={load} />}</>;
}

export function TransfersPage() {
  const nav = useNavigate(); const { user } = useAuth(); const list = useList<Transfer>((page) => transfersApi.list({ page, limit: 20, fromStandId: isAdminGlobal(user) ? undefined : user?.standIds[0] }), [user?.role, user?.standIds.join(',')]);
  const columns: Column<Transfer>[] = [{ key: 'id', header: 'Transferência', render: (r) => <b>#{r.id}</b> }, { key: 'vehicle', header: 'Viatura', render: (r) => r.vehicle ? `${r.vehicle.brand} ${r.vehicle.model}` : `#${r.vehicleId}` }, { key: 'fromStand', header: 'Origem', render: (r) => r.fromStand?.name || `#${r.fromStandId}` }, { key: 'toStand', header: 'Destino', render: (r) => r.toStand?.name || `#${r.toStandId}` }, { key: 'status', header: 'Estado', render: (r) => <Badge value={r.status} /> }, { key: 'createdAt', header: 'Data', render: (r) => date(r.createdAt) }, { key: 'actions', header: '', render: (r) => <button onClick={() => nav(`/transfers/${r.id}`)} className="rounded-lg p-2 hover:bg-slate-100"><Eye size={16} /></button> }];
  return <><PageHeader title="Transferências" subtitle="Movimentação de viaturas entre stands" action={<Link to="/transfers/new" className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white"><Plus size={17} /> Nova transferência</Link>} /><DataTable columns={columns} rows={list.rows} loading={list.loading} total={list.total} page={list.page} onPageChange={list.setPage} emptyText="Nenhuma transferência encontrada." /><ErrorSlot state={list} /></>;
}
