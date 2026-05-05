import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Heart, ExternalLink } from 'lucide-react';
import { Link } from 'wouter';
import { toast } from 'sonner';
import { StarRating } from './StarRating';
import { mediaUrl } from '../lib/api';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

interface Product {
  id: number; name: string; price: number; description?: string; imageUrl?: string;
  categoryName?: string; averageRating?: number; reviewCount?: number; inStock?: boolean;
}

interface Props {
  productId: number | null;
  onClose: () => void;
}

export function QuickViewModal({ productId, onClose }: Props) {
  const { isAuthenticated } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const { bumpCart } = useCart();
  const [p, setP] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setP(null);
    api.get(`/api/Products/${productId}`)
      .then(r => setP(r.data))
      .catch(() => toast.error('Could not load product'))
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const addToCart = async () => {
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    if (!p) return;
    setAdding(true);
    try {
      await api.post('/api/Cart', { productId: p.id, quantity: qty });
      bumpCart(qty);
      toast.success(`${p.name} added to cart!`);
      onClose();
    } catch { toast.error('Could not add to cart'); }
    finally { setAdding(false); }
  };

  const handleWishlist = () => {
    if (!p) return;
    toggle(p.id);
    toast(isWishlisted(p.id) ? 'Removed from wishlist' : 'Saved to wishlist', { icon: isWishlisted(p.id) ? '💔' : '❤️' });
  };

  const fmt = (n: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n);

  return (
    <AnimatePresence>
      {productId && (
        <>
          {/* Backdrop */}
          <motion.div
            className="qv-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Modal */}
          <motion.div
            className="qv-modal"
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <button type="button" className="qv-close" onClick={onClose} aria-label="Close">
              <X size={16} />
            </button>

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320 }}>
                <div className="spinner" />
              </div>
            )}

            {p && (
              <div className="qv-body">
                {/* Image */}
                <div className="qv-img">
                  <img src={mediaUrl(p.imageUrl)} alt={p.name} />
                  {!p.inStock && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(7,6,10,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--aura-rose)' }}>
                      Out of stock
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="qv-info">
                  <p className="eyebrow">{p.categoryName}</p>
                  <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.35rem', fontWeight: 700, margin: '0.25rem 0 0.5rem', lineHeight: 1.3 }}>{p.name}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <StarRating rating={p.averageRating ?? 0} size={14} />
                    <span style={{ fontSize: '0.8rem', color: 'hsl(256 22% 55%)' }}>({p.reviewCount ?? 0} reviews)</span>
                  </div>
                  <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--aura-violet)', margin: '0 0 0.75rem' }}>{fmt(p.price)}</p>
                  {p.description && <p style={{ fontSize: '0.84rem', color: 'hsl(256 22% 62%)', lineHeight: 1.65, margin: '0 0 1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <input className="input input--sm" type="number" min={1} max={99} value={qty} onChange={e => setQty(Math.max(1, Number(e.target.value) || 1))} style={{ width: 64, textAlign: 'center' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <motion.button type="button" className="btn btn--primary" style={{ flex: 1 }} onClick={addToCart} disabled={adding || !p.inStock} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <ShoppingCart size={14} /> {adding ? 'Adding…' : p.inStock ? 'Add to cart' : 'Out of stock'}
                    </motion.button>
                    <motion.button type="button" onClick={handleWishlist} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isWishlisted(p.id) ? 'rgba(251,113,133,0.15)' : 'hsl(258 26% 18%)', border: `1px solid ${isWishlisted(p.id) ? 'rgba(251,113,133,0.4)' : 'hsl(258 26% 26%)'}`, borderRadius: 'var(--radius)', cursor: 'pointer' }} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                      <Heart size={15} fill={isWishlisted(p.id) ? '#fb7185' : 'none'} color={isWishlisted(p.id) ? '#fb7185' : 'hsl(256 22% 60%)'} />
                    </motion.button>
                  </div>

                  <Link to={`/shop/${p.id}`} onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.75rem', fontSize: '0.8rem', color: 'hsl(256 22% 55%)', textDecoration: 'none' }}>
                    <ExternalLink size={12} /> View full details
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
