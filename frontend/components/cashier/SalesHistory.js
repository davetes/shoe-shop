'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import Card from '../ui/Card';

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [error, setError] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  function loadSales() {
    setError('');
    api.get('/sales', { params: { from: fromDate || undefined, to: toDate || undefined } })
      .then(({ data }) => setSales(data))
      .catch((requestError) => setError(requestError.response?.data?.error || 'Unable to load sales'));
  }

  useEffect(() => { loadSales(); }, [fromDate, toDate]);

  const totalAmount = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const pairsSold = sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + Number(item.quantity), 0), 0);
  const cashAmount = sales.filter((sale) => sale.payment_method === 'CASH').reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const bankAmount = sales.filter((sale) => sale.payment_method === 'BANK_TRANSFER').reduce((sum, sale) => sum + Number(sale.total_amount), 0);

  return <Card title="My sales">
    <form className="mb-4 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-end gap-2 rounded-lg bg-slate-50 p-3" onSubmit={(event) => { event.preventDefault(); loadSales(); }}>
      <label className="min-w-0 whitespace-nowrap text-sm">From<input className="mt-1 block min-w-0 w-full rounded border p-2 text-xs" type="date" value={fromDate} onChange={(event) => { setFromDate(event.target.value); setPage(1); }} /></label>
      <label className="min-w-0 whitespace-nowrap text-sm">To<input className="mt-1 block min-w-0 w-full rounded border p-2 text-xs" type="date" value={toDate} onChange={(event) => { setToDate(event.target.value); setPage(1); }} /></label>
    </form>
    {error && <p className="text-sm text-red-600">{error}</p>}
    {!error && !sales.length && <p className="text-sm text-slate-500">You have not recorded any sales yet.</p>}
    {!!sales.length && <><div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4"><SummaryCard label="Total amount" value={totalAmount.toFixed(2)} /><SummaryCard label="Sales" value={sales.length} /><SummaryCard label="Pairs sold" value={pairsSold} /><SummaryCard label="Cash / Bank" value={`${cashAmount.toFixed(2)} / ${bankAmount.toFixed(2)}`} /></div><div className="overflow-auto"><table className="w-full text-left text-sm">
      <thead><tr className="border-b"><th className="whitespace-nowrap p-2">Date</th><th className="whitespace-nowrap p-2">Items</th><th className="whitespace-nowrap p-2">Payment</th><th className="whitespace-nowrap p-2">Total</th></tr></thead>
      <tbody>{sales.slice((page - 1) * pageSize, page * pageSize).map((sale) => <tr className="border-b" key={sale.id}>
        <td className="whitespace-nowrap p-2">{formatSaleDate(sale.created_at)}</td>
        <td className="whitespace-nowrap p-2">{sale.items.map((item) => `${item.name} (${item.size}, ${item.color}) x${item.quantity}`).join(', ')}</td>
        <td className="whitespace-nowrap p-2">{sale.payment_method.replace('_', ' ')}</td>
        <td className="whitespace-nowrap p-2 font-medium">{Number(sale.total_amount).toFixed(2)}</td>
      </tr>)}</tbody>
    </table></div><Pagination page={page} pageSize={pageSize} total={sales.length} onChange={setPage} /></>}
  </Card>;
}

function SummaryCard({ label, value }) {
  return <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-slate-900">{value}</p></div>;
}

function Pagination({ page, pageSize, total, onChange }) {
  const pageCount = Math.ceil(total / pageSize);
  if (pageCount <= 1) return null;
  return <div className="mt-4 flex items-center justify-between gap-3 text-sm">
    <span className="text-slate-500">Page {page} of {pageCount}</span>
    <div className="flex gap-2">
      <button className="rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={page === 1} onClick={() => onChange(page - 1)}>Previous</button>
      <button className="rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={page === pageCount} onClick={() => onChange(page + 1)}>Next</button>
    </div>
  </div>;
}

function formatSaleDate(value) {
  return new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
