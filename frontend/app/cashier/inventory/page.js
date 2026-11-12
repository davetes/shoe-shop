'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';

const emptyForm = { name: '', size: '', color: '', costPrice: '', sellingPrice: '', stock: '' };

export default function CashierInventoryPage() {
  const [form, setForm] = useState(emptyForm);
  const [inventory, setInventory] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  function loadInventory() {
    api.get('/inventory')
      .then(({ data }) => setInventory(data))
      .catch((error) => setMessage(error.response?.data?.error || 'Unable to load your inventory'));
  }

  useEffect(() => { loadInventory(); }, []);

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
      loadInventory();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Unable to add shoe');
    }
  }

  function beginEdit(row) {
    setEditingId(row.product_id);
    setForm({
      name: row.name,
      size: row.size,
      color: row.color,
      costPrice: String(row.cost_price),
      sellingPrice: String(row.selling_price),
      stock: ''
    });
    setMessage('');
  }

  async function saveEdit(event) {
    event.preventDefault();
    try {
      await api.patch(`/products/${editingId}`, {
        name: form.name,
        size: form.size,
        color: form.color,
        costPrice: Number(form.costPrice || 0),
        sellingPrice: Number(form.sellingPrice)
      });
      setEditingId(null);
      setForm(emptyForm);
      setMessage('Shoe details updated.');
      loadInventory();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Unable to update shoe');
    }
  }

  return <main className="mx-auto max-w-xl">
    <Card title={editingId ? 'Edit shoe' : 'Add a new shoe'}>
      <p className="mb-4 text-sm text-slate-600">Create a shoe and add its initial quantity to your assigned store.</p>
      <form onSubmit={editingId ? saveEdit : submit} className="space-y-4">
        <input className="w-full rounded border p-2" required placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <input className="w-full rounded border p-2" required placeholder="Size" value={form.size} onChange={(event) => setForm({ ...form, size: event.target.value })} />
        <input className="w-full rounded border p-2" required placeholder="Color" value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} />
        <input className="w-full rounded border p-2" required min="0" step="0.01" type="number" placeholder="Selling price" value={form.sellingPrice} onChange={(event) => setForm({ ...form, sellingPrice: event.target.value })} />
        <input className="w-full rounded border p-2" min="0" step="0.01" type="number" placeholder="Cost price (optional)" value={form.costPrice} onChange={(event) => setForm({ ...form, costPrice: event.target.value })} />
        {!editingId && <input className="w-full rounded border p-2" required min="1" type="number" placeholder="Initial stock" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} />}
        <div className="flex gap-2"><Button>{editingId ? 'Save changes' : 'Add shoe to my inventory'}</Button>{editingId && <button className="rounded-lg border px-4 py-2 text-sm" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}</div>
        {message && <p className="text-sm">{message}</p>}
      </form>
    </Card>
    <Card title="Shoes in my store" className="mt-6">
      {!inventory.length ? <p className="text-sm text-slate-500">No shoes are currently recorded in your store.</p> : <div className="overflow-auto"><table className="w-full text-left text-sm">
        <thead><tr className="border-b"><th className="p-2">Shoe</th><th className="p-2">Size</th><th className="p-2">Color</th><th className="p-2">Stock</th><th className="p-2">Action</th></tr></thead>
        <tbody>{inventory.map((row) => <tr className="border-b" key={row.product_id}><td className="p-2">{row.name}</td><td className="p-2">{row.size}</td><td className="p-2">{row.color}</td><td className="p-2">{row.quantity}</td><td className="p-2"><button className="text-blue-700 underline" type="button" onClick={() => beginEdit(row)}>Edit</button></td></tr>)}</tbody>
      </table></div>}
    </Card>
  </main>;
}
