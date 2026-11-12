'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getUser } from '../../lib/auth';
import OwnerDashboard from '../../components/dashboard/OwnerDashboard';
import { useLanguage } from '../../lib/language';

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();
  useEffect(() => { if (getUser()?.role !== 'OWNER') router.replace('/'); }, [router]);
  return <main className="space-y-6"><header><p className="text-sm text-slate-500">{t('Owner Dashboard')}</p><h1 className="text-3xl font-bold">{t('Shoe Shop Overview')}</h1></header><OwnerDashboard /></main>;
}
