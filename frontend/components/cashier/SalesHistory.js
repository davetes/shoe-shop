'use client';
import { Fragment } from 'react';
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
  const [sortOrder, setSortOrder] = useState('newest');
  const [page, setPage] = useState(1);
  const [expandedProduct, setExpandedProduct] = useState(null);
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
  const orderedSales = [...sales].sort((first, second) => {
    const timeDifference = new Date(first.created_at).getTime() - new Date(second.created_at).getTime();
    return sortOrder === 'newest' ? -timeDifference : timeDifference;
  });
  const products = orderedSales.reduce((groups, sale) => {
    sale.items.forEach((item) => {
      const key = item.productId ?? `${item.name}-${item.size}-${item.color}`;
      if (!groups[key]) {
        groups[key] = {
          key,
          name: item.name,
          size: item.size,
          color: item.color,
          pairs: 0,
          cash: 0,
          bank: 0,
          details: [],
        };
      }

      const quantity = Number(item.quantity);
      const amount = quantity * Number(item.unitPrice);
      groups[key].pairs += quantity;
      groups[key][sale.payment_method === 'CASH' ? 'cash' : 'bank'] += amount;
      groups[key].details.push({ sale, item, amount });
    });
    return groups;
  }, {});
  const groupedProducts = Object.values(products);

  return <Card title="My sales">
    <SalesDateFilter value={dateRange} onChange={setDateRange} />
    <label className="mb-4 flex w-fit items-center gap-2 text-sm font-medium text-slate-700">
      {t('Sort sales')}
      <select
        value={sortOrder}
        onChange={(event) => setSortOrder(event.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-800 outline-none transition focus-visible:ring-2 focus-visible:ring-yellow-500"
      >
        <option value="newest">{t('Newest first')}</option>
        <option value="oldest">{t('Oldest first')}</option>
      </select>
    </label>
    {error && <p className="text-sm text-red-600">{error}</p>}
    {!error && !sales.length && <p className="text-sm text-slate-500">{t('You have not recorded any sales yet.')}</p>}
    {!!sales.length && <><div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4"><SummaryCard label={t('Total amount')} value={totalAmount.toFixed(2)} /><SummaryCard label={t('Sales')} value={sales.length} /><SummaryCard label={t('Pairs sold')} value={pairsSold} /><SummaryCard label={t('Cash / Bank')} value={`${cashAmount.toFixed(2)} / ${bankAmount.toFixed(2)}`} /></div><div className="overflow-auto"><table className="w-full text-left text-sm">
      <thead><tr className="border-b"><th className="whitespace-nowrap p-2">{t('Shoe')}</th><th className="whitespace-nowrap p-2">{t('Pairs sold')}</th><th className="whitespace-nowrap p-2">{t('Cash')}</th><th className="whitespace-nowrap p-2">{t('Bank transfer')}</th><th className="whitespace-nowrap p-2">{t('Total')}</th><th className="whitespace-nowrap p-2">{t('Details')}</th></tr></thead>
      <tbody>{groupedProducts.slice((page - 1) * pageSize, page * pageSize).map((product) => {
        const isExpanded = expandedProduct === product.key;
        return <Fragment key={product.key}>
          <tr className="border-b">
            <td className="whitespace-nowrap p-2 font-medium">{product.name} ({product.size}, {product.color})</td>
            <td className="whitespace-nowrap p-2">{product.pairs}</td>
            <td className="whitespace-nowrap p-2">{product.cash.toFixed(2)}</td>
            <td className="whitespace-nowrap p-2">{product.bank.toFixed(2)}</td>
            <td className="whitespace-nowrap p-2 font-medium">{(product.cash + product.bank).toFixed(2)}</td>
            <td className="whitespace-nowrap p-2">
              <button
                type="button"
                aria-expanded={isExpanded}
                onClick={() => setExpandedProduct(isExpanded ? null : product.key)}
                className="font-medium text-yellow-700 underline underline-offset-2 hover:text-yellow-800"
              >
                {t(isExpanded ? 'Hide details' : 'Show details')}
              </button>
            </td>
          </tr>
          {isExpanded && <tr className="border-b bg-slate-50">
            <td colSpan="6" className="p-3">
              <div className="overflow-auto">
                <table className="w-full text-left text-xs">
                  <thead><tr className="text-slate-500"><th className="whitespace-nowrap p-2">{t('Date')}</th><th className="whitespace-nowrap p-2">{t('Payment')}</th><th className="whitespace-nowrap p-2">{t('Quantity')}</th><th className="whitespace-nowrap p-2">{t('Price per pair')}</th><th className="whitespace-nowrap p-2">{t('Amount')}</th></tr></thead>
                  <tbody>{product.details.map(({ sale, item, amount }, index) => <tr className="border-t border-slate-200" key={`${sale.id}-${item.productId}-${index}`}>
                    <td className="whitespace-nowrap p-2">{formatSaleDate(sale.created_at)}</td>
                    <td className="whitespace-nowrap p-2">{t(sale.payment_method === 'CASH' ? 'Cash' : 'Bank transfer')}</td>
                    <td className="whitespace-nowrap p-2">{item.quantity}</td>
                    <td className="whitespace-nowrap p-2">{Number(item.unitPrice).toFixed(2)}</td>
                    <td className="whitespace-nowrap p-2 font-medium">{amount.toFixed(2)}</td>
                  </tr>)}</tbody>
                </table>
              </div>
            </td>
          </tr>}
        </Fragment>;
      })}</tbody>
    </table></div><Pagination page={page} pageSize={pageSize} total={groupedProducts.length} onChange={setPage} t={t} /></>}
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
