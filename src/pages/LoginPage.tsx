import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { LogIn, ShieldCheck } from 'lucide-react';
import { loginSchema } from '../schemas/forms';
import { useAuth } from '../contexts/AuthContext';
import { Field, inputClass } from '../components/Field';
import { Button } from '../components/Button';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ email: string; password: string }>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const submit = async (data: { email: string; password: string }) => {
    setError('');
    try {
      const loggedUser = await login(data.email, data.password);
      navigate(loggedUser.role === 'CLIENTE' ? '/portal' : '/dashboard', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível iniciar sessão.');
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-600 font-black">A</div>
          <span className="font-bold">AutoStand</span>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">Operations platform</p>
          <h1 className="mt-5 max-w-lg text-5xl font-black leading-tight">Uma visão operacional de todos os teus stands.</h1>
          <p className="mt-5 max-w-lg text-slate-400">Veículos, clientes, processos, contratos, pagamentos, alugueres e transferências num único painel.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500"><ShieldCheck size={16} /> Sessões protegidas por JWT</div>
      </div>

      <div className="grid place-items-center p-5">
        <form onSubmit={handleSubmit(submit)} className="w-full max-w-md">
          <div className="mb-8">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600"><LogIn /></div>
            <h2 className="text-3xl font-black">Entrar</h2>
            <p className="mt-2 text-sm text-slate-500">Acede ao painel operacional do AutoStand.</p>
          </div>
          <div className="space-y-5">
            <Field label="Email" error={errors.email?.message}>
              <input {...register('email')} type="email" autoComplete="email" placeholder="nome@empresa.com" className={inputClass} />
            </Field>
            <Field label="Palavra-passe" error={errors.password?.message}>
              <input {...register('password')} type="password" autoComplete="current-password" placeholder="A tua palavra-passe" className={inputClass} />
            </Field>
            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <Button type="submit" loading={isSubmitting} className="w-full py-3">Entrar</Button>
          </div>
          <p className="mt-8 text-center text-xs text-slate-400">A autenticação usa a API real do AutoStand.</p>
        </form>
      </div>
    </div>
  );
}
