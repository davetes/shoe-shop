import CashierNav from '../../components/cashier/CashierNav';

export default function CashierLayout({ children }) {
  return <div className="mx-auto max-w-6xl p-4 md:p-6">
    <CashierNav />
    {children}
  </div>;
}
