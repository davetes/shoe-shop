'use client';
import { Fragment } from 'react';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../lib/language';
import SalesDateFilter, { getSalesDateRange } from '../../../components/ui/SalesDateFilter';

const emptyForm = { fullName: '', username: '', password: '', storeId: '1' };

export default function CashiersPage() {
  const { t } = useLanguage();
  const [cashiers, setCashiers] = useState([]);
  const [stores, setStores] = useState([]);
  const [sales, setSales] = useState([]);
  const [selectedCashierId, setSelectedCashierId] = useState('');
  const [dateRange, setDateRange] = useState(() => getSalesDateRange('thisWeek'));
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [accountForm, setAccountForm] = useState({ fullName: '', username: '', password: '' });

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
    api.get('/sales', { params: { cashierId: selectedCashierId, from: dateRange.from || undefined, to: dateRange.to || undefined } })
      .then(({ data }) => setSales(data))
      .catch((error) => setMessage(error.response?.data?.error || 'Unable to load cashier sales'));
  }

  useEffect(() => { loadSales(); }, [selectedCashierId, dateRange.from, dateRange.to]);

  async function createCashier(event) {
    event.preventDefault();
    try {
      await api.post('/users/cashiers', { ...form, storeId: Number(form.storeId) });
      setForm({ ...emptyForm, storeId: form.storeId });
      setMessage('Cashier account created.');
      loadCashiers();
    } catch (error) { setMessage(error.response?.data?.error || 'Unable to create cashier'); }
  }

  async function updateAccount(event) {
    event.preventDefault();
    if (!selectedCashierId) return;
    try {
      await api.patch(`/users/cashiers/${selectedCashierId}`, accountForm);
      setAccountForm({ fullName: '', username: '', password: '' });
      setShowReset(false);
      setMessage('Cashier account updated.');
      loadCashiers();
    } catch (error) { setMessage(error.response?.data?.error || 'Unable to update cashier account'); }
  }

  const selectedCashier = cashiers.find((cashier) => cashier.id === selectedCashierId);
  const analysis = sales.reduce((result, sale) => {
    const amount = Number(sale.total_amount);
    result.total += amount;
    result.count += 1;
    result[sale.payment_method] += amount;
    sale.items.forEach((item) => {
      const key = item.productId ?? `${item.name}-${item.size}-${item.color}`;
      if (!result.products[key]) {
        result.products[key] = {
          key,
          name: item.name,
          size: item.size,
          color: item.color,
          quantity: 0,
          amount: 0,
          cash: 0,
          bank: 0,
          details: [],
        };
      }
      const quantity = Number(item.quantity);
      const itemAmount = quantity * Number(item.unitPrice);
      result.products[key].quantity += quantity;
      result.products[key].amount += itemAmount;
      result.products[key][sale.payment_method === 'CASH' ? 'cash' : 'bank'] += itemAmount;
      result.products[key].details.push({ sale, item, amount: itemAmount });
    });
    return result;
  }, { total: 0, count: 0, CASH: 0, BANK_TRANSFER: 0, products: {} });
  const productAnalysis = Object.values(analysis.products).sort((first, second) => second.quantity - first.quantity);
  return <main className="space-y-6">
    <div><h1 className="text-3xl font-bold">{t('Cashier management')}</h1><p className="text-slate-600">{t('View cashier details, sales, and account access.')}</p></div>
    <Card title="Cashiers">
      <div className="mb-4 flex items-center justify-between"><p className="text-sm text-slate-500">{t('Click a cashier to view their details and sales.')}</p><button className="rounded-xl bg-yellow-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-yellow-600/30 transition-colors hover:bg-yellow-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2" type="button" onClick={() => setShowCreate(!showCreate)}>{t(showCreate ? 'Hide form' : '+ Create cashier')}</button></div>
      {showCreate && <form onSubmit={createCashier} className="mb-5 grid gap-3 rounded-lg bg-slate-50 p-4 md:grid-cols-5">
        <label className="text-sm font-medium text-slate-700">{t('Full name')}<input className="mt-1 w-full rounded border p-2 font-normal" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label>
        <label className="text-sm font-medium text-slate-700">{t('Username')}<input className="mt-1 w-full rounded border p-2 font-normal" required minLength="3" maxLength="40" pattern="[A-Za-z0-9._-]+" autoComplete="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></label>
        <label className="text-sm font-medium text-slate-700">{t('Temporary password')}<input className="mt-1 w-full rounded border p-2 font-normal" required minLength="6" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        <label className="text-sm font-medium text-slate-700">{t('Store')}<select className="mt-1 w-full rounded border p-2 font-normal" value={form.storeId} onChange={(e) => setForm({ ...form, storeId: e.target.value })}>{stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}</select></label>
        <div className="flex items-end"><Button>{t('Create account')}</Button></div>
      </form>}
      {!cashiers.length ? <p className="text-sm text-slate-500">{t('No cashiers found.')}</p> : <div className="overflow-auto"><table className="w-full text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr className="border-b"><th className="whitespace-nowrap p-3">{t('Name')}</th><th className="whitespace-nowrap p-3">{t('Username')}</th><th className="whitespace-nowrap p-3">{t('Store')}</th><th className="whitespace-nowrap p-3">{t('Action')}</th></tr></thead><tbody>{cashiers.map((cashier) => <tr className={`cursor-pointer border-b last:border-0 hover:bg-slate-50 ${cashier.id === selectedCashierId ? 'bg-blue-50' : ''}`} key={cashier.id} onClick={() => setSelectedCashierId(cashier.id)}><td className="whitespace-nowrap p-3 font-medium">{cashier.full_name}</td><td className="whitespace-nowrap p-3">{cashier.username}</td><td className="whitespace-nowrap p-3">{cashier.store_name}</td><td className="whitespace-nowrap p-3"><div className="flex gap-3 whitespace-nowrap"><button className="font-medium text-blue-700 underline" type="button" onClick={(event) => { event.stopPropagation(); setSelectedCashierId(cashier.id); }}>{t('View details')}</button><button className="font-medium text-amber-700 underline" type="button" onClick={(event) => { event.stopPropagation(); setSelectedCashierId(cashier.id); setAccountForm({ fullName: cashier.full_name, username: cashier.username, password: '' }); setShowReset(true); }}>{t('Edit account')}</button></div></td></tr>)}</tbody></table></div>}
    </Card>
    <Card title={`${selectedCashier?.full_name || t('Cashier')} ${t('sales')}`}>
      <SalesDateFilter value={dateRange} onChange={setDateRange} />
      <div className="mb-4">
        <h3 className="mb-2 text-sm font-semibold">{t('Sales summary')}</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <Metric label={t('Total revenue')} value={analysis.total.toFixed(2)} tone="dark" />
          <Metric label={t('Cash revenue')} value={analysis.CASH.toFixed(2)} tone="green" />
          <Metric label={t('Bank transfer')} value={analysis.BANK_TRANSFER.toFixed(2)} tone="blue" />
          <Metric label={t('Transactions')} value={String(analysis.count)} />
          <Metric label={t('Pairs sold')} value={String(productAnalysis.reduce((sum, item) => sum + item.quantity, 0))} />
        </div>
      </div>
      {!!productAnalysis.length && <div className="mb-6 rounded-lg border border-slate-200"><div className="border-b bg-slate-50 p-4"><h3 className="font-semibold">{t('Products sold')}</h3><p className="mt-1 text-sm text-slate-500">{t('Best-selling shoes for the selected cashier and period.')}</p></div><div className="overflow-auto"><table className="w-full text-left text-sm">
        <thead className="text-xs uppercase text-slate-500"><tr className="border-b"><th className="whitespace-nowrap p-3">{t('Product')}</th><th className="whitespace-nowrap p-3">{t('Pairs sold')}</th><th className="whitespace-nowrap p-3">{t('Cash')}</th><th className="whitespace-nowrap p-3">{t('Bank transfer')}</th><th className="whitespace-nowrap p-3">{t('Total')}</th><th className="whitespace-nowrap p-3">{t('Details')}</th></tr></thead>
        <tbody>{productAnalysis.map((product) => {
          const isExpanded = expandedProduct === product.key;
          return <Fragment key={product.key}>
            <tr className="border-b last:border-0">
              <td className="whitespace-nowrap p-3 font-medium">{product.name} ({product.size}, {product.color})</td>
              <td className="whitespace-nowrap p-3">{product.quantity}</td>
              <td className="whitespace-nowrap p-3">{product.cash.toFixed(2)}</td>
              <td className="whitespace-nowrap p-3">{product.bank.toFixed(2)}</td>
              <td className="whitespace-nowrap p-3 font-medium">{product.amount.toFixed(2)}</td>
              <td className="whitespace-nowrap p-3">
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
                    <thead><tr className="text-slate-500"><th className="whitespace-nowrap p-2">{t('Date')}</th><th className="whitespace-nowrap p-2">{t('Payment method')}</th><th className="whitespace-nowrap p-2">{t('Quantity')}</th><th className="whitespace-nowrap p-2">{t('Price per pair')}</th><th className="whitespace-nowrap p-2">{t('Amount')}</th></tr></thead>
                    <tbody>{product.details.map(({ sale, item, amount }, index) => <tr className="border-t border-slate-200" key={`${sale.id}-${item.productId}-${index}`}>
                      <td className="whitespace-nowrap p-2">{formatSaleDate(sale.created_at)}</td>
                      <td className="whitespace-nowrap p-2"><PaymentBadge method={sale.payment_method} /></td>
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
      </table></div></div>}
      <div className="rounded-lg border border-slate-200"><div className="border-b bg-slate-50 p-4"><h3 className="font-semibold">{t('Sale details')}</h3><p className="mt-1 text-sm text-slate-500">{t('Every sale recorded by this cashier.')}</p></div>{!sales.length ? <p className="p-4 text-sm text-slate-500">{t('No sales found for this selection.')}</p> : <div className="overflow-auto"><table className="w-full text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr className="border-b"><th className="whitespace-nowrap p-3">{t('Date')}</th><th className="whitespace-nowrap p-3">{t('Items')}</th><th className="whitespace-nowrap p-3">{t('Payment method')}</th><th className="whitespace-nowrap p-3">{t('Total')}</th></tr></thead><tbody>{sales.map((sale) => <tr className="border-b last:border-0" key={sale.id}><td className="whitespace-nowrap p-3">{formatSaleDate(sale.created_at)}</td><td className="whitespace-nowrap p-3">{sale.items.map((item) => `${item.name} x${item.quantity}`).join(', ')}</td><td className="whitespace-nowrap p-3"><PaymentBadge method={sale.payment_method} /></td><td className="whitespace-nowrap p-3 font-semibold">{Number(sale.total_amount).toFixed(2)}</td></tr>)}</tbody></table></div>}</div>
    </Card>
    {showReset && selectedCashier && <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-labelledby="edit-account-title">
      <form onSubmit={updateAccount} className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between"><div><h2 id="edit-account-title" className="text-lg font-semibold">{t('Edit cashier account')}</h2><p className="text-sm text-slate-500">{selectedCashier.store_name}</p></div><button type="button" className="text-2xl text-slate-500" aria-label="Close edit account dialog" onClick={() => setShowReset(false)}>×</button></div>
        <label className="block text-sm font-medium text-slate-700">{t('Full name')}<input className="mt-1 w-full rounded border p-2 font-normal" required value={accountForm.fullName} onChange={(e) => setAccountForm({ ...accountForm, fullName: e.target.value })} /></label>
        <label className="block text-sm font-medium text-slate-700">{t('Username')}<input className="mt-1 w-full rounded border p-2 font-normal" required minLength="3" maxLength="40" pattern="[A-Za-z0-9._-]+" autoComplete="username" value={accountForm.username} onChange={(e) => setAccountForm({ ...accountForm, username: e.target.value })} /></label>
        <label className="block text-sm font-medium text-slate-700">{t('New password (optional)')}<input className="mt-1 w-full rounded border p-2 font-normal" minLength="6" type="password" placeholder={t('Leave blank to keep current password')} value={accountForm.password} onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })} /></label>
        <div className="flex justify-end gap-2"><button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={() => setShowReset(false)}>{t('Cancel')}</button><Button>{t('Save changes')}</Button></div>
      </form>
    </div>}
    {message && <p className="rounded bg-slate-100 p-3 text-sm">{message}</p>}
  </main>;
}

function Metric({ label, value, tone = 'light' }) {
  const styles = { dark: 'bg-slate-900 text-white', green: 'bg-emerald-50 text-emerald-900', blue: 'bg-blue-50 text-blue-900', light: 'bg-slate-50 text-slate-900' };
  return <div className={`rounded-lg p-2.5 ${styles[tone]}`}><p className={`text-[11px] leading-tight ${tone === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>{label}</p><p className="mt-0.5 text-base font-bold">{value}</p></div>;
}

function PaymentBadge({ method }) {
  const { t } = useLanguage();
  const isCash = method === 'CASH';
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${isCash ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>{t(isCash ? 'Cash' : 'Bank transfer')}</span>;
}

function formatSaleDate(value) {
  return new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
