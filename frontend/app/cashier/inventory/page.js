'use client';
import { useState } from 'react';
import api from '../../../lib/api';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';

const emptyForm = { name: '', size: '', color: '', costPrice: '', sellingPrice: '', stock: '' };

export default function CashierInventoryPage() {
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');

  async function submit(event) {
    event.preventDefault();
    setMessage('');
    try {
      const { data: product } = await api.post('/products', {
        name: form.name,
        size: form.size,
        color: form.color,
        costPrice: Number(form.costPrice || 0),
        sellingPrice: Number(form.sellingPrice)
      });
      if (Number(form.stock) > 0) {
        await api.post('/inventory', {
          productId: product.id,
          quantity: Number(form.stock),
          notes: 'Initial stock added by cashier'
        });
      }
      setForm(emptyForm);
      setMessage('New shoe added to your store inventory.');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Unable to add shoe');
    }
  }

  return <main className="mx-auto max-w-xl">
    <Card title="Add a new shoe">
      <p className="mb-4 text-sm text-slate-600">Create a shoe and add its initial quantity to your assigned store.</p>
      <form onSubmit={submit} className="space-y-4">
        <input className="w-full rounded border p-2" required placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <input className="w-full rounded border p-2" required placeholder="Size" value={form.size} onChange={(event) => setForm({ ...form, size: event.target.value })} />
        <input className="w-full rounded border p-2" required placeholder="Color" value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} />
        <input className="w-full rounded border p-2" required min="0" step="0.01" type="number" placeholder="Selling price" value={form.sellingPrice} onChange={(event) => setForm({ ...form, sellingPrice: event.target.value })} />
        <input className="w-full rounded border p-2" min="0" step="0.01" type="number" placeholder="Cost price (optional)" value={form.costPrice} onChange={(event) => setForm({ ...form, costPrice: event.target.value })} />
        <input className="w-full rounded border p-2" required min="1" type="number" placeholder="Initial stock" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} />
        <Button>Add shoe to my inventory</Button>
        {message && <p className="text-sm">{message}</p>}
      </form>
    </Card>
  </main>;
}
