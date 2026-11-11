import StockForm from '../../../components/cashier/StockForm';
export default function ImportPage() {
  return <main className="mx-auto max-w-xl space-y-6"><h1 className="text-3xl font-bold">Import stock</h1><p className="text-slate-600">Record new stock arriving at your assigned store.</p><StockForm mode="import" /></main>;
}
