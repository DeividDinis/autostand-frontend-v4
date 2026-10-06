import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DataTable, type Column } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { ErrorState } from '../components/StateView';
import { auditApi } from '../api/audit.api';
import { date } from '../utils/format';
import type { AuditLog } from '../types/domain';

export function AuditPage() {
  const { user } = useAuth(); const [rows, setRows] = useState<AuditLog[]>([]); const [total, setTotal] = useState(0); const [page, setPage] = useState(1); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = (p = page) => { setLoading(true); setError(''); auditApi.list({ page: p, limit: 20, standId: user?.role === 'MINI_ADMIN' ? user.standIds[0] : undefined }).then((r) => { setRows(r.data); setTotal(r.total); }).catch((e) => setError(e instanceof Error ? e.message : 'Não foi possível carregar a auditoria.')).finally(() => setLoading(false)); };
  useEffect(() => { load(page); }, [page, user?.role, user?.standIds.join(',')]);
  const columns: Column<AuditLog>[] = [{ key: 'createdAt', header: 'Data', render: (r) => date(r.createdAt) }, { key: 'user', header: 'Utilizador', render: (r) => r.user?.name || `#${r.userId}` }, { key: 'action', header: 'Ação' }, { key: 'method', header: 'Método' }, { key: 'endpoint', header: 'Endpoint' }, { key: 'status', header: 'Status' }, { key: 'entity', header: 'Entidade' }];
  return <><PageHeader title="Auditoria" subtitle="Registos automáticos das requisições autenticadas" /><DataTable columns={columns} rows={rows} loading={loading} total={total} page={page} onPageChange={(p) => setPage(p)} emptyText="Nenhum registo de auditoria encontrado." />{error && <ErrorState text={error} retry={() => load(page)} />}</>;
}
