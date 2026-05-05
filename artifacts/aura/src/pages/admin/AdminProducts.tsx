import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Package } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';
import { mediaUrl } from '../../lib/api';

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  categoryName?: string;
  inStock?: boolean;
  stockQuantity?: number;
  averageRating?: number;
}

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (p = page, q = search) => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/Admin/products', { params: { page: p, pageSize: 15, search: q || undefined } });
      setProducts(data.items ?? data ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  const toggleStock = async (id: number, current: boolean) => {
    try {
      await api.patch(`/api/Admin/products/${id}/stock`, { inStock: !current });
      toast.success('Stock status updated');
      load();
    } catch {
      toast.error('Could not update stock');
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/api/Admin/products/${id}`);
      toast.success('Product deleted');
      load();
    } catch {
      toast.error('Could not delete product');
    }
  };

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 className="admin-page__title" style={{ margin: 0 }}>Products</h1>
        <button type="button" className="btn btn--primary btn--sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Plus size={14} /> Add product
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'hsl(256 22% 45%)' }} />
          <input
            className="input"
            style={{ paddingLeft: '2.1rem' }}
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load(1, search)}
          />
        </div>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => load(1, search)}>Search</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 'var(--radius)' }} />)}
        </div>
      ) : (
        <div className="admin-chart-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <img src={mediaUrl(p.imageUrl)} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', background: 'hsl(258 30% 10%)' }} />
                      <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'hsl(256 22% 60%)', fontSize: '0.82rem' }}>{p.categoryName ?? '—'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--aura-sky)' }}>{fmt(p.price)}</td>
                  <td>
                    <span className={`status-badge ${p.inStock ? 'status-badge--delivered' : 'status-badge--cancelled'}`}>
                      {p.inStock ? `In stock${p.stockQuantity != null ? ` (${p.stockQuantity})` : ''}` : 'Out of stock'}
                    </span>
                  </td>
                  <td style={{ color: 'hsl(256 22% 65%)', fontSize: '0.82rem' }}>{p.averageRating?.toFixed(1) ?? '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => toggleStock(p.id, !!p.inStock)}>
                        {p.inStock ? 'Mark OOS' : 'Mark In Stock'}
                      </button>
                      <button type="button" className="btn btn--ghost btn--sm" style={{ color: 'var(--aura-rose)', borderColor: 'rgba(251,113,133,0.3)' }} onClick={() => deleteProduct(p.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'hsl(256 22% 50%)' }}>
                  <Package size={32} style={{ margin: '0 auto 0.5rem', display: 'block', opacity: 0.4 }} />
                  No products found
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.25rem' }}>
          <button type="button" className="btn btn--ghost btn--sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span style={{ fontSize: '0.82rem', color: 'hsl(256 22% 55%)', alignSelf: 'center' }}>Page {page} of {totalPages}</span>
          <button type="button" className="btn btn--ghost btn--sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
