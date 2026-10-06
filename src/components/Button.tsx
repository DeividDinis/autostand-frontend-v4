import { Loader2 } from 'lucide-react';
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; variant?: 'primary'|'secondary'|'danger'|'ghost' };
export function Button({ loading, variant='primary', children, className='', disabled, ...props }: Props) {
  const styles = { primary:'bg-slate-950 text-white hover:bg-slate-800', secondary:'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50', danger:'bg-red-600 text-white hover:bg-red-700', ghost:'text-slate-600 hover:bg-slate-100' };
  return <button {...props} disabled={disabled || loading} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}>{loading && <Loader2 className="animate-spin" size={16}/>} {children}</button>;
}
