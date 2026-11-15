'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { useLanguage } from '../../../lib/language';

const emptyForm = { name: '', size: '', color: '', costPrice: '', sellingPrice: '', stock: '' };

export default function CashierInventoryPage() {
  const { t } = useLanguage();
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

  return <main className="mx-auto max-w-5xl px-4 py-6 md:px-6">
    <Card title={t('Add stock to this store')}>
      <p className="mb-5 text-sm leading-relaxed text-slate-600">
        {t('Enter the shoe details and the number of pairs available in your store.')}
      </p>
      <form onSubmit={addShoe} className="grid gap-4 md:grid-cols-2">
        <Field label={t('Shoe name')}><input className="rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400" required placeholder="Classic Runner" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
        <Field label={t('Size')}><input className="rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400" required placeholder="42" value={form.size} onChange={(event) => setForm({ ...form, size: event.target.value })} /></Field>
        <Field label={t('Color')}><input className="rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400" required placeholder="Black" value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} /></Field>
        <Field label={t('Selling price')}><input className="rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400" required min="0" step="0.01" type="number" placeholder="0.00" value={form.sellingPrice} onChange={(event) => setForm({ ...form, sellingPrice: event.target.value })} /></Field>
        <Field label={t('Cost price')}><input className="rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400" min="0" step="0.01" type="number" placeholder="0.00" value={form.costPrice} onChange={(event) => setForm({ ...form, costPrice: event.target.value })} /></Field>
        <Field label={t('Stock')}><input className="rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400" required min="1" type="number" placeholder="10" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} /></Field>
        <div className="md:col-span-2 flex justify-end">
          <Button className="min-w-[180px]">{t('Add to stock')}</Button>
        </div>
      </form>
    </Card>

    <Card title={t('Stock in this store')} className="mt-6">
      {!inventory.length ? <p className="text-sm text-slate-500">{t('No shoes are available in this store yet.')}</p> : <div className="overflow-auto"><table className="w-full text-left text-sm">
        <thead><tr className="border-b border-slate-200"><th className="whitespace-nowrap p-2 font-semibold text-slate-700">{t('Shoe')}</th><th className="whitespace-nowrap p-2 font-semibold text-slate-700">{t('Size')}</th><th className="whitespace-nowrap p-2 font-semibold text-slate-700">{t('Color')}</th><th className="whitespace-nowrap p-2 font-semibold text-slate-700">{t('Pairs')}</th><th className="whitespace-nowrap p-2 font-semibold text-slate-700">{t('Action')}</th></tr></thead>
        <tbody>{inventory.map((row) => <tr className="border-b border-slate-100" key={row.product_id}><td className="whitespace-nowrap p-2 text-slate-800">{row.name}</td><td className="whitespace-nowrap p-2 text-slate-800">{row.size}</td><td className="whitespace-nowrap p-2 text-slate-800">{row.color}</td><td className="whitespace-nowrap p-2 text-slate-800">{row.quantity}</td><td className="whitespace-nowrap p-2"><button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900" type="button" onClick={() => beginEdit({ ...row })}>{t('Edit')}</button></td></tr>)}</tbody>
      </table></div>}
    </Card>

    {editing && <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-labelledby="edit-shoe-title">
      <form onSubmit={saveEdit} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between"><h2 id="edit-shoe-title" className="text-lg font-semibold text-slate-900">{t('Update shoe details')}</h2><button type="button" className="text-2xl text-slate-500" aria-label="Close edit dialog" onClick={() => setEditing(null)}>×</button></div>
        <Field label={t('Shoe name')}><input className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400" required value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} /></Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field label={t('Size')}><input className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400" required value={editing.size} onChange={(event) => setEditing({ ...editing, size: event.target.value })} /></Field><Field label={t('Color')}><input className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400" required value={editing.color} onChange={(event) => setEditing({ ...editing, color: event.target.value })} /></Field></div>
        <div className="grid gap-4 sm:grid-cols-2"><Field label={t('Cost price')}><input className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400" required min="0" step="0.01" type="number" value={editing.cost_price} onChange={(event) => setEditing({ ...editing, cost_price: event.target.value })} /></Field><Field label={t('Selling price')}><input className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400" required min="0" step="0.01" type="number" value={editing.selling_price} onChange={(event) => setEditing({ ...editing, selling_price: event.target.value })} /></Field></div>
        <Field label={t('Pairs in stock')}><input className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400" required min="0" type="number" value={editing.quantity} onChange={(event) => setEditing({ ...editing, quantity: event.target.value })} /></Field>
        <div className="flex justify-end gap-2"><button type="button" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700" onClick={() => setEditing(null)}>{t('Cancel')}</button><Button>{t('Save')}</Button></div>
      </form>
    </div>}

    {message && <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">{message}</p>}
  </main>;
}

function Field({ label, children }) {
  return <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
    {label}
    {children}
  </label>;
}
