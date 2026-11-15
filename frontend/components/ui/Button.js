export default function Button({ children, className = '', ...props }) {
  const styles = [
    'inline-flex items-center justify-center rounded-xl bg-yellow-600 px-4 py-2.5',
    'text-sm font-semibold text-white shadow-md shadow-yellow-600/30 transition-all duration-150',
    'hover:bg-yellow-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500',
    'focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    className,
  ].join(' ');

  return (
    <button className={styles} {...props}>
      {children}
    </button>
  );
}
