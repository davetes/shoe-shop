'use client';
import SalesHistory from '../../../components/cashier/SalesHistory';
import { useLanguage } from '../../../lib/language';

export default function CashierHistoryPage() {
  const { t } = useLanguage();
  return <main><h1 className="mb-6 text-3xl font-bold">{t('My sales')}</h1><SalesHistory /></main>;
}
