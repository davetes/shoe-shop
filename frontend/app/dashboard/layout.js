import AdminNav from '../../components/dashboard/AdminNav';

export default function DashboardLayout({ children }) {
  return <div className="mx-auto max-w-6xl p-4 md:p-6">
    <AdminNav />
    {children}
  </div>;
}
