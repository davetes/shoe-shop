'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getUser } from '../../lib/auth';
import OwnerDashboard from '../../components/dashboard/OwnerDashboard';

export default function DashboardPage() {
  const router = useRouter();
  useEffect(() => { if (getUser()?.role !== 'OWNER') router.replace('/'); }, [router]);
  return <main className="space-y-6"><header><p className="text-sm text-slate-500">Owner Dashboard</p><h1 className="text-3xl font-bold">Shoe Shop Overview</h1></header><OwnerDashboard /></main>;
}
