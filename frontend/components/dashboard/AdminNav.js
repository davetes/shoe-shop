'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clearSession, getUser } from '../../lib/auth';
import { useLanguage } from '../../lib/language';
import api from '../../lib/api';
import LanguageSelector from '../ui/LanguageSelector';
import { Bell } from 'lucide-react';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/inventory', label: 'Inventory' },
  { href: '/dashboard/cashiers', label: 'Cashiers' },
  { href: '/dashboard/alerts', label: 'Stock alerts' },
];

export default function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const headerRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (getUser()?.role !== 'OWNER') {
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

  useEffect(() => {
    let cancelled = false;

    async function loadAlertCount() {
      try {
        const { data } = await api.get('/reports/dashboard');
        if (!cancelled) {
          setAlertCount(Array.isArray(data.alerts) ? data.alerts.length : 0);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Unable to load stock alert count', error);
        }
      }
    }

    loadAlertCount();
    const interval = window.setInterval(loadAlertCount, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [pathname]);

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
            onClick={() => router.push('/dashboard')}
          >
            <span className="font-display text-lg font-semibold tracking-[-0.03em] text-slate-950">
              Shoe Shop
            </span>
          </button>

          <div className="flex items-center gap-2">
            <LanguageSelector compact className="md:hidden" />
            {alertCount > 0 && (
              <button
                type="button"
                aria-label={`Open stock alerts, ${alertCount} alerts`}
                className="rounded-lg p-2 text-red-600 transition hover:text-red-700
                  md:hidden"
                onClick={() => router.push('/dashboard/alerts')}
              >
                <Bell size={19} strokeWidth={2} aria-hidden="true" />
              </button>
            )}
            <button
              aria-expanded={open}
              aria-label="Toggle admin menu"
              className="rounded-lg border border-slate-200 px-3 py-2 text-xl
                text-slate-700 transition hover:bg-slate-50 md:hidden"
              onClick={() => setOpen(!open)}
            >
              {open ? '×' : '☰'}
            </button>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.href}
                link={link}
                active={pathname === link.href}
                alertCount={link.href === '/dashboard/alerts' ? alertCount : 0}
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
                alertCount={link.href === '/dashboard/alerts' ? alertCount : 0}
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

function NavLink({ link, active, alertCount = 0, onNavigate }) {
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
      {alertCount > 0 && (
        <span
          className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full
            bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white"
          aria-label={`${alertCount} stock alerts`}
        >
          {alertCount > 99 ? '99+' : alertCount}
        </span>
      )}
    </button>
  );
}
