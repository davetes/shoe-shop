'use client';
import { useLanguage } from '../../lib/language';

export default function LanguageSelector({ className = '' }) {
  const { language, setLanguage } = useLanguage();
  return <label className={`inline-flex items-center gap-2 text-sm ${className}`}>
    <span className="sr-only">Language</span>
    <select aria-label="Language" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 shadow-sm" value={language} onChange={(event) => setLanguage(event.target.value)}>
      <option value="en">English</option>
      <option value="am">አማርኛ</option>
    </select>
  </label>;
}
