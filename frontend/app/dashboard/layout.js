import AdminNav from '../../components/dashboard/AdminNav';

export default function DashboardLayout({ children }) {
  return <div className="min-h-screen">
    <AdminNav />
    <main className="mx-auto max-w-6xl px-4 pb-10 pt-28 md:px-6">{children}</main>
  </div>;
}
