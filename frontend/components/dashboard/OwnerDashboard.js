'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import Card from '../ui/Card';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/reports/dashboard').then((r) => setData(r.data)).catch((e) => setError(e.response?.data?.error || 'Unable to load dashboard')); }, []);
  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return <p>Loading dashboard...</p>;
  const total = data.totals.reduce((sum, row) => sum + Number(row.total), 0);
  return <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-3">
      <Card title="Today’s sales"><p className="text-3xl font-bold">{total.toFixed(2)}</p></Card>
      {data.totals.map((row) => <Card key={row.payment_method} title={row.payment_method.replace('_', ' ')}><p className="text-2xl font-bold">{Number(row.total).toFixed(2)}</p></Card>)}
    </div>
    <Card title="Cashier breakdown"><div className="divide-y">{data.cashiers.map((row) => <div className="flex justify-between py-3" key={row.full_name}><span>{row.full_name} <small className="text-slate-500">({row.store_name})</small></span><strong>{Number(row.total).toFixed(2)} ({row.sale_count} sales)</strong></div>)}</div></Card>
    <Card title={`Low stock alerts (${data.alerts.length})`}>{data.alerts.length ? <div className="space-y-2">{data.alerts.map((row) => <div className="rounded bg-amber-50 p-3 text-amber-900" key={`${row.store_id}-${row.product_id}`}>{row.name} / {row.size} / {row.color}: {row.quantity} pairs at {row.store_name}</div>)}</div> : <p className="text-emerald-700">All stores are above their thresholds.</p>}</Card>
  </div>;
}
