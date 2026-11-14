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

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      saveSession(data);
      router.push(data.user.role === 'OWNER' ? '/dashboard' : '/cashier/sales');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to sign in');
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-white p-4">
      <LanguageSelector className="absolute right-4 top-4" />

      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-6 rounded-2xl border border-slate-200/70 bg-white p-8"
      >
        <div>
          
          <h1 className="text-2xl font-semibold leading-tight tracking-[-0.025em] text-slate-950">
            {t('Welcome back')}
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
            {t('Sign in to manage your shoe shop')}
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-red-100 bg-red-50/60 px-3 py-2 text-[13px] font-medium text-red-700">
            {error}
          </p>
        )}

        <label className="block text-[13px] font-medium text-slate-700">
          {t('Username')}
          <input
            type="text"
            autoComplete="username"
            required
            placeholder={t('Enter your username')}
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 transition-colors focus-visible:outline-none focus-visible:border-slate-400"
          />
        </label>

        <label className="block text-[13px] font-medium text-slate-700">
          {t('Password')}
          <input
            type="password"
            required
            autoComplete="current-password"
            placeholder={t('Enter your password')}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 transition-colors focus-visible:outline-none focus-visible:border-slate-400"
          />
        </label>

        <Button className="w-full">{t('Sign in')}</Button>

        <p className="border-t border-slate-100 pt-4 text-center text-[11.5px] leading-relaxed text-slate-400">
          {t('Use the username and password provided by the Owner.')}
        </p>
      </form>
    </main>
  );
}