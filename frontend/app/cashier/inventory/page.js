'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';

const emptyForm = { name: '', size: '', color: '', costPrice: '', sellingPrice: '', stock: '' };

export default function CashierInventoryPage() {
  const [form, setForm] = useState(emptyForm);
  const [inventory, setInventory] = useState([]);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');

  function loadInventory() {
    api.get('/inventory')
      .then(({ data }) => setInventory(data))
      .catch((error) => setMessage(error.response?.data?.error || 'Unable to load your inventory'));
  }

  useEffect(() => { loadInventory(); }, []);

  async function addShoe(event) {
    event.preventDefault();
    try {
      const { data: product } = await api.post('/products', {
        name: form.name,
        size: form.size,
        color: form.color,
        costPrice: Number(form.costPrice || 0),
        sellingPrice: Number(form.sellingPrice)
      });
      await api.post('/inventory', {
        productId: product.id,
        quantity: Number(form.stock),
        notes: 'Initial stock added by cashier'
      });
      setForm(emptyForm);
      setMessage('New shoe added to your store inventory.');
      loadInventory();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Unable to add shoe');
    }
  }

  function beginEdit(row) {
    setEditing(row);
    setMessage('');
  }

  async function saveEdit(event) {
    event.preventDefault();
    try {
      await api.patch(`/products/${editing.product_id}`, {
        name: editing.name,
        size: editing.size,
        color: editing.color,
        costPrice: Number(editing.cost_price || 0),
        sellingPrice: Number(editing.selling_price)
      });
      await api.patch(`/inventory/${editing.product_id}`, { quantity: Number(editing.quantity) });
      setEditing(null);
      setMessage('Shoe details and stock updated.');
      loadInventory();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Unable to update shoe');
    }
  }

  return <main className="mx-auto max-w-4xl">
    <Card title="Add a new shoe">
      <p className="mb-4 text-sm text-slate-600">Create a shoe and add its initial quantity to your assigned store.</p>
      <form onSubmit={addShoe} className="grid gap-4 md:grid-cols-2">
        <Field label="Shoe name"><input className="rounded border p-2" required placeholder="e.g. Classic Runner" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
        <Field label="Size"><input className="rounded border p-2" required placeholder="e.g. 42" value={form.size} onChange={(event) => setForm({ ...form, size: event.target.value })} /></Field>
        <Field label="Color"><input className="rounded border p-2" required placeholder="e.g. Black" value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} /></Field>
        <Field label="Selling price"><input className="rounded border p-2" required min="0" step="0.01" type="number" placeholder="0.00" value={form.sellingPrice} onChange={(event) => setForm({ ...form, sellingPrice: event.target.value })} /></Field>
        <Field label="Cost price (optional)"><input className="rounded border p-2" min="0" step="0.01" type="number" placeholder="0.00" value={form.costPrice} onChange={(event) => setForm({ ...form, costPrice: event.target.value })} /></Field>
        <Field label="Initial stock (pairs)"><input className="rounded border p-2" required min="1" type="number" placeholder="e.g. 10" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} /></Field>
        <Button>Add shoe to my store</Button>
      </form>
    </Card>
    <Card title="Shoes in my store" className="mt-6">
      {!inventory.length ? <p className="text-sm text-slate-500">No shoes are currently recorded in your store.</p> : <div className="overflow-auto"><table className="w-full text-left text-sm">
        <thead><tr className="border-b"><th className="whitespace-nowrap p-2">Shoe</th><th className="whitespace-nowrap p-2">Size</th><th className="whitespace-nowrap p-2">Color</th><th className="whitespace-nowrap p-2">Stock</th><th className="whitespace-nowrap p-2">Action</th></tr></thead>
        <tbody>{inventory.map((row) => <tr className="border-b" key={row.product_id}><td className="whitespace-nowrap p-2">{row.name}</td><td className="whitespace-nowrap p-2">{row.size}</td><td className="whitespace-nowrap p-2">{row.color}</td><td className="whitespace-nowrap p-2">{row.quantity}</td><td className="whitespace-nowrap p-2"><button className="text-blue-700 underline" type="button" onClick={() => beginEdit({ ...row })}>Edit</button></td></tr>)}</tbody>
      </table></div>}
    </Card>
    {editing && <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-labelledby="edit-shoe-title">
      <form onSubmit={saveEdit} className="w-full max-w-lg space-y-4 rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between"><h2 id="edit-shoe-title" className="text-lg font-semibold">Edit shoe</h2><button type="button" className="text-2xl text-slate-500" aria-label="Close edit dialog" onClick={() => setEditing(null)}>×</button></div>
        <Field label="Shoe name"><input className="w-full rounded border p-2" required placeholder="Shoe name" value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} /></Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Size"><input className="w-full rounded border p-2" required placeholder="Size" value={editing.size} onChange={(event) => setEditing({ ...editing, size: event.target.value })} /></Field><Field label="Color"><input className="w-full rounded border p-2" required placeholder="Color" value={editing.color} onChange={(event) => setEditing({ ...editing, color: event.target.value })} /></Field></div>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Cost price"><input className="w-full rounded border p-2" required min="0" step="0.01" type="number" placeholder="0.00" value={editing.cost_price} onChange={(event) => setEditing({ ...editing, cost_price: event.target.value })} /></Field><Field label="Selling price"><input className="w-full rounded border p-2" required min="0" step="0.01" type="number" placeholder="0.00" value={editing.selling_price} onChange={(event) => setEditing({ ...editing, selling_price: event.target.value })} /></Field></div>
        <Field label="Stock quantity (pairs)"><input className="w-full rounded border p-2" required min="0" type="number" placeholder="Stock quantity" value={editing.quantity} onChange={(event) => setEditing({ ...editing, quantity: event.target.value })} /></Field>
        <div className="flex justify-end gap-2"><button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={() => setEditing(null)}>Cancel</button><Button>Save changes</Button></div>
      </form>
    </div>}
    {message && <p className="mt-4 rounded bg-slate-100 p-3 text-sm">{message}</p>}
  </main>;
}

function Field({ label, children }) {
  return <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
    {label}
    {children}
  </label>;
}
