import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CreditCard, ClipboardList, CheckCircle, ChevronRight, ChevronLeft, Truck, Banknote, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { mediaUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Redirect } from 'wouter';
import { Spinner } from '../components/Spinner';
import api from '../lib/api';

interface CartItem { id: number; productId: number; productName: string; imageUrl?: string; unitPrice: number; quantity: number; lineTotal?: number; variationLabel?: string; }

interface Address {
  fullName: string; phone: string; street: string; city: string; state: string; country: string; zip: string;
}

const STEPS = [
  { id: 1, label: 'Shipping', icon: MapPin },
  { id: 2, label: 'Payment', icon: CreditCard },
  { id: 3, label: 'Review', icon: ClipboardList },
];

const COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Egypt', 'Saudi Arabia', 'UAE', 'Other'];

export function Checkout() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  const [address, setAddress] = useState<Address>({
    fullName: '', phone: '', street: '', city: '', state: '', country: 'United States', zip: '',
  });
  const [payMethod, setPayMethod] = useState<'card' | 'cod'>('card');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [couponCode] = useState<string | null>(null);

  if (!isAuthenticated) return <Redirect to="/login" />;

  useEffect(() => {
    api.get('/api/Cart')
      .then(r => setItems(Array.isArray(r.data) ? r.data : (r.data?.items ?? [])))
      .catch(() => toast.error('Could not load cart'))
      .finally(() => setLoading(false));
  }, []);

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + shipping;
  const fmt = (n: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n);

  const validateAddress = () => {
    if (!address.fullName.trim()) { toast.error('Full name is required'); return false; }
    if (!address.phone.trim()) { toast.error('Phone number is required'); return false; }
    if (!address.street.trim()) { toast.error('Street address is required'); return false; }
    if (!address.city.trim()) { toast.error('City is required'); return false; }
    if (!address.zip.trim()) { toast.error('ZIP / postal code is required'); return false; }
    return true;
  };

  const validateCard = () => {
    if (payMethod === 'cod') return true;
    if (card.number.replace(/\s/g, '').length < 13) { toast.error('Invalid card number'); return false; }
    if (!card.expiry.match(/^\d{2}\/\d{2}$/)) { toast.error('Invalid expiry (MM/YY)'); return false; }
    if (card.cvv.length < 3) { toast.error('Invalid CVV'); return false; }
    if (!card.name.trim()) { toast.error('Cardholder name is required'); return false; }
    return true;
  };

  const next = () => {
    if (step === 1 && !validateAddress()) return;
    if (step === 2 && !validateCard()) return;
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const { data } = await api.post('/api/Orders/checkout', { couponCode });
      navigate(`/orders`);
      toast.success(`🎉 Order #${data?.id ?? ''} placed! Check your orders.`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Checkout failed');
    } finally { setPlacing(false); }
  };

  const formatCard = (val: string) => val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (val: string) => {
    const d = val.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  if (loading) return <Spinner />;

  return (
    <div className="page-pad">
      <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '2rem', fontWeight: 700, margin: '0 0 2rem' }}>Checkout</h1>

      {/* Steps indicator */}
      <div className="checkout-steps">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const done = step > s.id;
          const active = step === s.id;
          return (
            <div key={s.id} className="checkout-step-wrap">
              <button
                type="button"
                className={`checkout-step ${active ? 'checkout-step--active' : ''} ${done ? 'checkout-step--done' : ''}`}
                onClick={() => done && setStep(s.id)}
                style={{ cursor: done ? 'pointer' : 'default' }}
              >
                <div className="checkout-step__circle">
                  {done ? <CheckCircle size={16} /> : <Icon size={16} />}
                </div>
                <span className="checkout-step__label">{s.label}</span>
              </button>
              {idx < STEPS.length - 1 && <div className={`checkout-step__line ${step > s.id ? 'checkout-step__line--done' : ''}`} />}
            </div>
          );
        })}
      </div>

      <div className="checkout-layout">
        {/* Left: step content */}
        <div className="checkout-main">
          <AnimatePresence mode="wait">
            {/* Step 1: Address */}
            {step === 1 && (
              <motion.div key="address" className="checkout-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="checkout-card__head">
                  <MapPin size={18} color="var(--aura-violet)" />
                  <h2>Shipping Address</h2>
                </div>
                <div className="checkout-form-grid">
                  <div className="field" style={{ gridColumn: '1 / -1' }}>
                    <label className="field__label">Full name</label>
                    <input className="input" value={address.fullName} onChange={e => setAddress(a => ({ ...a, fullName: e.target.value }))} placeholder="Jane Doe" />
                  </div>
                  <div className="field">
                    <label className="field__label">Phone</label>
                    <input className="input" value={address.phone} onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))} placeholder="+1 555 000 0000" type="tel" />
                  </div>
                  <div className="field">
                    <label className="field__label">Country</label>
                    <select className="input" value={address.country} onChange={e => setAddress(a => ({ ...a, country: e.target.value }))}>
                      {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="field" style={{ gridColumn: '1 / -1' }}>
                    <label className="field__label">Street address</label>
                    <input className="input" value={address.street} onChange={e => setAddress(a => ({ ...a, street: e.target.value }))} placeholder="123 Main St, Apt 4B" />
                  </div>
                  <div className="field">
                    <label className="field__label">City</label>
                    <input className="input" value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} placeholder="New York" />
                  </div>
                  <div className="field">
                    <label className="field__label">State / Province</label>
                    <input className="input" value={address.state} onChange={e => setAddress(a => ({ ...a, state: e.target.value }))} placeholder="NY" />
                  </div>
                  <div className="field">
                    <label className="field__label">ZIP / Postal code</label>
                    <input className="input" value={address.zip} onChange={e => setAddress(a => ({ ...a, zip: e.target.value }))} placeholder="10001" />
                  </div>
                </div>

                <div className="checkout-shipping-opts">
                  <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'hsl(256 22% 55%)', margin: '0 0 0.6rem' }}>Shipping method</p>
                  {[
                    { id: 'std', label: 'Standard Shipping', sub: '5–7 business days', price: shipping === 0 ? 'FREE' : fmt(5.99), icon: Truck },
                    { id: 'exp', label: 'Express Shipping', sub: '1–3 business days', price: fmt(14.99), icon: Truck },
                  ].map(opt => (
                    <label key={opt.id} className={`shipping-opt ${opt.id === 'std' ? 'shipping-opt--active' : ''}`} style={{ cursor: 'pointer' }}>
                      <input type="radio" name="shipping" value={opt.id} defaultChecked={opt.id === 'std'} style={{ accentColor: 'var(--aura-violet)' }} />
                      <opt.icon size={16} color="var(--aura-violet)" />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem' }}>{opt.label}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'hsl(256 22% 55%)' }}>{opt.sub}</p>
                      </div>
                      <span style={{ fontWeight: 700, color: opt.price === 'FREE' ? '#34d399' : 'hsl(252 100% 97%)' }}>{opt.price}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <motion.div key="payment" className="checkout-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="checkout-card__head">
                  <CreditCard size={18} color="var(--aura-violet)" />
                  <h2>Payment Method</h2>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {[
                    { id: 'card' as const, label: 'Credit / Debit Card', icon: CreditCard },
                    { id: 'cod' as const, label: 'Cash on Delivery', icon: Banknote },
                  ].map(m => (
                    <button key={m.id} type="button"
                      className={`pay-method-btn ${payMethod === m.id ? 'pay-method-btn--active' : ''}`}
                      onClick={() => setPayMethod(m.id)}
                    >
                      <m.icon size={18} />
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>

                {payMethod === 'card' && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="checkout-form-grid">
                    {/* Card preview */}
                    <div className="card-preview" style={{ gridColumn: '1 / -1' }}>
                      <div className="card-preview__chip" />
                      <p className="card-preview__number">{card.number || '•••• •••• •••• ••••'}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                          <p style={{ fontSize: '0.6rem', opacity: 0.7, margin: '0 0 0.15rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Cardholder</p>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem' }}>{card.name || 'YOUR NAME'}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '0.6rem', opacity: 0.7, margin: '0 0 0.15rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Expires</p>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem' }}>{card.expiry || 'MM/YY'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="field" style={{ gridColumn: '1 / -1' }}>
                      <label className="field__label">Card number</label>
                      <input className="input" placeholder="1234 5678 9012 3456" maxLength={19} value={card.number} onChange={e => setCard(c => ({ ...c, number: formatCard(e.target.value) }))} />
                    </div>
                    <div className="field" style={{ gridColumn: '1 / -1' }}>
                      <label className="field__label">Cardholder name</label>
                      <input className="input" placeholder="Jane Doe" value={card.name} onChange={e => setCard(c => ({ ...c, name: e.target.value }))} />
                    </div>
                    <div className="field">
                      <label className="field__label">Expiry (MM/YY)</label>
                      <input className="input" placeholder="12/27" maxLength={5} value={card.expiry} onChange={e => setCard(c => ({ ...c, expiry: formatExpiry(e.target.value) }))} />
                    </div>
                    <div className="field">
                      <label className="field__label">CVV</label>
                      <input className="input" placeholder="•••" maxLength={4} type="password" value={card.cvv} onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))} />
                    </div>
                    <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'hsl(256 22% 50%)', fontSize: '0.75rem' }}>
                      <Lock size={12} /> SSL encrypted — your card data is never stored
                    </div>
                  </motion.div>
                )}

                {payMethod === 'cod' && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '1.25rem', background: 'hsl(258 30% 14%)', border: '1px solid hsl(258 26% 22%)', borderRadius: 'var(--radius)', fontSize: '0.88rem', color: 'hsl(256 22% 65%)', lineHeight: 1.6 }}>
                    <p style={{ margin: '0 0 0.4rem', fontWeight: 700, color: 'hsl(252 100% 97%)' }}>Pay when your order arrives</p>
                    <p style={{ margin: 0 }}>Have the exact amount ready. Available for domestic orders only. Delivery in 3–7 business days.</p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <motion.div key="review" className="checkout-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="checkout-card__head">
                  <ClipboardList size={18} color="var(--aura-violet)" />
                  <h2>Review Your Order</h2>
                </div>

                {/* Address summary */}
                <div className="review-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <p className="review-section__title"><MapPin size={13} /> Shipping to</p>
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => setStep(1)} style={{ fontSize: '0.72rem' }}>Edit</button>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'hsl(256 22% 75%)' }}>
                    {address.fullName} · {address.phone}<br />
                    {address.street}, {address.city} {address.zip}, {address.country}
                  </p>
                </div>

                {/* Payment summary */}
                <div className="review-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <p className="review-section__title"><CreditCard size={13} /> Payment</p>
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => setStep(2)} style={{ fontSize: '0.72rem' }}>Edit</button>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'hsl(256 22% 75%)' }}>
                    {payMethod === 'card' ? `•••• •••• •••• ${card.number.slice(-4) || '****'}` : 'Cash on Delivery'}
                  </p>
                </div>

                {/* Items */}
                <div className="review-section">
                  <p className="review-section__title" style={{ marginBottom: '0.75rem' }}>Order items ({items.length})</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {items.map(i => (
                      <div key={i.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <img src={mediaUrl(i.imageUrl)} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', background: 'hsl(258 30% 14%)' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.productName}</p>
                          {i.variationLabel && <p style={{ margin: 0, fontSize: '0.73rem', color: 'hsl(256 22% 52%)' }}>{i.variationLabel}</p>}
                        </div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>×{i.quantity} · {fmt(i.unitPrice * i.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem' }}>
            {step > 1
              ? <motion.button type="button" className="btn btn--ghost" onClick={() => setStep(s => s - 1)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <ChevronLeft size={15} /> Back
                </motion.button>
              : <span />}
            {step < 3
              ? <motion.button type="button" className="btn btn--primary" onClick={next} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  Continue <ChevronRight size={15} />
                </motion.button>
              : <motion.button type="button" className="btn btn--primary" onClick={placeOrder} disabled={placing || items.length === 0} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ gap: '0.5rem' }}>
                  {placing ? 'Placing order…' : <><Lock size={14} /> Place Order · {fmt(total)}</>}
                </motion.button>}
          </div>
        </div>

        {/* Right: order summary */}
        <div className="checkout-summary">
          <div className="checkout-card">
            <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700, margin: '0 0 1rem', fontSize: '1.05rem' }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
              {items.map(i => (
                <div key={i.id} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <img src={mediaUrl(i.imageUrl)} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', background: 'hsl(258 30% 14%)', flexShrink: 0 }} />
                  <p style={{ flex: 1, margin: 0, fontSize: '0.8rem', color: 'hsl(256 22% 72%)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.productName}</p>
                  <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{fmt(i.unitPrice * i.quantity)}</p>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid hsl(258 26% 18%)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: 'hsl(256 22% 60%)' }}>
                <span>Subtotal</span><span>{fmt(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: shipping === 0 ? '#34d399' : 'hsl(256 22% 60%)' }}>
                <span>Shipping</span><span>{shipping === 0 ? 'FREE' : fmt(shipping)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem', borderTop: '1px solid hsl(258 26% 18%)', paddingTop: '0.6rem', marginTop: '0.2rem' }}>
                <span>Total</span><span style={{ color: 'var(--aura-violet)' }}>{fmt(total)}</span>
              </div>
            </div>
            {shipping === 0 && (
              <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 'calc(var(--radius) - 4px)', fontSize: '0.75rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Truck size={12} /> You qualify for free shipping!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
