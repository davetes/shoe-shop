'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';

export default function CashierInventoryPage() {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  function loadProducts() {
    api.get('/inventory')
      .then(({ data }) => {
        setProducts(data);
        if (data.length && !productId) setProductId(String(data[0].product_id));
      })
      .catch((error) => setMessage(error.response?.data?.error || 'Unable to load inventory'));
  }

  useEffect(() => { loadProducts(); }, []);

  async function submit(event) {
    event.preventDefault();
    try {
      await api.post('/inventory', {
        productId: Number(productId),
        quantity: Number(quantity),
        notes: notes || undefined
      });
      setQuantity(1);
      setNotes('');
      setMessage('Inventory added to your assigned store.');
      loadProducts();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Unable to add inventory');
    }
  }

  return <main className="mx-auto max-w-xl">
    <Card title="Add inventory">
      <p className="mb-4 text-sm text-slate-600">Add arriving stock to your assigned store.</p>
      <form onSubmit={submit} className="space-y-4">
        <select className="w-full rounded border p-2" required value={productId} onChange={(event) => setProductId(event.target.value)}>
          {products.map((product) => <option key={product.product_id} value={product.product_id}>{product.name} - size {product.size} - {product.color} ({product.quantity} pairs)</option>)}
        </select>
        <input className="w-full rounded border p-2" required min="1" type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
        <textarea className="w-full rounded border p-2" placeholder="Notes (optional)" value={notes} onChange={(event) => setNotes(event.target.value)} />
        <Button disabled={!products.length}>Add inventory</Button>
        {message && <p className="text-sm">{message}</p>}
      </form>
    </Card>
  </main>;
}
