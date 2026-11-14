'use client';
import { useLanguage } from '../../lib/language';

export default function Card({ title, children, className = '' }) {
  const { t } = useLanguage();

  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm shadow-slate-100/40 backdrop-blur md:p-6 ${className}`}
    >
      {title && (
        <h2 className="mb-4 text-lg font-mono font-semibold leading-tight tracking-[-0.025em] text-slate-950">
          {typeof title === 'string' ? t(title) : title}
        </h2>
      )}
      {children}
    </section>
  );
}
