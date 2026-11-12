'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { saveSession } from '../../lib/auth';
import Button from '../../components/ui/Button';
import LanguageSelector from '../../components/ui/LanguageSelector';
import { useLanguage } from '../../lib/language';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      saveSession(data);
      router.push(data.user.role === 'OWNER' ? '/dashboard' : '/cashier/sales');
    } catch (err) { setError(err.response?.data?.error || 'Unable to sign in'); }
  }
  return <main className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 p-4"><LanguageSelector className="absolute right-4 top-4" />
    <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
      <div className="text-center"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-2xl text-white">S</div><h1 className="text-3xl font-bold tracking-tight text-slate-900">{t('Welcome back')}</h1><p className="mt-2 text-sm text-slate-500">{t('Sign in to manage your shoe shop')}</p></div>
      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <label className="block text-sm font-medium text-slate-700">{t('Email')}<input className="mt-2 w-full rounded-lg border border-slate-300 p-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200" placeholder="you@example.com" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label className="block text-sm font-medium text-slate-700">{t('Password')}<input className="mt-2 w-full rounded-lg border border-slate-300 p-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200" placeholder={t('Enter your password')} type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
      <div className="flex justify-end"><Button>{t('Sign in')}</Button></div>
      <p className="border-t border-slate-100 pt-4 text-center text-xs text-slate-500">Demo owner: owner@shoeshop.local / owner123</p>
    </form>
  </main>;
}
