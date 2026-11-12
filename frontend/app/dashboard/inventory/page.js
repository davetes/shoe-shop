'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../lib/language';

const emptyForm = { name: '', size: '', color: '', costPrice: '', sellingPrice: '', stock: '', storeId: '1' };

export default function InventoryPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState(emptyForm);
  const [rows, setRows] = useState([]);
  const [stores, setStores] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editingStore, setEditingStore] = useState(null);
  const [newStore, setNewStore] = useState({ name: '', threshold: 5 });
  const [showCreate, setShowCreate] = useState(false);
  const [showStores, setShowStores] = useState(false);
  const [message, setMessage] = useState('');

  function loadInventory() {
    api.get('/inventory')
      .then(({ data }) => setRows(data))
      .catch((error) => setMessage(error.response?.data?.error || 'Unable to load inventory'));
  }

  useEffect(() => {
    Promise.all([api.get('/inventory'), api.get('/stores')])
      .then(([inventoryResponse, storesResponse]) => {
        setRows(inventoryResponse.data);
        setStores(storesResponse.data);
        if (storesResponse.data.length) setForm((current) => ({ ...current, storeId: String(storesResponse.data[0].id) }));
      })
      .catch((error) => setMessage(error.response?.data?.error || 'Unable to load inventory'));
  }, []);

  async function createShoe(event) {
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
        storeId: Number(form.storeId),
        quantity: Number(form.stock),
        notes: 'Initial stock'
      });
      setForm({ ...emptyForm, storeId: form.storeId });
      setMessage('Shoe created and initial stock added.');
      loadInventory();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Unable to create shoe');
    }
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
      await api.patch(`/inventory/${editing.product_id}`, {
        storeId: editing.store_id,
        quantity: Number(editing.quantity)
      });
      setEditing(null);
      setMessage('Shoe details and stock updated.');
      loadInventory();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Unable to update shoe');
    }
  }

  async function createStore(event) {
    event.preventDefault();
    try {
      const { data } = await api.post('/stores', { name: newStore.name, threshold: Number(newStore.threshold) });
      setStores([...stores, data]);
      setNewStore({ name: '', threshold: 5 });
      setMessage('Store created.');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Unable to create store');
    }
  }

  async function saveStore(event) {
    event.preventDefault();
    try {
      const { data } = await api.patch(`/stores/${editingStore.id}`, {
        name: editingStore.name,
        threshold: Number(editingStore.low_stock_threshold)
      });
      setStores(stores.map((store) => store.id === data.id ? data : store));
      setEditingStore(null);
      setMessage('Store updated.');
      loadInventory();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Unable to update store');
    }
  }

  return <main className="space-y-6">
    <Card title="Inventory actions">
      <div className="flex flex-wrap gap-3"><button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white" type="button" onClick={() => setShowCreate(!showCreate)}>{t(showCreate ? 'Hide add shoe form' : '+ Add new shoe')}</button><button className="rounded-lg border px-4 py-2 text-sm font-medium" type="button" onClick={() => setShowStores(!showStores)}>{t(showStores ? 'Hide store management' : 'Manage stores')}</button></div>
    </Card>
    {showCreate && <Card title="Add a new shoe">
      <form onSubmit={createShoe} className="grid gap-3 md:grid-cols-2">
        <Field label={t('Shoe name')}><input className="rounded border p-2" required placeholder="e.g. Classic Runner" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
        <Field label={t('Size')}><input className="rounded border p-2" required placeholder="e.g. 42" value={form.size} onChange={(event) => setForm({ ...form, size: event.target.value })} /></Field>
        <Field label={t('Color')}><input className="rounded border p-2" required placeholder="e.g. Black" value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} /></Field>
        <Field label={t('Selling price')}><input className="rounded border p-2" required min="0" step="0.01" type="number" placeholder="0.00" value={form.sellingPrice} onChange={(event) => setForm({ ...form, sellingPrice: event.target.value })} /></Field>
        <Field label={t('Cost price (optional)')}><input className="rounded border p-2" min="0" step="0.01" type="number" placeholder="0.00" value={form.costPrice} onChange={(event) => setForm({ ...form, costPrice: event.target.value })} /></Field>
        <Field label={t('Initial stock (pairs)')}><input className="rounded border p-2" required min="0" type="number" placeholder="e.g. 10" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} /></Field>
        <Field label={t('Store')}><select className="rounded border p-2" value={form.storeId} onChange={(event) => setForm({ ...form, storeId: event.target.value })}>{stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}</select></Field>
        <Button>{t('Add shoe')}</Button>
      </form>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </Card>}
    {showStores && <Card title="Store management">
      <form onSubmit={createStore} className="mb-4 flex flex-wrap items-end gap-3 rounded-lg bg-slate-50 p-3">
        <Field label={t('New store name')}><input className="rounded border p-2" required value={newStore.name} onChange={(event) => setNewStore({ ...newStore, name: event.target.value })} /></Field>
        <Field label={t('Alert threshold')}><input className="w-28 rounded border p-2" required min="0" type="number" value={newStore.threshold} onChange={(event) => setNewStore({ ...newStore, threshold: event.target.value })} /></Field>
        <Button>{t('Create store')}</Button>
      </form>
      <div className="overflow-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="whitespace-nowrap p-2">{t('Store')}</th><th className="whitespace-nowrap p-2">{t('Alert threshold')}</th><th className="whitespace-nowrap p-2">{t('Action')}</th></tr></thead><tbody>{stores.map((store) => <tr className="border-b" key={store.id}><td className="whitespace-nowrap p-2">{editingStore?.id === store.id ? <input className="rounded border p-1" value={editingStore.name} onChange={(event) => setEditingStore({ ...editingStore, name: event.target.value })} /> : store.name}</td><td className="whitespace-nowrap p-2">{editingStore?.id === store.id ? <input className="w-24 rounded border p-1" min="0" type="number" value={editingStore.low_stock_threshold} onChange={(event) => setEditingStore({ ...editingStore, low_stock_threshold: event.target.value })} /> : store.low_stock_threshold}</td><td className="whitespace-nowrap p-2">{editingStore?.id === store.id ? <div className="flex gap-2"><button className="text-blue-700 underline" type="button" onClick={saveStore}>{t('Save')}</button><button className="text-slate-600 underline" type="button" onClick={() => setEditingStore(null)}>{t('Cancel')}</button></div> : <button className="text-blue-700 underline" type="button" onClick={() => setEditingStore({ ...store })}>{t('Edit')}</button>}</td></tr>)}</tbody></table></div>
    </Card>}
    <Card title="Inventory across stores">
      <div className="overflow-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="whitespace-nowrap p-2">{t('Store')}</th><th className="whitespace-nowrap p-2">{t('Product')}</th><th className="whitespace-nowrap p-2">{t('Size')}</th><th className="whitespace-nowrap p-2">{t('Color')}</th><th className="whitespace-nowrap p-2">{t('Pairs')}</th><th className="whitespace-nowrap p-2">{t('Action')}</th></tr></thead><tbody>{rows.map((row) => <tr className="border-b" key={`${row.store_id}-${row.product_id}`}><td className="whitespace-nowrap p-2">{row.store_name}</td><td className="whitespace-nowrap p-2">{row.name}</td><td className="whitespace-nowrap p-2">{row.size}</td><td className="whitespace-nowrap p-2">{row.color}</td><td className="whitespace-nowrap p-2">{row.quantity}</td><td className="whitespace-nowrap p-2"><button className="text-blue-700 underline" type="button" onClick={() => setEditing({ ...row })}>{t('Edit')}</button></td></tr>)}</tbody></table></div>
    </Card>
    {editing && <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-labelledby="admin-edit-shoe-title">
      <form onSubmit={saveEdit} className="w-full max-w-lg space-y-4 rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between"><h2 id="admin-edit-shoe-title" className="text-lg font-semibold">{t('Edit shoe')}</h2><button type="button" className="text-2xl text-slate-500" aria-label="Close edit dialog" onClick={() => setEditing(null)}>×</button></div>
        <Field label={t('Shoe name')}><input className="w-full rounded border p-2" required value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} /></Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field label={t('Size')}><input className="w-full rounded border p-2" required value={editing.size} onChange={(event) => setEditing({ ...editing, size: event.target.value })} /></Field><Field label={t('Color')}><input className="w-full rounded border p-2" required value={editing.color} onChange={(event) => setEditing({ ...editing, color: event.target.value })} /></Field></div>
        <div className="grid gap-4 sm:grid-cols-2"><Field label={t('Cost price')}><input className="w-full rounded border p-2" required min="0" step="0.01" type="number" value={editing.cost_price} onChange={(event) => setEditing({ ...editing, cost_price: event.target.value })} /></Field><Field label={t('Selling price')}><input className="w-full rounded border p-2" required min="0" step="0.01" type="number" value={editing.selling_price} onChange={(event) => setEditing({ ...editing, selling_price: event.target.value })} /></Field></div>
        <Field label={`${t('Stock quantity at')} ${editing.store_name}`}><input className="w-full rounded border p-2" required min="0" type="number" value={editing.quantity} onChange={(event) => setEditing({ ...editing, quantity: event.target.value })} /></Field>
        <div className="flex justify-end gap-2"><button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={() => setEditing(null)}>{t('Cancel')}</button><Button>{t('Save changes')}</Button></div>
      </form>
    </div>}
  </main>;
}

function Field({ label, children }) {
  return <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">{label}{children}</label>;
}
