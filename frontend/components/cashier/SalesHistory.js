'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import Card from '../ui/Card';
import { useLanguage } from '../../lib/language';
import SalesDateFilter, { getSalesDateRange } from '../ui/SalesDateFilter';

export default function SalesHistory() {
  const { t } = useLanguage();
  const [sales, setSales] = useState([]);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState(() => getSalesDateRange('thisWeek'));
  const [page, setPage] = useState(1);
  const pageSize = 10;

  function loadSales() {
    setError('');
    api.get('/sales', { params: { from: dateRange.from || undefined, to: dateRange.to || undefined } })
      .then(({ data }) => setSales(data))
      .catch((requestError) => setError(requestError.response?.data?.error || 'Unable to load sales'));
  }

  useEffect(() => { setPage(1); loadSales(); }, [dateRange.from, dateRange.to]);

  const totalAmount = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const pairsSold = sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + Number(item.quantity), 0), 0);
  const cashAmount = sales.filter((sale) => sale.payment_method === 'CASH').reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const bankAmount = sales.filter((sale) => sale.payment_method === 'BANK_TRANSFER').reduce((sum, sale) => sum + Number(sale.total_amount), 0);

  return <Card title="My sales">
    <SalesDateFilter value={dateRange} onChange={setDateRange} />
    {error && <p className="text-sm text-red-600">{error}</p>}
    {!error && !sales.length && <p className="text-sm text-slate-500">{t('You have not recorded any sales yet.')}</p>}
    {!!sales.length && <><div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4"><SummaryCard label={t('Total amount')} value={totalAmount.toFixed(2)} /><SummaryCard label={t('Sales')} value={sales.length} /><SummaryCard label={t('Pairs sold')} value={pairsSold} /><SummaryCard label={t('Cash / Bank')} value={`${cashAmount.toFixed(2)} / ${bankAmount.toFixed(2)}`} /></div><div className="overflow-auto"><table className="w-full text-left text-sm">
      <thead><tr className="border-b"><th className="whitespace-nowrap p-2">{t('Date')}</th><th className="whitespace-nowrap p-2">{t('Items')}</th><th className="whitespace-nowrap p-2">{t('Payment')}</th><th className="whitespace-nowrap p-2">{t('Total')}</th></tr></thead>
      <tbody>{sales.slice((page - 1) * pageSize, page * pageSize).map((sale) => <tr className="border-b" key={sale.id}>
        <td className="whitespace-nowrap p-2">{formatSaleDate(sale.created_at)}</td>
        <td className="whitespace-nowrap p-2">{sale.items.map((item) => `${item.name} (${item.size}, ${item.color}) x${item.quantity}`).join(', ')}</td>
        <td className="whitespace-nowrap p-2">{t(sale.payment_method === 'CASH' ? 'Cash' : 'Bank transfer')}</td>
        <td className="whitespace-nowrap p-2 font-medium">{Number(sale.total_amount).toFixed(2)}</td>
      </tr>)}</tbody>
    </table></div><Pagination page={page} pageSize={pageSize} total={sales.length} onChange={setPage} t={t} /></>}
  </Card>;
}

function SummaryCard({ label, value }) {
  return <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-slate-900">{value}</p></div>;
}

function Pagination({ page, pageSize, total, onChange, t }) {
  const pageCount = Math.ceil(total / pageSize);
  if (pageCount <= 1) return null;
  return <div className="mt-4 flex items-center justify-between gap-3 text-sm">
    <span className="text-slate-500">{t('Page')} {page} {t('of')} {pageCount}</span>
    <div className="flex gap-2">
      <button className="rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={page === 1} onClick={() => onChange(page - 1)}>{t('Previous')}</button>
      <button className="rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={page === pageCount} onClick={() => onChange(page + 1)}>{t('Next')}</button>
    </div>
  </div>;
}

function formatSaleDate(value) {
  return new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
