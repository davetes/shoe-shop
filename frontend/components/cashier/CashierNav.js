'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clearSession, getUser } from '../../lib/auth';
import { useLanguage } from '../../lib/language';
import LanguageSelector from '../ui/LanguageSelector';

const links = [
  { href: '/cashier/sales', label: 'Register sale' },
  { href: '/cashier/history', label: 'My sales' },
  { href: '/cashier/inventory', label: 'Add new shoe' },
];

export default function CashierNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (getUser()?.role !== 'CASHIER') {
      router.replace('/');
    }
  }, [router]);

  useEffect(() => {
    if (!open) return undefined;

    function closeOnOutsidePointer(event) {
      if (!headerRef.current?.contains(event.target)) setOpen(false);
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [open]);

  function signOut() {
    clearSession();
    router.push('/login');
  }

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-40 border-b border-slate-200 bg-white text-slate-900
        shadow-sm transition-colors duration-300"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex min-h-16 items-center justify-between gap-4">
          <button
            className="flex shrink-0 items-center gap-2.5 text-left"
            onClick={() => router.push('/cashier/sales')}
          >
            <span className="font-display text-lg font-semibold tracking-[-0.03em] text-slate-950">
              Shoe Shop
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              aria-expanded={open}
              aria-label="Toggle cashier menu"
              className="rounded-lg border border-slate-200 px-3 py-2 text-xl
                text-slate-700 transition hover:bg-slate-50 md:hidden"
              onClick={() => setOpen(!open)}
            >
              {open ? '×' : '☰'}
            </button>
            <LanguageSelector compact className="md:hidden" />
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.href}
                link={link}
                active={pathname === link.href}
                onNavigate={() => router.push(link.href)}
              />
            ))}
            <button
              className="ml-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm
                font-medium text-slate-600 transition hover:bg-slate-100
                hover:text-slate-950"
              onClick={signOut}
            >
              {t('Sign out')}
            </button>
            <LanguageSelector className="ml-2" />
          </nav>
        </div>
      </div>

      {open && (
        <nav
          className="relative bg-white/90 px-4 py-3 md:hidden before:pointer-events-none
            before:absolute before:inset-x-0 before:top-0 before:h-px
            before:bg-gradient-to-r before:from-transparent before:via-slate-300/60
            before:to-transparent"
        >
          <div className="grid gap-1">
            {links.map((link) => (
              <NavLink
                key={link.href}
                link={link}
                active={pathname === link.href}
                onNavigate={() => {
                  setOpen(false);
                  router.push(link.href);
                }}
              />
            ))}
            <button
              className="whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm
                font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              onClick={signOut}
            >
              {t('Sign out')}
            </button>
            <LanguageSelector compact className="my-2" />
          </div>
        </nav>
      )}
    </header>
  );
}

function NavLink({ link, active, onNavigate }) {
  const { t } = useLanguage();

  return (
    <button
      className={`relative whitespace-nowrap rounded-lg border border-transparent px-3 py-2
        text-left text-[15px] transition-colors ${
          active
            ? 'bg-yellow-50 font-semibold text-yellow-900 ring-1 ring-inset ring-yellow-200'
            : 'font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950'
        }`}
      onClick={onNavigate}
    >
      {t(link.label)}
    </button>
  );
}
