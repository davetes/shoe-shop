'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clearSession, getUser } from '../../lib/auth';
import { useLanguage } from '../../lib/language';
import LanguageSelector from '../ui/LanguageSelector';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/inventory', label: 'Inventory' },
  { href: '/dashboard/cashiers', label: 'Cashiers' },
  { href: '/dashboard/alerts', label: 'Stock alerts' }
];

export default function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (getUser()?.role !== 'OWNER') router.replace('/');
  }, [router]);

  function signOut() {
    clearSession();
    router.push('/login');
  }

  return <header className="mb-6 rounded-xl bg-slate-900 text-white shadow">
    <div className="flex items-center justify-between p-4">
      <button className="text-left" onClick={() => router.push('/dashboard')}>
        <p className="text-xs uppercase tracking-wide text-slate-400">{t('Admin')}</p>
        <p className="text-lg font-semibold">Shoe Shop</p>
      </button>
      <div className="flex items-center gap-2"><LanguageSelector className="md:hidden" /><button aria-expanded={open} aria-label="Toggle admin menu" className="rounded-lg border border-slate-600 px-3 py-2 text-xl md:hidden" onClick={() => setOpen(!open)}>{open ? '×' : '☰'}</button></div>
      <nav className="hidden items-center gap-1 md:flex">
        {links.map((link) => <NavLink key={link.href} link={link} active={pathname === link.href} onNavigate={() => router.push(link.href)} />)}
        <LanguageSelector className="ml-2" /><button className="ml-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white" onClick={signOut}>{t('Sign out')}</button>
      </nav>
    </div>
    {open && <nav className="border-t border-slate-700 p-3 md:hidden">
      <div className="grid gap-1">
        {links.map((link) => <NavLink key={link.href} link={link} active={pathname === link.href} onNavigate={() => { setOpen(false); router.push(link.href); }} />)}
        <LanguageSelector className="my-2" /><button className="whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white" onClick={signOut}>{t('Sign out')}</button>
      </div>
    </nav>}
  </header>;
}

function NavLink({ link, active, onNavigate }) {
  const { t } = useLanguage();
  return <button className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm ${active ? 'bg-white text-slate-900' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`} onClick={onNavigate}>{t(link.label)}</button>;
}
