import './globals.css';
import { LanguageProvider } from '../lib/language';
import AppFooter from '../components/ui/AppFooter';

export const metadata = { title: 'Shoe Shop Inventory', description: 'Inventory and sales management' };

export default function RootLayout({ children }) {
  return <html lang="en"><body><LanguageProvider>{children}<AppFooter /></LanguageProvider></body></html>;
}
