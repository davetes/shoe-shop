export default function Button({ children, className = '', ...props }) {
  const styles = [
    'rounded-lg border border-slate-900 bg-transparent px-4 py-2.5',
    'text-sm font-semibold text-slate-900 transition-colors',
    'hover:border-slate-600 hover:text-slate-600',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400',
    'focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    className,
  ].join(' ');

  return (
    <button className={styles} {...props}>
      {children}
    </button>
  );
}
