'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

export default function OwnerImportPage() {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [productId, setProductId] = useState('');
  const [storeId, setStoreId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([api.get('/products'), api.get('/stores')]).then(([productsResponse, storesResponse]) => {
      setProducts(productsResponse.data);
      setStores(storesResponse.data);
      if (productsResponse.data.length) setProductId(String(productsResponse.data[0].id));
      if (storesResponse.data.length) setStoreId(String(storesResponse.data[0].id));
    }).catch((error) => setMessage(error.response?.data?.error || 'Unable to load options'));
  }, []);

  async function submit(event) {
    event.preventDefault();
    try {
      await api.post('/inventory', { productId: Number(productId), storeId: Number(storeId), quantity: Number(quantity), notes: 'Owner stock import' });
      setMessage('Stock added successfully.');
    } catch (error) { setMessage(error.response?.data?.error || 'Unable to add stock'); }
  }

  return <main className="mx-auto max-w-xl"><Card title="Add stock to a store"><form onSubmit={submit} className="space-y-4">
    <select className="w-full rounded border p-2" required value={productId} onChange={(e) => setProductId(e.target.value)}>{products.map((product) => <option key={product.id} value={product.id}>{product.name} - size {product.size} - {product.color}</option>)}</select>
    <select className="w-full rounded border p-2" required value={storeId} onChange={(e) => setStoreId(e.target.value)}>{stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}</select>
    <input className="w-full rounded border p-2" required min="1" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
    <Button disabled={!products.length || !stores.length}>Add stock</Button>
    {message && <p className="text-sm">{message}</p>}
  </form></Card></main>;
}
