import './globals.css';

export const metadata = { title: 'Shoe Shop Inventory', description: 'Inventory and sales management' };

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
