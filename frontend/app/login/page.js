'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { saveSession } from '../../lib/auth';
import Button from '../../components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
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
  return <main className="flex min-h-screen items-center justify-center p-4">
    <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow">
      <h1 className="text-2xl font-bold">Shoe Shop Login</h1>
      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <input className="w-full rounded border p-2" placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input className="w-full rounded border p-2" placeholder="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <Button>Sign in</Button>
      <p className="text-xs text-slate-500">Demo owner: owner@shoeshop.local / owner123</p>
    </form>
  </main>;
}
