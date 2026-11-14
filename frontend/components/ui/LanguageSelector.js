'use client';
import { useLanguage } from '../../lib/language';
import { Languages } from 'lucide-react';

export default function LanguageSelector({ className = '', compact = false }) {
  const { language, setLanguage } = useLanguage();

  if (compact) {
    return (
      <label
        className={`relative inline-flex h-10 w-10 items-center justify-center rounded-lg
          border border-slate-200 text-slate-700 transition hover:border-slate-400 ${className}`}
      >
        <span className="sr-only">Language</span>
        <Languages size={18} strokeWidth={1.8} aria-hidden="true" />
        <select
          aria-label="Language"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
        >
          <option value="en">English</option>
          <option value="am">አማርኛ</option>
        </select>
      </label>
    );
  }

  return (
    <label className={`inline-flex items-center gap-2 text-sm ${className}`}>
      <span className="sr-only">Language</span>
      <select
        aria-label="Language"
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm
          font-medium text-slate-800 shadow-sm outline-none transition
          focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
      >
        <option value="en">English</option>
        <option value="am">አማርኛ</option>
      </select>
    </label>
  );
}
