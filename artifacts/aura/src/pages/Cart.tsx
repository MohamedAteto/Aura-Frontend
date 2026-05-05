import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { ShoppingBag, Tag, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import { mediaUrl } from '../lib/api';
import api from '../lib/api';

interface CartItem {
  id: number;
  productId: number;
  productName: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  lineTotal?: number;
  variationLabel?: string;
}

export function Cart() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState<{ couponCode: string; discountAmount: number } | null>(null);
  const [couponErr, setCouponErr] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/Cart');
      setItems(Array.isArray(data) ? data : (data?.items ?? []));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isAuthenticated) load(); else setLoading(false); }, [isAuthenticated]);

  const update = async (id: number, quantity: number) => {
    try { await api.put(`/api/Cart/${id}`, { quantity }); load(); }
    catch { toast.error('Could not update quantity'); }
  };
  const remove = async (id: number) => {
    try { await api.delete(`/api/Cart/${id}`); load(); toast.success('Item removed'); }
    catch { toast.error('Could not remove item'); }
  };

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setApplyingCoupon(true); setCouponErr(null);
    try {
      const { data } = await api.post('/api/Cart/apply-coupon', { code: coupon.trim() });
      setCouponApplied(data);
      toast.success(`Coupon applied! Saving $${data.discountAmount?.toFixed(2)}`);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Invalid coupon code';
      setCouponErr(msg); toast.error(msg);
    } finally { setApplyingCoupon(false); }
  };

  const checkout = async () => {
    try {
      const { data } = await api.post('/api/Orders/checkout', { couponCode: couponApplied?.couponCode ?? null });
      return data;
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Checkout failed');
      return null;
    }
  };

  if (!isAuthenticated) return (
    <div className="page-pad">
      <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '2rem', fontWeight: 700 }}>Cart</h1>
      <p>Please <Link to="/login">log in</Link> to view your saved cart.</p>
    </div>
  );
  if (loading) return <Spinner />;

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const discount = couponApplied?.discountAmount ?? 0;
  const total = subtotal - discount;
  const fmt = (n: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n);

  return (
    <div className="page-pad">
      <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '2rem', fontWeight: 700, margin: '0 0 1.5rem' }}>
        Your cart {items.length > 0 && <span style={{ fontSize: '1rem', fontWeight: 400, color: 'hsl(256 22% 55%)', fontFamily: 'DM Sans, sans-serif' }}>({items.length} item{items.length !== 1 ? 's' : ''})</span>}
      </h1>

      {items.length === 0
        ? <EmptyState icon={ShoppingBag} message="Your cart is empty." ctaLabel="Continue shopping" ctaTo="/shop" />
        : (
          <div className="cart-layout">
            <AnimatePresence>
              <ul className="cart-list">
                {items.map(i => (
                  <motion.li key={i.id} className="cart-line" layout exit={{ opacity: 0, x: -20, height: 0 }} transition={{ duration: 0.2 }}>
                    <img src={mediaUrl(i.imageUrl)} alt="" className="cart-line__img" />
                    <div className="cart-line__info">
                      <p className="cart-line__name">{i.productName}</p>
                      {i.variationLabel && <p className="cart-line__variant">{i.variationLabel}</p>}
                      <p className="cart-line__meta">{fmt(i.unitPrice)} each</p>
                    </div>
                    <input
                      className="input input--sm cart-line__qty"
                      type="number" min={1} max={999}
                      value={i.quantity}
                      onChange={e => update(i.id, Math.max(1, Number(e.target.value) || 1))}
                      style={{ width: 64, textAlign: 'center' }}
                    />
                    <p className="cart-line__sum">{fmt(i.lineTotal ?? i.unitPrice * i.quantity)}</p>
                    <button type="button" className="btn btn--ghost cart-line__remove" onClick={() => remove(i.id)} style={{ padding: '0.35rem', color: 'hsl(256 22% 45%)' }}>
                      <Trash2 size={14} />
                    </button>
                  </motion.li>
                ))}
              </ul>
            </AnimatePresence>

            <div className="cart-summary">
              <div className="cart-coupon">
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'hsl(256 22% 65%)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Coupon code</p>
                <div className="cart-coupon__row">
                  <Tag size={13} color="hsl(256 22% 55%)" />
                  <input className="input" placeholder="Enter code…" value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} style={{ flex: 1 }} onKeyDown={e => e.key === 'Enter' && applyCoupon()} />
                  <button type="button" className="btn btn--ghost btn--sm" onClick={applyCoupon} disabled={applyingCoupon}>
                    {applyingCoupon ? '…' : 'Apply'}
                  </button>
                </div>
                {couponErr && <p style={{ color: 'var(--aura-rose)', fontSize: '0.78rem', margin: 0 }}>{couponErr}</p>}
                {couponApplied && <p style={{ color: '#34d399', fontSize: '0.78rem', margin: 0 }}>✓ {couponApplied.couponCode} — saving {fmt(couponApplied.discountAmount)}</p>}
              </div>

              <div className="cart-totals">
                <div className="cart-totals__row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                {discount > 0 && <div className="cart-totals__row cart-totals__row--discount"><span>Discount</span><span>−{fmt(discount)}</span></div>}
                <div className="cart-totals__row cart-totals__row--total"><span>Total</span><span>{fmt(total)}</span></div>
              </div>

              <CheckoutButton onCheckout={checkout} />
            </div>
          </div>
        )}
    </div>
  );
}

function CheckoutButton({ onCheckout }: { onCheckout: () => Promise<any> }) {
  const [busy, setBusy] = useState(false);
  return (
    <motion.button
      type="button"
      className="btn btn--primary btn--block"
      disabled={busy}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={async () => {
        setBusy(true);
        const order = await onCheckout();
        if (order) toast.success(`Order #${order.id} placed! Check your orders to pay.`);
        setBusy(false);
      }}
    >
      {busy ? 'Processing…' : 'Checkout'}
    </motion.button>
  );
}
