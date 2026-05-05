import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

interface Order {
  id: number;
  userEmail?: string;
  status: string;
  totalAmount: number;
  createdAtUtc: string;
  couponCode?: string;
}

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);

  const load = async (p = page) => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/Admin/orders', { params: { page: p, pageSize: 15, status: statusFilter || undefined } });
      setOrders(data.items ?? data ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, statusFilter]);

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      await api.patch(`/api/Admin/orders/${id}/status`, { status });
      toast.success(`Order #${id} → ${status}`);
      load();
    } catch {
      toast.error('Could not update status');
    } finally {
      setUpdating(null);
    }
  };

  const fmt = (n: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n);

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 className="admin-page__title" style={{ margin: 0 }}>Orders</h1>
        <select className="input" style={{ width: 'auto' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 'var(--radius)' }} />)}
        </div>
      ) : (
        <div className="admin-chart-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                  <td style={{ fontWeight: 700, color: 'var(--aura-sky)' }}>#{o.id}</td>
                  <td style={{ fontSize: '0.82rem', color: 'hsl(256 22% 65%)' }}>{o.userEmail ?? '—'}</td>
                  <td style={{ fontSize: '0.78rem', color: 'hsl(256 22% 55%)' }}>{new Date(o.createdAtUtc).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 700 }}>{fmt(o.totalAmount)}</td>
                  <td>
                    <span className={`status-badge status-badge--${o.status.toLowerCase()}`}>{o.status}</span>
                    {o.couponCode && <span style={{ marginLeft: '0.4rem', fontSize: '0.68rem', color: '#34d399' }}>🏷️ {o.couponCode}</span>}
                  </td>
                  <td>
                    <select
                      className="input input--sm"
                      style={{ width: 'auto', fontSize: '0.78rem' }}
                      value={o.status}
                      disabled={updating === o.id}
                      onChange={e => updateStatus(o.id, e.target.value)}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </motion.tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'hsl(256 22% 50%)' }}>
                  <ShoppingBag size={32} style={{ margin: '0 auto 0.5rem', display: 'block', opacity: 0.4 }} />
                  No orders found
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
