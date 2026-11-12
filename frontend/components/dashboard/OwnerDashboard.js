'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import Card from '../ui/Card';
import { useLanguage } from '../../lib/language';

export default function OwnerDashboard({ alertsOnly = false }) {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [stores, setStores] = useState([]);
  const [inventoryStore, setInventoryStore] = useState('all');
  const [error, setError] = useState('');
  const [amounts, setAmounts] = useState({});
  const [message, setMessage] = useState('');
  const [threshold, setThreshold] = useState(5);
  function loadDashboard() {
    Promise.all([api.get('/reports/dashboard'), api.get('/inventory'), api.get('/stores')])
      .then(([dashboardResponse, inventoryResponse, storesResponse]) => {
        setData(dashboardResponse.data);
        setInventory(inventoryResponse.data);
        setStores(storesResponse.data);
      })
      .catch((e) => setError(e.response?.data?.error || 'Unable to load dashboard'));
  }
  useEffect(() => { loadDashboard(); }, []);
  useEffect(() => {
    if (alertsOnly) api.get('/stores').then(({ data: stores }) => {
      if (stores.length) setThreshold(stores[0].low_stock_threshold);
    }).catch(() => setMessage('Unable to load alert settings'));
  }, [alertsOnly]);
  async function saveThreshold(event) {
    event.preventDefault();
    try {
      await api.patch('/stores/threshold', { threshold: Number(threshold) });
      setMessage('Alert threshold updated for all stores.');
      loadDashboard();
    } catch (requestError) {
      setMessage(requestError.response?.data?.error || 'Unable to update alert threshold');
    }
  }
  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return <p>{t('Loading dashboard...')}</p>;
  const total = data.totals.reduce((sum, row) => sum + Number(row.total), 0);
  return <div className="space-y-6">
    {!alertsOnly && <><div className="grid gap-4 md:grid-cols-3">
      <Card title="Today’s sales"><p className="text-3xl font-bold">{total.toFixed(2)}</p></Card>
      {data.totals.map((row) => <Card key={row.payment_method} title={t(row.payment_method.replace('_', ' '))}><p className="text-2xl font-bold">{Number(row.total).toFixed(2)}</p></Card>)}
    </div><Card title="Cashier breakdown"><div className="divide-y">{data.cashiers.map((row) => <div className="flex justify-between py-3" key={row.full_name}><span>{row.full_name} <small className="text-slate-500">({row.store_name})</small></span><strong>{Number(row.total).toFixed(2)} ({row.sale_count} {t('sales')})</strong></div>)}</div></Card><Card title={<div className="flex flex-wrap items-center justify-between gap-3"><span>{t('Inventory by store')}</span><label className="flex items-center gap-2 text-sm font-medium text-slate-700">{t('Store')}<select className="rounded border border-slate-300 bg-white px-2 py-1 font-normal" value={inventoryStore} onChange={(event) => setInventoryStore(event.target.value)}><option value="all">{t('All stores')}</option>{stores.map((store) => <option key={store.id} value={String(store.id)}>{store.name}</option>)}</select></label></div>}><div className="grid gap-4 md:grid-cols-3">{groupInventory(inventory, stores, inventoryStore).map(([storeName, items]) => <div className="rounded-lg border border-slate-200" key={storeName}><h3 className="border-b bg-slate-50 p-3 font-semibold">{storeName}</h3>{items.length ? <div className="divide-y">{items.map((item) => <div className="flex justify-between gap-3 p-3 text-sm" key={`${item.product_id}-${item.store_id}`}><span className="whitespace-nowrap">{item.name} <span className="text-slate-500">({item.size}, {item.color})</span></span><strong className="whitespace-nowrap">{item.quantity} {t('pairs')}</strong></div>)}</div> : <p className="p-3 text-sm text-slate-500">{t('No inventory')}</p>}</div>)}</div></Card></>}
    {alertsOnly && <Card title="General alert setting"><form className="flex items-end gap-3" onSubmit={saveThreshold}><label className="text-sm font-medium text-slate-700">{t('Alert when stock is below')}<input className="mt-1 block w-28 rounded border p-2" required min="0" type="number" value={threshold} onChange={(event) => setThreshold(event.target.value)} /></label><span className="pb-2 text-sm text-slate-500">{t('pairs in any store')}</span><button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white" type="submit">{t('Save')}</button></form></Card>}
    <Card title={<>{t('Low stock alerts')} ({data.alerts.length})</>}>
      {data.alerts.length ? <div className="space-y-3">{data.alerts.map((row) => {
        const key = `${row.store_id}-${row.product_id}`;
        async function addPairs() {
          const quantity = Number(amounts[key]);
          if (!Number.isInteger(quantity) || quantity <= 0) {
            setMessage('Enter a positive whole number of pairs.');
            return;
          }
          try {
            await api.post('/inventory', { productId: row.product_id, storeId: row.store_id, quantity, notes: 'Stock added from low-stock alert' });
            setAmounts({ ...amounts, [key]: '' });
            setMessage('Stock added and alerts refreshed.');
            loadDashboard();
          } catch (requestError) {
            setMessage(requestError.response?.data?.error || 'Unable to add stock');
          }
        }
        return <div className="rounded-lg border border-amber-200 bg-amber-50 p-3" key={key}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-amber-950"><p className="font-semibold">{row.name} - {t('size')} {row.size} - {row.color}</p><p className="text-sm">{row.store_name}: <strong>{row.quantity} {t('pairs')}</strong> {t('remaining, alert threshold')} {row.low_stock_threshold}</p></div>
            <div className="flex items-end gap-2"><label className="whitespace-nowrap text-xs font-medium text-amber-900">{t('Add pairs')}<input aria-label={`${t('Add pairs')} for ${row.name} at ${row.store_name}`} className="mt-1 block w-24 rounded border border-amber-300 bg-white p-2 text-sm text-slate-900" min="1" type="number" placeholder="0" value={amounts[key] || ''} onChange={(event) => setAmounts({ ...amounts, [key]: event.target.value })} /></label><button className="rounded-lg bg-amber-700 px-3 py-2 text-sm font-medium text-white hover:bg-amber-800" type="button" onClick={addPairs}>{t('Add')}</button></div>
          </div>
        </div>;
      })}</div> : <p className="text-emerald-700">{t('All stores are above their thresholds.')}</p>}
      {message && <p className="mt-3 text-sm text-slate-700">{message}</p>}
    </Card>
  </div>;
}

function groupInventory(rows, stores, selectedStore) {
  const visibleStores = selectedStore === 'all' ? stores : stores.filter((store) => String(store.id) === selectedStore);
  const groups = new Map(visibleStores.map((store) => [store.name, []]));
  rows.filter((row) => selectedStore === 'all' || String(row.store_id) === selectedStore).forEach((row) => {
    if (!groups.has(row.store_name)) groups.set(row.store_name, []);
    groups.get(row.store_name).push(row);
  });
  return Array.from(groups.entries()).sort(([first], [second]) => first.localeCompare(second));
}
