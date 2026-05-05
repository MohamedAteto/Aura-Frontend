import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { StatusStepper } from '../components/StatusStepper';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

interface OrderItem { productId: number; productName: string; quantity: number; unitPrice: number; }
interface Order {
  id: number;
  status: string;
  totalAmount: number;
  createdAtUtc: string;
  couponCode?: string;
  discountAmount?: number;
  items?: OrderItem[];
}

export function Orders() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const load = async (p = page) => {
    try {
      const { data } = await api.get('/api/Orders/my', { params: { page: p, pageSize: 10 } });
      setOrders(data.items ?? data ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to load orders');
    }
  };

  useEffect(() => { if (isAuthenticated) load(); }, [isAuthenticated, page]);

  if (!isAuthenticated) return (
    <div className="page-pad">
      <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '2rem', fontWeight: 700 }}>Orders</h1>
      <p><Link to="/login">Log in</Link> to see your order history.</p>
    </div>
  );
  if (orders == null) return <Spinner />;

  const fmt = (n: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n);
  const toggle = (id: number) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const statusColor: Record<string, string> = {
    Pending: '#fbbf24', Processing: 'var(--aura-sky)', Shipped: 'var(--aura-violet)',
    Delivered: '#34d399', Cancelled: 'var(--aura-rose)',
  };

  return (
    <div className="page-pad">
      <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '2rem', fontWeight: 700, margin: '0 0 1.5rem' }}>Order history</h1>

      {orders.length === 0
        ? <EmptyState icon={ShoppingBag} message="You haven't placed any orders yet." ctaLabel="Start shopping" ctaTo="/shop" />
        : (
          <div className="order-list">
            {orders.map(o => (
              <motion.div key={o.id} className="order-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="order-card__head" onClick={() => toggle(o.id)} style={{ cursor: 'pointer' }}>
                  <div>
                    <p className="eyebrow">Order #{o.id}</p>
                    <p className="order-meta">{new Date(o.createdAtUtc).toLocaleString()}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className={`status-badge status-badge--${o.status.toLowerCase()}`} style={{ color: statusColor[o.status] }}>
                      {o.status}
                    </span>
                    <p className="order-total">{fmt(o.totalAmount)}</p>
                    {expanded[o.id] ? <ChevronUp size={15} color="hsl(256 22% 55%)" /> : <ChevronDown size={15} color="hsl(256 22% 55%)" />}
                  </div>
                </div>

                <StatusStepper status={o.status} />

                <AnimatePresence>
                  {expanded[o.id] && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                      <ul className="order-items">
                        {o.items?.map(it => (
                          <li key={`${o.id}-${it.productId}`} className="order-item">
                            <span style={{ flex: 1 }}>{it.productName}</span>
                            <span style={{ color: 'hsl(256 22% 55%)' }}>×{it.quantity}</span>
                            <span style={{ fontWeight: 600 }}>{fmt(it.unitPrice * it.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                      {o.couponCode && (
                        <p style={{ fontSize: '0.78rem', color: '#34d399', margin: '0 1.25rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span>🏷️</span>
                          Coupon <code style={{ background: 'rgba(52,211,153,0.1)', padding: '0 0.35rem', borderRadius: 4 }}>{o.couponCode}</code> — saved {fmt(o.discountAmount ?? 0)}
                        </p>
                      )}
                      {o.status === 'Pending' && <PayBlock orderId={o.id} onDone={() => load()} />}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

      {totalPages > 1 && (
        <div className="pagination">
          <button type="button" className="btn btn--ghost btn--sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span className="pagination__meta">Page {page} of {totalPages}</span>
          <button type="button" className="btn btn--ghost btn--sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}

function PayBlock({ orderId, onDone }: { orderId: number; onDone: () => void }) {
  return (
    <div className="pay-block">
      <p className="form-hint">Simulate card payment (demo only)</p>
      <div className="pay-row">
        <button type="button" className="btn btn--primary btn--sm" onClick={async () => {
          try { await api.post(`/api/Orders/${orderId}/pay`, { succeed: true }); toast.success('Payment succeeded!'); onDone(); }
          catch (e: any) { toast.error(e?.response?.data?.message || 'Payment failed'); }
        }}>Pay (success)</button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={async () => {
          try { await api.post(`/api/Orders/${orderId}/pay`, { succeed: false }); toast.error('Payment declined.'); onDone(); }
          catch (e: any) { toast.error(e?.response?.data?.message || 'Failed'); }
        }}>Pay (fail)</button>
      </div>
    </div>
  );
}
