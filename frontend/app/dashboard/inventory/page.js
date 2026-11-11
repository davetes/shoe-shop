'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const emptyForm = { name: '', size: '', color: '', costPrice: '', sellingPrice: '', stock: '', storeId: '1' };

export default function InventoryPage() {
  const [form, setForm] = useState(emptyForm);
  const [rows, setRows] = useState([]);
  const [stores, setStores] = useState([]);
  const [message, setMessage] = useState('');

  function loadInventory() {
    api.get('/inventory').then(({ data }) => setRows(data)).catch((error) => setMessage(error.response?.data?.error || 'Unable to load inventory'));
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
          storeId: Number(form.storeId),
          quantity: Number(form.stock),
          notes: 'Initial stock'
        });
      }
      setForm({ ...emptyForm, storeId: form.storeId });
      setMessage('Shoe created and initial stock added.');
      loadInventory();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Unable to create shoe');
    }
  }

  return <main className="space-y-6">
    <Card title="Add a new shoe">
      <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
        <input className="rounded border p-2" required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="rounded border p-2" required placeholder="Size" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
        <input className="rounded border p-2" required placeholder="Color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
        <input className="rounded border p-2" required min="0" step="0.01" type="number" placeholder="Selling price" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
        <input className="rounded border p-2" min="0" step="0.01" type="number" placeholder="Cost price (optional)" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
        <input className="rounded border p-2" required min="0" type="number" placeholder="Initial stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        <select className="rounded border p-2" value={form.storeId} onChange={(e) => setForm({ ...form, storeId: e.target.value })}>{stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}</select>
        <Button>Add shoe</Button>
      </form>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </Card>
    <Card title="Inventory across stores">
      <div className="overflow-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-2">Store</th><th className="p-2">Product</th><th className="p-2">Size</th><th className="p-2">Color</th><th className="p-2">Pairs</th></tr></thead><tbody>{rows.map((row) => <tr className="border-b" key={`${row.store_id}-${row.product_id}`}><td className="p-2">{row.store_name}</td><td className="p-2">{row.name}</td><td className="p-2">{row.size}</td><td className="p-2">{row.color}</td><td className="p-2">{row.quantity}</td></tr>)}</tbody></table></div>
    </Card>
  </main>;
}
