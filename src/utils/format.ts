export function money(value?: number | null) {
  if (value == null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(value);
}
export function date(value?: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-AO', { dateStyle: 'medium' }).format(new Date(value));
}
export function labelize(value?: string | null) {
  if (!value) return '—';
  return value.toLowerCase().replace(/_/g, ' ').replace(/^\w/, (c: string) => c.toUpperCase());
}
