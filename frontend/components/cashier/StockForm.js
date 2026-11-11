'use client';
import { useState } from 'react';
import api from '../../lib/api';
import Button from '../ui/Button';

export default function StockForm({ mode }) {
  const [form, setForm] = useState({ productId: '', quantity: 1, toStoreId: '1', notes: '' });
  const [message, setMessage] = useState('');
  async function submit(event) {
    event.preventDefault();
    try {
      await api.post(`/inventory/${mode}`, {
        productId: Number(form.productId),
        quantity: Number(form.quantity),
        ...(mode === 'export' ? { toStoreId: Number(form.toStoreId) } : {}),
        notes: form.notes || undefined
      });
      setMessage(mode === 'import' ? 'Stock imported.' : 'Stock transferred.');
    } catch (error) { setMessage(error.response?.data?.error || 'Unable to update stock'); }
  }
  return <form onSubmit={submit} className="max-w-xl space-y-4 rounded-xl bg-white p-6 shadow">
    <input className="w-full rounded border p-2" required type="number" min="1" placeholder="Product ID" value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} />
    <input className="w-full rounded border p-2" required type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
    {mode === 'export' && <select className="w-full rounded border p-2" value={form.toStoreId} onChange={(e) => setForm({ ...form, toStoreId: e.target.value })}><option value="1">Store 1</option><option value="2">Store 2</option><option value="3">Store 3</option></select>}
    <textarea className="w-full rounded border p-2" placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
    <Button>{mode === 'import' ? 'Import stock' : 'Transfer stock'}</Button>
    {message && <p className="text-sm">{message}</p>}
  </form>;
}
