import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Activity, ArrowLeftRight, BarChart3, Building2, CarFront, ClipboardList, CreditCard, FileCheck2, FileText, Gauge, LayoutDashboard, Menu, PanelLeftClose, Settings, ShieldCheck, UserCircle2, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { Role } from '../types/domain';

const commonOperation = [
  ['Veículos', '/vehicles', CarFront],
  ['Clientes', '/clients', Users],
  ['Processos', '/processes', ClipboardList],
  ['Vendas', '/sales', FileText],
  ['Alugueres', '/rentals', Activity],
  ['Contratos', '/contracts', FileText],
  ['Pagamentos', '/payments', CreditCard],
  ['Devoluções', '/rental-returns', FileCheck2],
];

const roleGroups = (role: Role) => [
  { label: 'Principal', items: [['Dashboard', '/dashboard', LayoutDashboard]] },
  {
    label: 'Operação',
    items: role === 'GESTOR' ? commonOperation : [...commonOperation, ['Transferências', '/transfers', ArrowLeftRight]],
  },
  ...(role === 'ADMIN_GLOBAL'
    ? [{ label: 'Gestão', items: [['Stands', '/stands', Building2], ['Utilizadores', '/users', Users], ['Relatórios', '/reports', BarChart3]] }]
    : role === 'MINI_ADMIN'
      ? [{ label: 'Gestão', items: [['Minha substand', '/stands', Building2]] }]
      : []),
  {
    label: 'Sistema',
    items: [
      ['Perfil', '/profile', UserCircle2],
      ...(role === 'ADMIN_GLOBAL' || role === 'MINI_ADMIN' ? [['Auditoria', '/audit', ShieldCheck]] : []),
      ...(role === 'ADMIN_GLOBAL' ? [['Configurações', '/settings', Settings]] : []),
    ],
  },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const groups = user ? roleGroups(user.role) : [];

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={`${mobile ? 'fixed left-0 top-0 z-50 w-64' : 'fixed bottom-0 left-0 top-0 hidden lg:block'} ${collapsed && !mobile ? 'w-20' : 'w-64'} h-screen border-r border-slate-800 bg-slate-950 text-white transition-all`}>
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <div className={`flex items-center gap-3 overflow-hidden ${collapsed && !mobile ? 'w-full justify-center' : ''}`}>
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-red-600 font-black">A</div>
            {(!collapsed || mobile) && <div><div className="font-bold leading-none">AutoStand</div><div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">Operations</div></div>}
          </div>
          {mobile ? <button type="button" onClick={() => setMobileOpen(false)} className="text-slate-500 hover:text-white">×</button> : <button type="button" onClick={() => setCollapsed((v) => !v)} className="text-slate-500 hover:text-white">{collapsed ? <Menu size={17} /> : <PanelLeftClose size={17} />}</button>}
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group) => <div key={group.label} className="mb-6"><p className={`${collapsed && !mobile ? 'sr-only' : ''} px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500`}>{group.label}</p>{group.items.map(([label, path, Icon]) => <NavLink key={String(path)} to={String(path)} onClick={() => setMobileOpen(false)} className={({ isActive }) => `mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-white text-slate-950' : 'text-slate-400 hover:bg-slate-900 hover:text-white'} ${collapsed && !mobile ? 'justify-center' : ''}`}><Icon size={18} />{(!collapsed || mobile) && <span>{String(label)}</span>}</NavLink>)}</div>)}
        </div>
        <div className="border-t border-slate-800 p-3"><button type="button" onClick={logout} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-slate-900 hover:text-white ${collapsed && !mobile ? 'justify-center' : ''}`}><Activity size={18} />{(!collapsed || mobile) && <span>Terminar sessão</span>}</button></div>
      </div>
    </aside>
  );

  return <div className="min-h-screen bg-slate-50"><Sidebar />{mobileOpen && <><div className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" onClick={() => setMobileOpen(false)} /><div className="lg:hidden"><Sidebar mobile /></div></>}<div className={`${collapsed ? 'lg:ml-20' : 'lg:ml-64'} min-h-screen transition-all`}><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6"><button type="button" className="lg:hidden" onClick={() => setMobileOpen(true)}><Menu size={22} /></button><div className="flex items-center gap-3"><Gauge className="hidden text-red-600 sm:block" size={18} /><div className="text-sm font-semibold text-slate-800">Painel Operacional</div></div><div className="flex items-center gap-3"><div className="hidden text-right sm:block"><div className="text-sm font-semibold text-slate-800">{user?.name}</div><div className="text-xs text-slate-400">{user?.role}</div></div><div className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-700"><UserCircle2 size={20} /></div></div></header><main className="mx-auto max-w-[1600px] p-4 sm:p-6"><Outlet /></main></div></div>;
}
