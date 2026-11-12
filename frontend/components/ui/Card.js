'use client';
import { useLanguage } from '../../lib/language';

export default function Card({ title, children, className = '' }) {
  const { t } = useLanguage();
  return <section className={`rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 ${className}`}>
    {title && <h2 className="mb-4 text-lg font-semibold">{typeof title === 'string' ? t(title) : title}</h2>}
    {children}
  </section>;
}
