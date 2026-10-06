import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gauge, Plus, RotateCcw, Users } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { LoadingState, ErrorState } from '../components/StateView';
import { money, date } from '../utils/format';
import { dashboardApi } from '../api/dashboard.api';
import { useAuth } from '../contexts/AuthContext';
import { canCreateVehicle } from '../utils/permissions';
import type { DashboardData } from '../types/domain';

const cards: [keyof NonNullable<DashboardData['cards']>, string, typeof Gauge][] = [
  ['totalVehicles','Total de viaturas',Gauge], ['available','Disponíveis',Gauge], ['sold','Vendidos',Gauge], ['rented','Alugados',Gauge], ['maintenance','Em manutenção',Gauge], ['activeProcesses','Processos ativos',Gauge], ['activeContracts','Contratos ativos',Gauge], ['pendingPayments','Pagamentos pendentes',Gauge], ['overduePayments','Pagamentos em atraso',Gauge], ['pendingTransfers','Transferências pendentes',Gauge],
];

export function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = () => { setLoading(true); setError(''); dashboardApi.get(user?.role === 'ADMIN_GLOBAL' ? undefined : { standId: user?.standIds[0] }).then(setData).catch((e) => setError(e instanceof Error ? e.message : 'Não foi possível carregar o dashboard.')).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, [user?.role, user?.standIds.join(',')]);
  return <><PageHeader title="Dashboard" subtitle="Resumo operacional devolvido pela API" action={canCreateVehicle(user) ? <Link to="/vehicles/new" className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white"><Plus size={17}/> Nova viatura</Link> : undefined}/>{loading ? <LoadingState/> : error ? <ErrorState text={error} retry={load}/> : data ? <DashboardContent data={data}/> : null}</>;
}

function DashboardContent({ data }: { data: DashboardData }) {
  const c = data.cards ?? {}; const series = data.salesByPeriod ?? []; const rentals = data.rentalsByPeriod ?? []; const receipts = data.receiptsByPeriod ?? [];
  return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([key,label,Icon]) => <div key={key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700"><Icon size={19}/></div><p className="mt-5 text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-black">{c[key] ?? 0}</p></div>)}</div><div className="grid gap-6 xl:grid-cols-3"><ChartCard title="Vendas por período" items={series}/><ChartCard title="Alugueres por período" items={rentals}/><ChartCard title="Recebimentos" items={receipts} moneyMode/></div><div className="grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold">Viaturas por estado</h2><p className="text-sm text-slate-400">Distribuição devolvida pela API</p></div><Gauge size={19} className="text-slate-400"/></div><div className="space-y-3">{(data.vehiclesByStatus ?? []).map(x => <div key={x.label}><div className="mb-1 flex justify-between text-xs"><span>{x.label}</span><b>{x.value}</b></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-red-600" style={{width:`${Math.min(100,x.value)}%`}}/></div></div>)}</div></section><section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold">Atividade recente</h2><p className="text-sm text-slate-400">Operações recentes</p></div><RotateCcw size={18} className="text-slate-400"/></div><div className="space-y-3">{(data.recentActivity ?? []).map(a => <div key={a.id} className="rounded-xl bg-slate-50 p-3"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase text-red-600">{a.type}</span><span className="text-xs text-slate-400">{date(a.createdAt)}</span></div><p className="mt-1 text-sm text-slate-700">{a.description}</p></div>)}</div></section></div><section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="mb-4 flex items-center gap-2"><Users size={18}/><h2 className="font-bold">Performance por stand</h2></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{(data.performanceByStand ?? []).map(x => <div key={x.label} className="rounded-xl border border-slate-100 p-4"><p className="text-xs text-slate-400">{x.label}</p><p className="mt-1 text-xl font-black">{money(x.value)}</p></div>)}</div></section></div>;
}

function ChartCard({title,items,moneyMode=false}:{title:string;items:{label:string;value:number}[];moneyMode?:boolean}) { const max=Math.max(1,...items.map(x=>x.value)); return <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-bold">{title}</h2><div className="mt-5 space-y-3">{items.map(x=><div key={x.label}><div className="mb-1 flex justify-between text-xs"><span>{x.label}</span><b>{moneyMode?money(x.value):x.value}</b></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-900" style={{width:`${Math.round((x.value/max)*100)}%`}}/></div></div>)}</div></section>; }
