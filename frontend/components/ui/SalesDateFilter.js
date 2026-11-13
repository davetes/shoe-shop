'use client';
import { useLanguage } from '../../lib/language';

export function getSalesDateRange(preset, today = new Date()) {
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (preset === 'all') return { preset, from: '', to: '' };
  if (preset === 'today') return { preset, from: formatDate(date), to: formatDate(date) };
  if (preset === 'yesterday') {
    date.setDate(date.getDate() - 1);
    return { preset, from: formatDate(date), to: formatDate(date) };
  }
  if (preset === 'thisWeek' || preset === 'lastWeek') {
    const daysSinceMonday = (date.getDay() + 6) % 7;
    date.setDate(date.getDate() - daysSinceMonday + (preset === 'lastWeek' ? -7 : 0));
    const monday = formatDate(date);
    date.setDate(date.getDate() + 6);
    return { preset, from: monday, to: formatDate(date) };
  }
  if (preset === 'thisMonth' || preset === 'lastMonth') {
    const monthOffset = preset === 'lastMonth' ? -1 : 0;
    const firstDay = new Date(date.getFullYear(), date.getMonth() + monthOffset, 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + monthOffset + 1, 0);
    return { preset, from: formatDate(firstDay), to: formatDate(lastDay) };
  }
  return { preset: 'custom', from: '', to: '' };
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function SalesDateFilter({ value, onChange }) {
  const { t } = useLanguage();
  return <div className="mb-4 rounded-lg bg-slate-50 p-3">
    <label className="block max-w-sm text-sm font-medium text-slate-700">
      {t('Choose period')}
      <select className="mt-1 w-full rounded border bg-white p-2" value={value.preset} onChange={(event) => onChange(getSalesDateRange(event.target.value))}>
        <option value="today">{t('Today')}</option>
        <option value="yesterday">{t('Yesterday')}</option>
        <option value="thisWeek">{t('This week (Monday-Sunday)')}</option>
        <option value="lastWeek">{t('Last week (Monday-Sunday)')}</option>
        <option value="thisMonth">{t('This month')}</option>
        <option value="lastMonth">{t('Last month')}</option>
        <option value="all">{t('All time')}</option>
        <option value="custom">{t('Choose dates')}</option>
      </select>
    </label>
    {value.preset === 'custom' && <div className="mt-3 grid grid-cols-2 gap-3">
      <label className="text-sm">{t('From')}<input className="mt-1 block w-full rounded border bg-white p-2 text-sm" type="date" value={value.from} onChange={(event) => onChange({ ...value, from: event.target.value })} /></label>
      <label className="text-sm">{t('To')}<input className="mt-1 block w-full rounded border bg-white p-2 text-sm" type="date" value={value.to} onChange={(event) => onChange({ ...value, to: event.target.value })} /></label>
    </div>}
  </div>;
}
