'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '../../lib/auth';
import { useLanguage } from '../../lib/language';
import OwnerDashboard from '../../components/dashboard/OwnerDashboard';

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (getUser()?.role !== 'OWNER') router.replace('/');
  }, [router]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <header className="mb-6">
        
        <h1 className="mt-1.5 text-2xl font-semibold leading-tight tracking-[-0.025em] text-slate-950 md:text-3xl">
          {t('Shoe Shop Overview')}
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-700">
          {t("Review today's sales, cashier activity, and store stock.")}
        </p>
      </header>

      <OwnerDashboard />
    </main>
  );
}