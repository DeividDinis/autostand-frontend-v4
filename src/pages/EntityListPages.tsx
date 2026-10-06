import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Pencil, Plus, RotateCcw } from 'lucide-react';

import { DataTable, type Column } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { ErrorState } from '../components/StateView';
import { money, date } from '../utils/format';
import { useAuth } from '../contexts/AuthContext';

import { vehiclesApi } from '../api/vehicles.api';
import { clientsApi } from '../api/clients.api';
import { standsApi } from '../api/stands.api';
import { processesApi } from '../api/processes.api';
import { contractsApi } from '../api/contracts.api';
import { usersApi } from '../api/users.api';

import type {
  Vehicle,
  VehicleStatus,
  Client,
  Stand,
  Process,
  Contract,
  User,
} from '../types/domain';

type ListResponse<T> = {
  data: T[];
  total: number;
};

function useList<T>(
  load: (page: number) => Promise<ListResponse<T>>,
  watch: readonly unknown[] = [],
) {
  const [state, setState] = useState({
    rows: [] as T[],
    total: 0,
    loading: true,
    error: '',
  });
  const [page, setPage] = useState(1);

  const run = (pageNumber: number) => {
    setState((current) => ({
      ...current,
      loading: true,
      error: '',
    }));

    load(pageNumber)
      .then((result) => {
        setState({
          rows: result.data ?? [],
          total: result.total ?? 0,
          loading: false,
          error: '',
        });
      })
      .catch((error: unknown) => {
        setState((current) => ({
          ...current,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar os dados.',
        }));
      });
  };

  useEffect(() => {
    run(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, ...watch]);

  return {
    ...state,
    page,
    setPage,
    reload: () => run(page),
  };
}

function ErrorSlot({
  state,
}: {
  state: { error: string; reload: () => void };
}) {
  if (!state.error) return null;

  return (
    <div className="mt-4">
      <ErrorState text={state.error} retry={state.reload} />
    </div>
  );
}

function getScopedStandId(
  role: string | undefined,
  standIds: number[] | undefined,
): number | undefined {
  if (role === 'ADMIN_GLOBAL') return undefined;
  return standIds?.[0];
}

export function VehiclesPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<VehicleStatus | ''>('');

  const canCreateVehicle =
    user?.role === 'ADMIN_GLOBAL' ||
    user?.role === 'MINI_ADMIN' ||
    user?.role === 'GESTOR';

  const list = useList<Vehicle>(
    (page) => {
      if (!user) return Promise.resolve({ data: [], total: 0 });

      return vehiclesApi.list({
        page,
        limit: 20,
        search,
        status: status || undefined,
        standId: getScopedStandId(user.role, user.standIds),
      });
    },
    [search, status, user?.role, user?.standIds?.join(',')],
  );

  const columns: Column<Vehicle>[] = [
    {
      key: 'brand',
      header: 'Viatura',
      render: (row) => (
        <div>
          <b>
            {row.brand} {row.model}
          </b>
          <div className="text-xs text-slate-400">{row.color || '—'}</div>
        </div>
      ),
    },
    { key: 'plate', header: 'Matrícula' },
    { key: 'year', header: 'Ano' },
    {
      key: 'stand',
      header: 'Stand',
      render: (row) => row.stand?.name || row.standId,
    },
    {
      key: 'salePrice',
      header: 'Preço',
      render: (row) => money(row.salePrice),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (row) => <Badge value={row.status} />,
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => nav(`/vehicles/${row.id}`)}
            className="rounded-lg p-2 hover:bg-slate-100"
            title="Ver viatura"
          >
            <Eye size={16} />
          </button>
          {canCreateVehicle && (
            <button
              type="button"
              onClick={() => nav(`/vehicles/${row.id}/edit`)}
              className="rounded-lg p-2 hover:bg-slate-100"
              title="Editar viatura"
            >
              <Pencil size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Veículos"
        subtitle="Inventário operacional por stand"
        action={
          canCreateVehicle ? (
            <Link
              to="/vehicles/new"
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white"
            >
              <Plus size={17} />
              Nova viatura
            </Link>
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as VehicleStatus | '');
            list.setPage(1);
          }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
        >
          <option value="">Todos os estados</option>
          {[
            'AVAILABLE',
            'PROCESSING',
            'SOLD',
            'RENTED',
            'MAINTENANCE',
            'TRANSFER_PENDING',
            'INACTIVE',
          ].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        rows={list.rows}
        loading={list.loading}
        total={list.total}
        page={list.page}
        onPageChange={list.setPage}
        search={search}
        onSearch={(value) => {
          setSearch(value);
          list.setPage(1);
        }}
        emptyText="Nenhuma viatura encontrada."
      />

      <ErrorSlot state={list} />
    </>
  );
}

export function ClientsPage() {
  const nav = useNavigate();
  const [search, setSearch] = useState('');

  const list = useList<Client>(
    (page) => clientsApi.list({ page, limit: 20, search }),
    [search],
  );

  const columns: Column<Client>[] = [
    { key: 'name', header: 'Cliente', render: (row) => <b>{row.name}</b> },
    { key: 'phone', header: 'Telefone' },
    { key: 'email', header: 'Email' },
    { key: 'document', header: 'Documento' },
    { key: 'processesCount', header: 'Processos' },
    { key: 'contractsCount', header: 'Contratos' },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <button
          type="button"
          onClick={() => nav(`/clients/${row.id}`)}
          className="rounded-lg p-2 hover:bg-slate-100"
          title="Ver cliente"
        >
          <Eye size={16} />
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Clientes"
        subtitle="Base de clientes e histórico operacional"
        action={
          <Link
            to="/clients/new"
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white"
          >
            <Plus size={17} />
            Novo cliente
          </Link>
        }
      />

      <DataTable
        columns={columns}
        rows={list.rows}
        loading={list.loading}
        total={list.total}
        page={list.page}
        onPageChange={list.setPage}
        search={search}
        onSearch={(value) => {
          setSearch(value);
          list.setPage(1);
        }}
        emptyText="Nenhum cliente encontrado."
      />

      <ErrorSlot state={list} />
    </>
  );
}

export function StandsPage() {
  const nav = useNavigate();
  const { user } = useAuth();

  const loadStands = (page: number): Promise<ListResponse<Stand>> => {
    if (!user) return Promise.resolve({ data: [], total: 0 });

    if (user.role === 'MINI_ADMIN') {
      const standIds = user.standIds ?? [];

      return Promise.all(standIds.map((id) => standsApi.get(id))).then((data) => ({
        data,
        total: data.length,
      }));
    }

    return standsApi.list({ page, limit: 20 });
  };

  const list = useList<Stand>(
    loadStands,
    [user?.role, user?.standIds?.join(',')],
  );

  const canCreateStand = user?.role === 'ADMIN_GLOBAL';

  const columns: Column<Stand>[] = [
    {
      key: 'name',
      header: 'Stand',
      render: (row) => (
        <div>
          <b>{row.name}</b>
          <div className="text-xs text-slate-400">{row.code}</div>
        </div>
      ),
    },
    { key: 'phone', header: 'Telefone' },
    { key: 'address', header: 'Endereço' },
    {
      key: 'parentStand',
      header: 'Stand pai',
      render: (row) => row.parentStand?.name || row.parentStandId || 'Principal',
    },
    { key: 'vehicleCount', header: 'Veículos' },
    {
      key: 'status',
      header: 'Estado',
      render: (row) => <Badge value={row.status || 'ACTIVE'} />,
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <button
          type="button"
          onClick={() => nav(`/stands/${row.id}`)}
          className="rounded-lg p-2 hover:bg-slate-100"
          title="Ver stand"
        >
          <Eye size={16} />
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Stands"
        subtitle="Estrutura multi-stand e substands"
        action={
          canCreateStand ? (
            <Link
              to="/stands/new"
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white"
            >
              <Plus size={17} />
              Novo stand
            </Link>
          ) : undefined
        }
      />

      <DataTable
        columns={columns}
        rows={list.rows}
        loading={list.loading}
        total={list.total}
        page={list.page}
        onPageChange={list.setPage}
        emptyText="Nenhum stand encontrado."
      />

      <ErrorSlot state={list} />
    </>
  );
}

export function UsersPage() {
  const nav = useNavigate();
  const list = useList<User>((page) => usersApi.list({ page, limit: 20 }));

  const columns: Column<User>[] = [
    { key: 'name', header: 'Utilizador', render: (row) => <b>{row.name}</b> },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Cargo', render: (row) => <Badge value={row.role} /> },
    {
      key: 'status',
      header: 'Estado',
      render: (row) => <Badge value={row.status || 'ACTIVE'} />,
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <button
          type="button"
          onClick={() => nav(`/users/${row.id}`)}
          className="rounded-lg p-2 hover:bg-slate-100"
          title="Ver utilizador"
        >
          <Eye size={16} />
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Utilizadores"
        subtitle="Cargos, estados e associações a stands"
        action={
          <Link
            to="/users/new"
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white"
          >
            <Plus size={17} />
            Novo utilizador
          </Link>
        }
      />

      <DataTable
        columns={columns}
        rows={list.rows}
        loading={list.loading}
        total={list.total}
        page={list.page}
        onPageChange={list.setPage}
        emptyText="Nenhum utilizador encontrado."
      />

      <ErrorSlot state={list} />
    </>
  );
}

export function ProcessesPage({ type }: { type?: 'SALE' | 'RENTAL' }) {
  const nav = useNavigate();
  const { user } = useAuth();

  const list = useList<Process>(
    (page) => {
      if (!user) return Promise.resolve({ data: [], total: 0 });

      return processesApi.list({
        page,
        limit: 20,
        type,
        standId: getScopedStandId(user.role, user.standIds),
      });
    },
    [type, user?.role, user?.standIds?.join(',')],
  );

  const columns: Column<Process>[] = [
    { key: 'id', header: 'Processo', render: (row) => <b>#{row.id}</b> },
    { key: 'type', header: 'Tipo', render: (row) => <Badge value={row.type} /> },
    {
      key: 'client',
      header: 'Cliente',
      render: (row) => row.client?.name || `#${row.clientId}`,
    },
    {
      key: 'vehicle',
      header: 'Viatura',
      render: (row) =>
        row.vehicle
          ? `${row.vehicle.brand} ${row.vehicle.model}`
          : `#${row.vehicleId}`,
    },
    { key: 'status', header: 'Estado', render: (row) => <Badge value={row.status} /> },
    { key: 'createdAt', header: 'Data', render: (row) => date(row.createdAt) },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <button
          type="button"
          onClick={() => nav(`/processes/${row.id}`)}
          className="rounded-lg p-2 hover:bg-slate-100"
          title="Ver processo"
        >
          <Eye size={16} />
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={
          type === 'SALE'
            ? 'Processos de venda'
            : type === 'RENTAL'
              ? 'Processos de aluguer'
              : 'Processos'
        }
        subtitle="Negociação e operacionalização antes do contrato"
        action={
          !type ? (
            <Link
              to="/processes/new"
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white"
            >
              <Plus size={17} />
              Novo processo
            </Link>
          ) : undefined
        }
      />

      <DataTable
        columns={columns}
        rows={list.rows}
        loading={list.loading}
        total={list.total}
        page={list.page}
        onPageChange={list.setPage}
        emptyText="Nenhum processo encontrado."
      />

      <ErrorSlot state={list} />
    </>
  );
}

export function ContractsPage({ type }: { type?: 'SALE' | 'RENTAL' }) {
  const nav = useNavigate();
  const { user } = useAuth();

  const list = useList<Contract>(
    (page) => {
      if (!user) return Promise.resolve({ data: [], total: 0 });

      return contractsApi.list({
        page,
        limit: 20,
        type,
        standId: getScopedStandId(user.role, user.standIds),
      });
    },
    [type, user?.role, user?.standIds?.join(',')],
  );

  const columns: Column<Contract>[] = [
    { key: 'id', header: 'Contrato', render: (row) => <b>#{row.id}</b> },
    { key: 'type', header: 'Tipo', render: (row) => <Badge value={row.type} /> },
    {
      key: 'client',
      header: 'Cliente',
      render: (row) => row.client?.name || `#${row.clientId}`,
    },
    {
      key: 'vehicle',
      header: 'Viatura',
      render: (row) =>
        row.vehicle
          ? `${row.vehicle.brand} ${row.vehicle.model}`
          : `#${row.vehicleId}`,
    },
    { key: 'totalAmount', header: 'Valor', render: (row) => money(row.totalAmount) },
    { key: 'amountPaid', header: 'Pago', render: (row) => money(row.amountPaid) },
    { key: 'balance', header: 'Saldo', render: (row) => money(row.balance) },
    { key: 'status', header: 'Estado', render: (row) => <Badge value={row.status} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <button
          type="button"
          onClick={() => nav(`/contracts/${row.id}`)}
          className="rounded-lg p-2 hover:bg-slate-100"
          title="Ver contrato"
        >
          <Eye size={16} />
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={
          type === 'SALE' ? 'Vendas' : type === 'RENTAL' ? 'Alugueres' : 'Contratos'
        }
        subtitle="Contratos, valores e estado operacional"
        action={
          type === 'SALE' ? (
            <Link
              to="/contracts/sale/new"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold"
            >
              <Plus size={17} />
              Contrato de venda
            </Link>
          ) : type === 'RENTAL' ? (
            <Link
              to="/contracts/rental/new"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold"
            >
              <Plus size={17} />
              Contrato de aluguer
            </Link>
          ) : undefined
        }
      />

      <DataTable
        columns={columns}
        rows={list.rows}
        loading={list.loading}
        total={list.total}
        page={list.page}
        onPageChange={list.setPage}
        emptyText="Nenhum contrato encontrado."
      />

      <ErrorSlot state={list} />
    </>
  );
}

export function PaymentsPage() {
  const nav = useNavigate();
  const { user } = useAuth();

  const list = useList<Contract>(
    (page) => {
      if (!user) return Promise.resolve({ data: [], total: 0 });

      return contractsApi.list({
        page,
        limit: 20,
        standId: getScopedStandId(user.role, user.standIds),
      });
    },
    [user?.role, user?.standIds?.join(',')],
  );

  const columns: Column<Contract>[] = [
    { key: 'id', header: 'Contrato', render: (row) => <b>#{row.id}</b> },
    {
      key: 'client',
      header: 'Cliente',
      render: (row) => row.client?.name || `#${row.clientId}`,
    },
    {
      key: 'vehicle',
      header: 'Viatura',
      render: (row) =>
        row.vehicle
          ? `${row.vehicle.brand} ${row.vehicle.model}`
          : `#${row.vehicleId}`,
    },
    { key: 'type', header: 'Tipo', render: (row) => <Badge value={row.type} /> },
    { key: 'totalAmount', header: 'Total', render: (row) => money(row.totalAmount) },
    { key: 'amountPaid', header: 'Pago', render: (row) => money(row.amountPaid) },
    { key: 'balance', header: 'Saldo', render: (row) => money(row.balance) },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <button
          type="button"
          onClick={() => nav(`/contracts/${row.id}`)}
          className="rounded-lg p-2 hover:bg-slate-100"
          title="Ver pagamentos do contrato"
        >
          <Eye size={16} />
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Pagamentos"
        subtitle="Os pagamentos são consultados no detalhe de cada contrato"
        action={
          <Link
            to="/payments/new"
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white"
          >
            <Plus size={17} />
            Registar pagamento
          </Link>
        }
      />

      <DataTable
        columns={columns}
        rows={list.rows}
        loading={list.loading}
        total={list.total}
        page={list.page}
        onPageChange={list.setPage}
        emptyText="Nenhum contrato encontrado."
      />

      <ErrorSlot state={list} />
    </>
  );
}

export function InstallmentsPage() {
  const nav = useNavigate();
  const { user } = useAuth();

  const list = useList<Contract>(
    (page) => {
      if (!user) return Promise.resolve({ data: [], total: 0 });

      return contractsApi.list({
        page,
        limit: 20,
        type: 'SALE',
        standId: getScopedStandId(user.role, user.standIds),
      });
    },
    [user?.role, user?.standIds?.join(',')],
  );

  const columns: Column<Contract>[] = [
    { key: 'id', header: 'Contrato', render: (row) => <b>#{row.id}</b> },
    {
      key: 'client',
      header: 'Cliente',
      render: (row) => row.client?.name || `#${row.clientId}`,
    },
    {
      key: 'vehicle',
      header: 'Viatura',
      render: (row) =>
        row.vehicle
          ? `${row.vehicle.brand} ${row.vehicle.model}`
          : `#${row.vehicleId}`,
    },
    { key: 'totalAmount', header: 'Plano total', render: (row) => money(row.totalAmount) },
    { key: 'amountPaid', header: 'Pago', render: (row) => money(row.amountPaid) },
    { key: 'balance', header: 'Saldo', render: (row) => money(row.balance) },
    { key: 'status', header: 'Estado', render: (row) => <Badge value={row.status} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <button
          type="button"
          onClick={() => nav(`/contracts/${row.id}`)}
          className="rounded-lg p-2 hover:bg-slate-100"
          title="Ver prestações"
        >
          <Eye size={16} />
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Prestações"
        subtitle="As prestações são consultadas no detalhe do contrato de venda"
      />

      <DataTable
        columns={columns}
        rows={list.rows}
        loading={list.loading}
        total={list.total}
        page={list.page}
        onPageChange={list.setPage}
        emptyText="Nenhum contrato de venda encontrado."
      />

      <ErrorSlot state={list} />
    </>
  );
}

export function RentalReturnsPage() {
  const nav = useNavigate();
  const { user } = useAuth();

  const list = useList<Contract>(
    (page) => {
      if (!user) return Promise.resolve({ data: [], total: 0 });

      return contractsApi.list({
        type: 'RENTAL',
        page,
        limit: 20,
        standId: getScopedStandId(user.role, user.standIds),
      });
    },
    [user?.role, user?.standIds?.join(',')],
  );

  const columns: Column<Contract>[] = [
    { key: 'id', header: 'Contrato', render: (row) => <b>#{row.id}</b> },
    {
      key: 'vehicle',
      header: 'Viatura',
      render: (row) =>
        row.vehicle
          ? `${row.vehicle.brand} ${row.vehicle.model}`
          : `#${row.vehicleId}`,
    },
    {
      key: 'client',
      header: 'Cliente',
      render: (row) => row.client?.name || `#${row.clientId}`,
    },
    { key: 'endDate', header: 'Fim', render: (row) => date(row.endDate) },
    { key: 'status', header: 'Estado', render: (row) => <Badge value={row.status} /> },
    {
      key: 'actions',
      header: '',
      render: (row) =>
        row.status === 'ACTIVE' ? (
          <button
            type="button"
            onClick={() => nav(`/rental-returns/new?contractId=${row.id}`)}
            className="rounded-lg p-2 hover:bg-slate-100"
            title="Registar devolução"
          >
            <RotateCcw size={16} />
          </button>
        ) : null,
    },
  ];

  return (
    <>
      <PageHeader
        title="Devoluções"
        subtitle="Alugueres disponíveis para registo de devolução"
      />

      <DataTable
        columns={columns}
        rows={list.rows}
        loading={list.loading}
        total={list.total}
        page={list.page}
        onPageChange={list.setPage}
        emptyText="Nenhum aluguer encontrado."
      />

      <ErrorSlot state={list} />
    </>
  );
}

export function TransfersPage() {
  return (
    <>
      <PageHeader
        title="Transferências"
        subtitle="Movimentação de viaturas entre stands"
        action={
          <Link
            to="/transfers/new"
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white"
          >
            <Plus size={17} />
            Nova transferência
          </Link>
        }
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">
          Consulta de transferências
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          A API atual permite criar, aprovar, rejeitar, concluir e cancelar
          transferências, mas não fornece uma rota GET para listar
          transferências. Por isso, o frontend não faz uma chamada inexistente.
        </p>
      </div>
    </>
  );
}
