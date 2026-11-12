'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../lib/language';

export default function SalesPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showProductOptions, setShowProductOptions] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const selectedProduct = products.find((product) => String(product.product_id) === productId);
  const visibleProducts = products.filter((product) => `${product.name} ${product.size} ${product.color}`.toLowerCase().includes(productSearch.toLowerCase()));
  useEffect(() => {
    api.get('/inventory')
      .then(({ data }) => {
        setProducts(data);
      })
      .catch((error) => setMessage(error.response?.data?.error || 'Unable to load inventory'));
  }, []);
  async function submit(event) {
    event.preventDefault();
    try {
      await api.post('/sales', { paymentMethod, items: [{ productId: Number(productId), quantity: Number(quantity), unitPrice: Number(salePrice) }] });
      setSuccessMessage('Sale recorded and stock deducted.');
      setMessage('');
      setProductId('');
      setProductSearch('');
      setShowProductOptions(false);
      setQuantity('');
      setSalePrice('');
      setPaymentMethod('CASH');
      try {
        const { data } = await api.get('/inventory');
        setProducts(data);
      } catch (refreshError) {
        setMessage(refreshError.response?.data?.error || 'Sale recorded, but inventory could not be refreshed');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Unable to record sale');
      setMessage('');
    }
  }
  return <main className="mx-auto max-w-xl"><h1 className="mb-6 text-3xl font-bold">{t('Register sale')}</h1><form onSubmit={submit} className="space-y-4 rounded-xl bg-white p-6 shadow">
    <label className="relative block text-sm font-medium text-slate-700">{t('Product')}<input className="mt-1 w-full rounded border p-2 font-normal" placeholder={t('Type name, size, or color')} type="search" required={!productId} value={productSearch} onFocus={() => setShowProductOptions(true)} onChange={(e) => { setProductSearch(e.target.value); setProductId(''); setSalePrice(''); setShowProductOptions(true); }} />{showProductOptions && <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-auto rounded border border-slate-300 bg-white shadow-lg">{visibleProducts.length ? visibleProducts.map((product) => <button className="block w-full border-b px-3 py-2 text-left text-sm font-normal hover:bg-slate-100" type="button" key={product.product_id} onClick={() => { setProductId(String(product.product_id)); setSalePrice(String(product.selling_price)); setProductSearch(productLabel(product)); setShowProductOptions(false); }}>{productLabel(product)}</button>) : <p className="p-3 text-sm font-normal text-slate-500">{t('No matching products')}</p>}</div>}</label>
    {selectedProduct && <div className="rounded border border-slate-200 bg-slate-50 p-3 text-sm"><label className="block font-medium text-slate-700">{t('Sale price')}<input className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-slate-900" required min="0.01" step="0.01" type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} /></label><div className="mt-2 flex justify-between text-slate-600"><span>{t('Total for')} {quantity} {Number(quantity) === 1 ? 'pair' : 'pairs'}</span><strong>{(Number(salePrice || 0) * Number(quantity || 0)).toFixed(2)}</strong></div></div>}
    <label className="block text-sm font-medium text-slate-700">{t('Quantity')}<input className="mt-1 w-full rounded border p-2 font-normal" required type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></label>
    <label className="block text-sm font-medium text-slate-700">{t('Payment method')}<select className="mt-1 w-full rounded border p-2 font-normal" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}><option value="CASH">{t('Cash')}</option><option value="BANK_TRANSFER">{t('Bank transfer')}</option></select></label>
    <div className="flex justify-end"><Button disabled={!products.length}>{t('Record sale')}</Button></div>{message && <p className="text-sm text-red-600">{message}</p>}
  </form>{successMessage && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-labelledby="sale-success-title"><div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-xl"><h2 id="sale-success-title" className="text-lg font-semibold text-emerald-700">{t('Sale successful')}</h2><p className="mt-2 text-slate-700">{t(successMessage)}</p><button className="mt-5 rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700" type="button" onClick={() => setSuccessMessage('')}>{t('Close')}</button></div></div>}{errorMessage && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-labelledby="sale-error-title"><div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-xl"><h2 id="sale-error-title" className="text-lg font-semibold text-red-700">{t('Sale not recorded')}</h2><p className="mt-2 text-slate-700">{errorMessage}</p><button className="mt-5 rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700" type="button" onClick={() => setErrorMessage('')}>{t('Close')}</button></div></div>}</main>;
}

function productLabel(product) {
  return `${product.name} - size ${product.size} - ${product.color} (${product.quantity} pairs)`;
}
