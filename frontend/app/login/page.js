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
  const [showPassword, setShowPassword] = useState(false);

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
          <span className="relative mt-1.5 block">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder={t('Enter your password')}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-12 text-[13px] text-slate-900 placeholder:text-slate-400 transition-colors focus-visible:outline-none focus-visible:border-slate-400"
            />
            <button
              type="button"
              aria-label={t(showPassword ? 'Hide password' : 'Show password')}
              title={t(showPassword ? 'Hide password' : 'Show password')}
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-lg text-slate-500 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-yellow-500"
            >
              {showPassword ? (
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.9 5.2A10.7 10.7 0 0112 5c5.2 0 8.7 4.2 9.5 6-.3.7-1.1 2-2.4 3.2M6.2 6.2C3.9 7.7 2.8 10 2.5 11c.8 1.8 4.3 6 9.5 6 1 0 1.9-.2 2.7-.5" />
                </svg>
              ) : (
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>
              )}
            </button>
          </span>
        </label>

        <Button className="w-full">{t('Sign in')}</Button>

        <p className="border-t border-slate-100 pt-4 text-center text-[11.5px] leading-relaxed text-slate-400">
          {t('Use the username and password provided by the Owner.')}
        </p>
      </form>
    </main>
  );
}