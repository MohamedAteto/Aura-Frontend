import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ShoppingBag, Tag, Trash2, Heart, ChevronRight, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { mediaUrl } from '../lib/api';
import api from '../lib/api';

interface CartItem {
  id: number; productId: number; productName: string; imageUrl?: string;
  unitPrice: number; quantity: number; lineTotal?: number; variationLabel?: string;
}

export function Cart() {
  const { isAuthenticated } = useAuth();
  const { refreshCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const [, navigate] = useLocation();
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
    try { await api.put(`/api/Cart/${id}`, { quantity }); load(); refreshCart(); }
    catch { toast.error('Could not update quantity'); }
  };

  const remove = async (id: number) => {
    try {
      await api.delete(`/api/Cart/${id}`);
      setItems(prev => prev.filter(i => i.id !== id));
      refreshCart();
      toast.success('Item removed');
    }
    catch { toast.error('Could not remove item'); }
  };

  const saveForLater = async (item: CartItem) => {
    toggle(item.productId);
    await remove(item.id);
    toast.success('Saved to wishlist');
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

  if (!isAuthenticated) return (
    <div className="page-pad">
      <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '2rem', fontWeight: 700 }}>Cart</h1>
      <p>Please <Link to="/login">log in</Link> to view your saved cart.</p>
    </div>
  );
  if (loading) return <Spinner />;

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const discount = couponApplied?.discountAmount ?? 0;
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal - discount + shipping;
  const fmt = (n: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n);
  const freeShippingLeft = Math.max(0, 50 - subtotal);

  return (
    <div className="page-pad">
      <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '2rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
        Your cart {items.length > 0 && <span style={{ fontSize: '1rem', fontWeight: 400, color: 'hsl(256 22% 55%)', fontFamily: 'DM Sans, sans-serif' }}>({items.length} item{items.length !== 1 ? 's' : ''})</span>}
      </h1>

      {/* Free shipping progress */}
      {items.length > 0 && (
        <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'hsl(258 30% 12%)', border: '1px solid hsl(258 26% 20%)', borderRadius: 'var(--radius)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: freeShippingLeft === 0 ? '#34d399' : 'hsl(256 22% 60%)', marginBottom: '0.4rem' }}>
            <Truck size={13} />
            {freeShippingLeft === 0
              ? 'You qualify for FREE shipping!'
              : <>Add <strong style={{ color: 'hsl(252 100% 97%)' }}>{fmt(freeShippingLeft)}</strong> more for free shipping</>}
          </div>
          <div style={{ height: 4, background: 'hsl(258 26% 20%)', borderRadius: 999, overflow: 'hidden' }}>
            <motion.div style={{ height: '100%', background: freeShippingLeft === 0 ? '#34d399' : 'var(--aura-violet)', borderRadius: 999 }} initial={{ width: 0 }} animate={{ width: `${Math.min(100, (subtotal / 50) * 100)}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} />
          </div>
        </div>
      )}

      {items.length === 0
        ? <EmptyState icon={ShoppingBag} message="Your cart is empty." ctaLabel="Continue shopping" ctaTo="/shop" />
        : (
          <div className="cart-layout">
            <div>
              <AnimatePresence>
                <ul className="cart-list">
                  {items.map(i => (
                    <motion.li key={i.id} className="cart-line" layout exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }} transition={{ duration: 0.22 }}>
                      <Link to={`/shop/${i.productId}`}>
                        <img src={mediaUrl(i.imageUrl)} alt="" className="cart-line__img" style={{ cursor: 'pointer' }} />
                      </Link>
                      <div className="cart-line__info">
                        <Link to={`/shop/${i.productId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <p className="cart-line__name">{i.productName}</p>
                        </Link>
                        {i.variationLabel && <p className="cart-line__variant">{i.variationLabel}</p>}
                        <p className="cart-line__meta">{fmt(i.unitPrice)} each</p>
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                          <button type="button" className="btn btn--ghost btn--sm" onClick={() => saveForLater(i)} style={{ fontSize: '0.73rem', gap: '0.3rem', padding: '0.25rem 0.6rem' }}>
                            <Heart size={11} /> Save for later
                          </button>
                          <button type="button" className="btn btn--ghost btn--sm" onClick={() => remove(i.id)} style={{ fontSize: '0.73rem', gap: '0.3rem', padding: '0.25rem 0.6rem', color: 'var(--aura-rose)', borderColor: 'rgba(251,113,133,0.25)' }}>
                            <Trash2 size={11} /> Remove
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid hsl(258 26% 24%)', borderRadius: 'var(--radius)', overflow: 'hidden', flexShrink: 0 }}>
                        <button type="button" onClick={() => i.quantity > 1 ? update(i.id, i.quantity - 1) : remove(i.id)} style={{ width: 30, height: 32, background: 'hsl(258 30% 14%)', border: 'none', cursor: 'pointer', color: 'hsl(252 100% 97%)', fontSize: '1rem' }}>−</button>
                        <span style={{ padding: '0 0.6rem', fontSize: '0.88rem', fontWeight: 600 }}>{i.quantity}</span>
                        <button type="button" onClick={() => update(i.id, i.quantity + 1)} style={{ width: 30, height: 32, background: 'hsl(258 30% 14%)', border: 'none', cursor: 'pointer', color: 'hsl(252 100% 97%)', fontSize: '1rem' }}>+</button>
                      </div>
                      <p className="cart-line__sum">{fmt(i.lineTotal ?? i.unitPrice * i.quantity)}</p>
                    </motion.li>
                  ))}
                </ul>
              </AnimatePresence>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <Link to="/shop" className="btn btn--ghost btn--sm">← Continue shopping</Link>
              </div>
            </div>

            {/* Summary */}
            <div className="cart-summary">
              <div className="cart-coupon">
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'hsl(256 22% 65%)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem' }}>Coupon code</p>
                <div className="cart-coupon__row">
                  <Tag size={13} color="hsl(256 22% 55%)" />
                  <input className="input" placeholder="Enter code…" value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} style={{ flex: 1 }} onKeyDown={e => e.key === 'Enter' && applyCoupon()} />
                  <button type="button" className="btn btn--ghost btn--sm" onClick={applyCoupon} disabled={applyingCoupon}>
                    {applyingCoupon ? '…' : 'Apply'}
                  </button>
                </div>
                {couponErr && <p style={{ color: 'var(--aura-rose)', fontSize: '0.78rem', margin: '0.3rem 0 0' }}>{couponErr}</p>}
                {couponApplied && <p style={{ color: '#34d399', fontSize: '0.78rem', margin: '0.3rem 0 0' }}>✓ {couponApplied.couponCode} — saving {fmt(couponApplied.discountAmount)}</p>}
              </div>

              <div className="cart-totals">
                <div className="cart-totals__row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                {discount > 0 && <div className="cart-totals__row cart-totals__row--discount"><span>Discount</span><span>−{fmt(discount)}</span></div>}
                <div className="cart-totals__row">
                  <span>Shipping</span>
                  <span style={{ color: shipping === 0 ? '#34d399' : 'inherit' }}>{shipping === 0 ? 'FREE' : fmt(shipping)}</span>
                </div>
                <div className="cart-totals__row cart-totals__row--total"><span>Total</span><span>{fmt(total)}</span></div>
              </div>

              <motion.button
                type="button"
                className="btn btn--primary btn--block"
                onClick={() => navigate('/checkout')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ gap: '0.5rem' }}
              >
                Proceed to Checkout <ChevronRight size={15} />
              </motion.button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.75rem', fontSize: '0.73rem', color: 'hsl(256 22% 44%)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Secure SSL encrypted checkout
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
