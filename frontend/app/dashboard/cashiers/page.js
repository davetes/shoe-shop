'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const emptyForm = { fullName: '', email: '', password: '', storeId: '1' };

export default function CashiersPage() {
  const [cashiers, setCashiers] = useState([]);
  const [stores, setStores] = useState([]);
  const [sales, setSales] = useState([]);
  const [selectedCashierId, setSelectedCashierId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  function loadCashiers() {
    api.get('/users/cashiers').then(({ data }) => {
      setCashiers(data);
      if (!selectedCashierId && data.length) setSelectedCashierId(data[0].id);
    }).catch((error) => setMessage(error.response?.data?.error || 'Unable to load cashiers'));
  }

  useEffect(() => {
    Promise.all([api.get('/users/cashiers'), api.get('/stores')]).then(([cashierResponse, storeResponse]) => {
      setCashiers(cashierResponse.data);
      setStores(storeResponse.data);
      if (cashierResponse.data.length) setSelectedCashierId(cashierResponse.data[0].id);
      if (storeResponse.data.length) setForm((current) => ({ ...current, storeId: String(storeResponse.data[0].id) }));
    }).catch((error) => setMessage(error.response?.data?.error || 'Unable to load cashier management'));
  }, []);

  function loadSales() {
    if (!selectedCashierId) return;
    api.get('/sales', { params: { cashierId: selectedCashierId, from: fromDate || undefined, to: toDate || undefined } })
      .then(({ data }) => setSales(data))
      .catch((error) => setMessage(error.response?.data?.error || 'Unable to load cashier sales'));
  }

  useEffect(() => { loadSales(); }, [selectedCashierId]);

  async function createCashier(event) {
    event.preventDefault();
    try {
      await api.post('/users/cashiers', { ...form, storeId: Number(form.storeId) });
      setForm({ ...emptyForm, storeId: form.storeId });
      setMessage('Cashier account created.');
      loadCashiers();
    } catch (error) { setMessage(error.response?.data?.error || 'Unable to create cashier'); }
  }

  async function resetPassword(event) {
    event.preventDefault();
    if (!selectedCashierId) return;
    try {
      await api.patch(`/users/cashiers/${selectedCashierId}/password`, { password: newPassword });
      setNewPassword('');
      setMessage('Cashier password updated.');
    } catch (error) { setMessage(error.response?.data?.error || 'Unable to update password'); }
  }

  const selectedCashier = cashiers.find((cashier) => cashier.id === selectedCashierId);
  return <main className="space-y-6">
    <div><h1 className="text-3xl font-bold">Cashier management</h1><p className="text-slate-600">View cashier details, sales, and account access.</p></div>
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Create cashier account"><form onSubmit={createCashier} className="space-y-3">
        <input className="w-full rounded border p-2" required placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <input className="w-full rounded border p-2" required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="w-full rounded border p-2" required minLength="6" type="password" placeholder="Temporary password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select className="w-full rounded border p-2" value={form.storeId} onChange={(e) => setForm({ ...form, storeId: e.target.value })}>{stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}</select>
        <Button>Create cashier</Button>
      </form></Card>
      <Card title="Cashier details and password">
        <select className="mb-3 w-full rounded border p-2" value={selectedCashierId} onChange={(e) => setSelectedCashierId(e.target.value)}>{cashiers.map((cashier) => <option key={cashier.id} value={cashier.id}>{cashier.full_name}</option>)}</select>
        {selectedCashier && <div className="mb-4 rounded bg-slate-50 p-3 text-sm"><p><strong>Name:</strong> {selectedCashier.full_name}</p><p><strong>Email:</strong> {selectedCashier.email}</p><p><strong>Store:</strong> {selectedCashier.store_name}</p></div>}
        <form onSubmit={resetPassword} className="flex gap-2"><input className="min-w-0 flex-1 rounded border p-2" required minLength="6" type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /><Button>Reset password</Button></form>
      </Card>
    </div>
    <Card title={`${selectedCashier?.full_name || 'Cashier'} sales`}>
      <form className="mb-4 grid gap-3 rounded-lg bg-slate-50 p-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={(event) => { event.preventDefault(); loadSales(); }}>
        <label className="text-sm">From<input className="mt-1 block w-full rounded border p-2" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} /></label>
        <label className="text-sm">To<input className="mt-1 block w-full rounded border p-2" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} /></label>
        <button className="self-end rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white" type="submit">Filter</button>
      </form>
      {!sales.length ? <p className="text-sm text-slate-500">No sales found for this selection.</p> : <div className="overflow-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-2">Date</th><th className="p-2">Items</th><th className="p-2">Payment</th><th className="p-2">Total</th></tr></thead><tbody>{sales.map((sale) => <tr className="border-b" key={sale.id}><td className="whitespace-nowrap p-2">{new Date(sale.created_at).toLocaleString()}</td><td className="p-2">{sale.items.map((item) => `${item.name} x${item.quantity}`).join(', ')}</td><td className="p-2">{sale.payment_method.replace('_', ' ')}</td><td className="p-2">{Number(sale.total_amount).toFixed(2)}</td></tr>)}</tbody></table></div>}
    </Card>
    {message && <p className="rounded bg-slate-100 p-3 text-sm">{message}</p>}
  </main>;
}
