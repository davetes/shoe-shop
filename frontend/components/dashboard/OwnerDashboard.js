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
    Promise.all([
      api.get('/reports/dashboard'),
      api.get('/inventory'),
      api.get('/stores'),
    ])
      .then(([dashboardRes, inventoryRes, storesRes]) => {
        setData(dashboardRes.data);
        setInventory(inventoryRes.data);
        setStores(storesRes.data);
      })
      .catch((err) =>
        setError(err.response?.data?.error || 'Unable to load dashboard')
      );
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (!alertsOnly) return;
    api
      .get('/stores')
      .then(({ data: storeList }) => {
        if (storeList.length) setThreshold(storeList[0].low_stock_threshold);
      })
      .catch(() => setMessage('Unable to load alert settings'));
  }, [alertsOnly]);

  async function saveThreshold(event) {
    event.preventDefault();
    try {
      await api.patch('/stores/threshold', { threshold: Number(threshold) });
      setMessage('Alert threshold updated for all stores.');
      loadDashboard();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Unable to update alert threshold');
    }
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50/60 px-4 py-3 text-[13px] font-medium text-red-700">
        {error}
      </div>
    );
  }

  if (!data) {
    return <p className="text-[13px] text-slate-400">{t('Loading dashboard...')}</p>;
  }

  const total = data.totals.reduce((sum, row) => sum + Number(row.total), 0);

  return (
    <div className="space-y-6">
      {!alertsOnly && (
        <>
          {/* ── Stat grid ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label={t("Today's sales")} value={total.toFixed(2)} accent />
            {data.totals.map((row) => (
              <StatCard
                key={row.payment_method}
                label={t(row.payment_method.replace('_', ' '))}
                value={Number(row.total).toFixed(2)}
              />
            ))}
          </div>

          {/* ── Cashier breakdown ── */}
          <Card title={t('Cashier breakdown')}>
            {data.cashiers.length ? (
              <div className="divide-y divide-slate-100">
                {data.cashiers.map((row) => (
                  <div
                    key={row.full_name}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <span className="truncate text-[13px] text-slate-700">
                      {row.full_name}
                      <span className="ml-1.5 text-slate-400">({row.store_name})</span>
                    </span>
                    <span className="shrink-0 text-[13px] tabular-nums text-slate-900">
                      <span className="font-semibold">{Number(row.total).toFixed(2)}</span>
                      <span className="ml-1.5 text-slate-400">
                        · {row.sale_count} {t('sales')}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-slate-400">{t('No sales recorded yet.')}</p>
            )}
          </Card>

          {/* ── Inventory by store ── */}
          <Card
            title={
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span>{t('Inventory by store')}</span>
                <label className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">
                  {t('Store')}
                  <select
                    value={inventoryStore}
                    onChange={(e) => setInventoryStore(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[12px] font-normal normal-case tracking-normal text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:ring-offset-1"
                  >
                    <option value="all">{t('All stores')}</option>
                    {stores.map((store) => (
                      <option key={store.id} value={String(store.id)}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            }
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groupInventory(inventory, stores, inventoryStore).map(
                ([storeName, items]) => (
                  <div
                    key={storeName}
                    className="overflow-hidden rounded-xl border border-slate-100"
                  >
                    <h3 className="border-b border-slate-100 bg-slate-50/70 px-3.5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {storeName}
                    </h3>
                    {items.length ? (
                      <div className="divide-y divide-slate-100">
                        {items.map((item) => (
                          <div
                            key={`${item.product_id}-${item.store_id}`}
                            className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-[12.5px]"
                          >
                            <span className="truncate text-slate-700">
                              {item.name}
                              <span className="ml-1 text-slate-400">
                                ({item.size}, {item.color})
                              </span>
                            </span>
                            <span className="shrink-0 tabular-nums text-slate-900">
                              <span className="font-semibold">{item.quantity}</span>
                              <span className="ml-1 text-slate-400">{t('pairs')}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="px-3.5 py-3 text-[12.5px] text-slate-400">
                        {t('No inventory')}
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          </Card>
        </>
      )}

      {/* ── Alert threshold ── */}
      {alertsOnly && (
        <Card title={t('General alert setting')}>
          <form className="flex flex-wrap items-end gap-3" onSubmit={saveThreshold}>
            <label className="text-[13px] font-medium text-slate-700">
              {t('Alert when stock is below')}
              <input
                type="number"
                min="0"
                required
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="mt-1.5 block w-24 rounded-lg border border-slate-200 p-2 text-[13px] tabular-nums text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:ring-offset-1"
              />
            </label>
            <span className="pb-2 text-[13px] text-slate-400">
              {t('pairs in any store')}
            </span>
            <button
              type="submit"
              className="rounded-lg border border-slate-900 bg-transparent px-4 py-2 text-[13px] font-medium text-slate-900 transition-colors hover:border-slate-600 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              {t('Save')}
            </button>
          </form>
        </Card>
      )}

      {/* ── Low stock alerts ── */}
      <Card
        title={
          <span>
            {t('Low stock alerts')}
            <span className="ml-1.5 font-normal text-slate-400">
              ({data.alerts.length})
            </span>
          </span>
        }
      >
        {data.alerts.length ? (
          <div className="space-y-3">
            {data.alerts.map((row) => {
              const key = `${row.store_id}-${row.product_id}`;

              async function addPairs() {
                const quantity = Number(amounts[key]);
                if (!Number.isInteger(quantity) || quantity <= 0) {
                  setMessage('Enter a positive whole number of pairs.');
                  return;
                }
                try {
                  await api.post('/inventory', {
                    productId: row.product_id,
                    storeId: row.store_id,
                    quantity,
                    notes: 'Stock added from low-stock alert',
                  });
                  setAmounts((prev) => ({ ...prev, [key]: '' }));
                  setMessage('Stock added and alerts refreshed.');
                  loadDashboard();
                } catch (err) {
                  setMessage(err.response?.data?.error || 'Unable to add stock');
                }
              }

              return (
                <div
                  key={key}
                  className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 transition-colors hover:border-amber-200"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-amber-950">
                        {row.name}
                        <span className="ml-1.5 font-normal text-amber-800">
                          · {t('size')} {row.size} · {row.color}
                        </span>
                      </p>
                      <p className="mt-1 text-[12.5px] text-amber-800">
                        {row.store_name}:{' '}
                        <span className="font-semibold tabular-nums">
                          {row.quantity} {t('pairs')}
                        </span>{' '}
                        {t('remaining, alert threshold')}{' '}
                        <span className="tabular-nums">{row.low_stock_threshold}</span>
                      </p>
                    </div>

                    <div className="flex items-end gap-2">
                      <label className="whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.1em] text-amber-700">
                        {t('Add pairs')}
                        <input
                          type="number"
                          min="1"
                          placeholder="0"
                          aria-label={`${t('Add pairs')} for ${row.name} at ${row.store_name}`}
                          value={amounts[key] || ''}
                          onChange={(e) =>
                            setAmounts((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          className="mt-1.5 block w-20 rounded-lg border border-amber-200 bg-white p-1.5 text-[13px] tabular-nums text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20 focus-visible:ring-offset-1"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={addPairs}
                        className="rounded-lg border border-amber-700 bg-transparent px-3.5 py-1.5 text-[13px] font-medium text-amber-800 transition-colors hover:border-amber-900 hover:text-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2"
                      >
                        {t('Add')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[13px] font-medium text-emerald-600">
            {t('All stores are above their thresholds.')}
          </p>
        )}

        {message && (
          <p className="mt-4 text-[12.5px] text-slate-500">{message}</p>
        )}
      </Card>
    </div>
  );
}

/* ───────── StatCard ───────── */
function StatCard({ label, value, accent = false }) {
  return (
    <div
      className={[
        'rounded-2xl border bg-white/80 p-5 shadow-sm shadow-slate-200/40 backdrop-blur transition-colors',
        accent ? 'border-slate-200/90' : 'border-slate-200/70',
      ].join(' ')}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p
        className={[
          'mt-2.5 text-[22px] leading-none tracking-[-0.02em] tabular-nums',
          accent ? 'font-semibold text-slate-950' : 'font-medium text-slate-800',
        ].join(' ')}
      >
        {value}
      </p>
    </div>
  );
}

/* ───────── groupInventory ───────── */
function groupInventory(rows, stores, selectedStore) {
  const visibleStores =
    selectedStore === 'all'
      ? stores
      : stores.filter((store) => String(store.id) === selectedStore);

  const groups = new Map(visibleStores.map((store) => [store.name, []]));

  rows
    .filter((row) => selectedStore === 'all' || String(row.store_id) === selectedStore)
    .forEach((row) => {
      if (!groups.has(row.store_name)) groups.set(row.store_name, []);
      groups.get(row.store_name).push(row);
    });

  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
}