import StockForm from '../../../components/cashier/StockForm';
export default function ExportPage() {
  return <main className="mx-auto max-w-xl space-y-6"><h1 className="text-3xl font-bold">Transfer stock</h1><p className="text-slate-600">Send stock from your assigned store to another store.</p><StockForm mode="export" /></main>;
}
