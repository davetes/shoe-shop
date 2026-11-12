'use client';
import OwnerDashboard from '../../../components/dashboard/OwnerDashboard';
import { useLanguage } from '../../../lib/language';
export default function AlertsPage() {
  const { t } = useLanguage();
  return <main><h1 className="mb-6 text-3xl font-bold">{t('Stock alerts')}</h1><OwnerDashboard alertsOnly /></main>;
}
