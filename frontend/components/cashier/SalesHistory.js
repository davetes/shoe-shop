'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import Card from '../ui/Card';

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [error, setError] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  function loadSales() {
    setError('');
    api.get('/sales', { params: { from: fromDate || undefined, to: toDate || undefined } })
      .then(({ data }) => setSales(data))
      .catch((requestError) => setError(requestError.response?.data?.error || 'Unable to load sales'));
  }

  useEffect(() => { loadSales(); }, []);

  return <Card title="My sales">
    <form className="mb-4 flex items-end gap-3 overflow-x-auto rounded-lg bg-slate-50 p-3" onSubmit={(event) => { event.preventDefault(); loadSales(); }}>
      <label className="min-w-[145px] whitespace-nowrap text-sm">From<input className="mt-1 block w-full rounded border p-2" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></label>
      <label className="min-w-[145px] whitespace-nowrap text-sm">To<input className="mt-1 block w-full rounded border p-2" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} /></label>
      <button className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700" type="submit">Filter</button>
    </form>
    {error && <p className="text-sm text-red-600">{error}</p>}
    {!error && !sales.length && <p className="text-sm text-slate-500">You have not recorded any sales yet.</p>}
    {!!sales.length && <div className="overflow-auto"><table className="w-full text-left text-sm">
      <thead><tr className="border-b"><th className="whitespace-nowrap p-2">Date</th><th className="whitespace-nowrap p-2">Items</th><th className="whitespace-nowrap p-2">Payment</th><th className="whitespace-nowrap p-2">Total</th></tr></thead>
      <tbody>{sales.map((sale) => <tr className="border-b" key={sale.id}>
        <td className="whitespace-nowrap p-2">{new Date(sale.created_at).toLocaleString()}</td>
        <td className="whitespace-nowrap p-2">{sale.items.map((item) => `${item.name} (${item.size}, ${item.color}) x${item.quantity}`).join(', ')}</td>
        <td className="whitespace-nowrap p-2">{sale.payment_method.replace('_', ' ')}</td>
        <td className="whitespace-nowrap p-2 font-medium">{Number(sale.total_amount).toFixed(2)}</td>
      </tr>)}</tbody>
    </table></div>}
  </Card>;
}
