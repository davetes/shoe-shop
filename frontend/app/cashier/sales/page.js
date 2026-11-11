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
      setMessage('Sale recorded and stock deducted.');
    } catch (error) { setMessage(error.response?.data?.error || 'Unable to record sale'); }
  }
  return <main className="mx-auto max-w-xl"><h1 className="mb-6 text-3xl font-bold">Register Sale</h1><form onSubmit={submit} className="space-y-4 rounded-xl bg-white p-6 shadow">
    <select className="w-full rounded border p-2" required value={productId} onChange={(e) => setProductId(e.target.value)}>
      {products.map((product) => <option key={product.product_id} value={product.product_id}>{product.name} - size {product.size} - {product.color} ({product.quantity} pairs)</option>)}
    </select>
    <input className="w-full rounded border p-2" required type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
    <select className="w-full rounded border p-2" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}><option value="CASH">Cash</option><option value="BANK_TRANSFER">Bank Transfer</option></select>
    <Button disabled={!products.length}>Record sale</Button>{message && <p className="text-sm">{message}</p>}
  </form></main>;
}
