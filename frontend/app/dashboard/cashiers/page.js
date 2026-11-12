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
  const [showCreate, setShowCreate] = useState(false);

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
  const analysis = sales.reduce((result, sale) => {
    const amount = Number(sale.total_amount);
    result.total += amount;
    result.count += 1;
    result[sale.payment_method] += amount;
    sale.items.forEach((item) => {
      const key = `${item.name} - size ${item.size} - ${item.color}`;
      if (!result.products[key]) result.products[key] = { quantity: 0, amount: 0 };
      result.products[key].quantity += Number(item.quantity);
      result.products[key].amount += Number(item.quantity) * Number(item.unitPrice);
    });
    return result;
  }, { total: 0, count: 0, CASH: 0, BANK_TRANSFER: 0, products: {} });
  const productAnalysis = Object.entries(analysis.products).sort(([, first], [, second]) => second.quantity - first.quantity);
  return <main className="space-y-6">
    <div><h1 className="text-3xl font-bold">Cashier management</h1><p className="text-slate-600">View cashier details, sales, and account access.</p></div>
    <Card title="Cashiers">
      <div className="mb-4 flex items-center justify-between"><p className="text-sm text-slate-500">Click a cashier to view their details and sales.</p><button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700" type="button" onClick={() => setShowCreate(!showCreate)}>{showCreate ? 'Hide form' : '+ Create cashier'}</button></div>
      {showCreate && <form onSubmit={createCashier} className="mb-5 grid gap-3 rounded-lg bg-slate-50 p-4 md:grid-cols-5">
        <label className="text-sm font-medium text-slate-700">Full name<input className="mt-1 w-full rounded border p-2 font-normal" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label>
        <label className="text-sm font-medium text-slate-700">Email<input className="mt-1 w-full rounded border p-2 font-normal" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label className="text-sm font-medium text-slate-700">Temporary password<input className="mt-1 w-full rounded border p-2 font-normal" required minLength="6" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        <label className="text-sm font-medium text-slate-700">Store<select className="mt-1 w-full rounded border p-2 font-normal" value={form.storeId} onChange={(e) => setForm({ ...form, storeId: e.target.value })}>{stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}</select></label>
        <div className="flex items-end"><Button>Create account</Button></div>
      </form>}
      {!cashiers.length ? <p className="text-sm text-slate-500">No cashiers found.</p> : <div className="overflow-auto"><table className="w-full text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr className="border-b"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Store</th><th className="p-3">Action</th></tr></thead><tbody>{cashiers.map((cashier) => <tr className={`cursor-pointer border-b last:border-0 hover:bg-slate-50 ${cashier.id === selectedCashierId ? 'bg-blue-50' : ''}`} key={cashier.id} onClick={() => setSelectedCashierId(cashier.id)}><td className="p-3 font-medium">{cashier.full_name}</td><td className="p-3">{cashier.email}</td><td className="p-3">{cashier.store_name}</td><td className="p-3"><button className="font-medium text-blue-700 underline" type="button" onClick={(event) => { event.stopPropagation(); setSelectedCashierId(cashier.id); }}>View details</button></td></tr>)}</tbody></table></div>}
    </Card>
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Cashier details and password">
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
      <div className="mb-6">
        <h3 className="mb-3 text-base font-semibold">Sales summary</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Metric label="Total revenue" value={analysis.total.toFixed(2)} tone="dark" />
          <Metric label="Cash revenue" value={analysis.CASH.toFixed(2)} tone="green" />
          <Metric label="Bank transfer" value={analysis.BANK_TRANSFER.toFixed(2)} tone="blue" />
          <Metric label="Transactions" value={String(analysis.count)} />
          <Metric label="Pairs sold" value={String(productAnalysis.reduce((sum, [, item]) => sum + item.quantity, 0))} />
        </div>
      </div>
      {!!productAnalysis.length && <div className="mb-6 rounded-lg border border-slate-200"><div className="border-b bg-slate-50 p-4"><h3 className="font-semibold">Products sold</h3><p className="mt-1 text-sm text-slate-500">Best-selling shoes for the selected cashier and period.</p></div><div className="overflow-auto"><table className="w-full text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr className="border-b"><th className="p-3">Product</th><th className="p-3">Pairs sold</th><th className="p-3">Revenue</th></tr></thead><tbody>{productAnalysis.map(([name, item]) => <tr className="border-b last:border-0" key={name}><td className="p-3 font-medium">{name}</td><td className="p-3">{item.quantity}</td><td className="p-3 font-medium">{item.amount.toFixed(2)}</td></tr>)}</tbody></table></div></div>}
      <div className="rounded-lg border border-slate-200"><div className="border-b bg-slate-50 p-4"><h3 className="font-semibold">Sale details</h3><p className="mt-1 text-sm text-slate-500">Every sale recorded by this cashier.</p></div>{!sales.length ? <p className="p-4 text-sm text-slate-500">No sales found for this selection.</p> : <div className="overflow-auto"><table className="w-full text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr className="border-b"><th className="p-3">Date</th><th className="p-3">Items</th><th className="p-3">Payment method</th><th className="p-3">Total</th></tr></thead><tbody>{sales.map((sale) => <tr className="border-b last:border-0" key={sale.id}><td className="whitespace-nowrap p-3">{new Date(sale.created_at).toLocaleString()}</td><td className="p-3">{sale.items.map((item) => `${item.name} x${item.quantity}`).join(', ')}</td><td className="p-3"><PaymentBadge method={sale.payment_method} /></td><td className="p-3 font-semibold">{Number(sale.total_amount).toFixed(2)}</td></tr>)}</tbody></table></div>}</div>
    </Card>
    {message && <p className="rounded bg-slate-100 p-3 text-sm">{message}</p>}
  </main>;
}

function Metric({ label, value, tone = 'light' }) {
  const styles = { dark: 'bg-slate-900 text-white', green: 'bg-emerald-50 text-emerald-900', blue: 'bg-blue-50 text-blue-900', light: 'bg-slate-50 text-slate-900' };
  return <div className={`rounded-lg p-4 ${styles[tone]}`}><p className={`text-xs ${tone === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div>;
}

function PaymentBadge({ method }) {
  const isCash = method === 'CASH';
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${isCash ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>{isCash ? 'Cash' : 'Bank transfer'}</span>;
}
