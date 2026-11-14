import CashierNav from '../../components/cashier/CashierNav';

export default function CashierLayout({ children }) {
  return <div className="min-h-screen">
    <CashierNav />
    <main className="mx-auto max-w-6xl px-4 pb-10 pt-28 md:px-6">{children}</main>
  </div>;
}
