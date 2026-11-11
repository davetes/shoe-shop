export default function Card({ title, children, className = '' }) {
  return <section className={`rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 ${className}`}>
    {title && <h2 className="mb-4 text-lg font-semibold">{title}</h2>}
    {children}
  </section>;
}
