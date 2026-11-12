'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import Button from '../../../components/ui/Button';

export default function SalesPage() {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const selectedProduct = products.find((product) => String(product.product_id) === productId);
  useEffect(() => {
    api.get('/inventory')
      .then(({ data }) => {
        setProducts(data);
        if (data.length) setProductId(String(data[0].product_id));
      })
      .catch((error) => setMessage(error.response?.data?.error || 'Unable to load inventory'));
  }, []);
  async function submit(event) {
    event.preventDefault();
    try {
      await api.post('/sales', { paymentMethod, items: [{ productId: Number(productId), quantity: Number(quantity) }] });
      setSuccessMessage('Sale recorded and stock deducted.');
      setMessage('');
      setProductId('');
      setQuantity(1);
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
  return <main className="mx-auto max-w-xl"><h1 className="mb-6 text-3xl font-bold">Register Sale</h1><form onSubmit={submit} className="space-y-4 rounded-xl bg-white p-6 shadow">
    <select className="w-full rounded border p-2" required value={productId} onChange={(e) => setProductId(e.target.value)}>
      {products.map((product) => <option key={product.product_id} value={product.product_id}>{product.name} - size {product.size} - {product.color} ({product.quantity} pairs)</option>)}
    </select>
    {selectedProduct && <div className="rounded border border-slate-200 bg-slate-50 p-3 text-sm"><div className="flex justify-between"><span>Selling price</span><strong>{Number(selectedProduct.selling_price).toFixed(2)}</strong></div><div className="mt-1 flex justify-between text-slate-600"><span>Total for {quantity} pair{Number(quantity) === 1 ? '' : 's'}</span><strong>{(Number(selectedProduct.selling_price) * Number(quantity || 0)).toFixed(2)}</strong></div></div>}
    <input className="w-full rounded border p-2" required type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
    <select className="w-full rounded border p-2" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}><option value="CASH">Cash</option><option value="BANK_TRANSFER">Bank Transfer</option></select>
    <div className="flex justify-end"><Button disabled={!products.length}>Record sale</Button></div>{message && <p className="text-sm text-red-600">{message}</p>}
  </form>{successMessage && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-labelledby="sale-success-title"><div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-xl"><h2 id="sale-success-title" className="text-lg font-semibold text-emerald-700">Sale successful</h2><p className="mt-2 text-slate-700">{successMessage}</p><button className="mt-5 rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700" type="button" onClick={() => setSuccessMessage('')}>Close</button></div></div>}{errorMessage && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-labelledby="sale-error-title"><div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-xl"><h2 id="sale-error-title" className="text-lg font-semibold text-red-700">Sale not recorded</h2><p className="mt-2 text-slate-700">{errorMessage}</p><button className="mt-5 rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700" type="button" onClick={() => setErrorMessage('')}>Close</button></div></div>}</main>;
}
