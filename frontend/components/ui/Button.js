export default function Button({ children, className = '', variant = 'primary', ...props }) {
  const variantStyles = variant === 'accent'
    ? 'bg-yellow-600 shadow-yellow-600/30 hover:bg-yellow-500 focus-visible:ring-yellow-600'
    : 'bg-slate-900 shadow-slate-900/20 hover:bg-slate-700 focus-visible:ring-slate-700';
  const styles = [
    'inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2.5',
    `text-sm font-semibold text-white shadow-md transition-all duration-150 ${variantStyles}`,
    'focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    className,
  ].join(' ');

  return (
    <button className={styles} {...props}>
      {children}
    </button>
  );
}
