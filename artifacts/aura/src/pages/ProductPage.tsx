import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, PackageSearch, Heart, ZoomIn, Star, Truck, RotateCcw, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { StarRating } from '../components/StarRating';
import { ReviewForm } from '../components/ReviewForm';
import { ProductCard } from '../components/ProductCard';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { RecentlyViewed, trackRecentlyViewed } from '../components/RecentlyViewed';
import { mediaUrl } from '../lib/api';
import api from '../lib/api';

interface Variation { id: number; size?: string; color?: string; priceDelta: number; stockQuantity: number; }
interface Product {
  id: number; name: string; price: number; description?: string; imageUrl?: string;
  categoryName?: string; averageRating?: number; reviewCount?: number; inStock?: boolean;
  variations?: Variation[];
}
interface Review { id: number; rating: number; comment?: string; userName?: string; createdAtUtc: string; }

const PERKS = [
  { icon: Truck, label: 'Free shipping over $50' },
  { icon: RotateCcw, label: '30-day returns' },
  { icon: Shield, label: 'Secure checkout' },
];

export function ProductPage({ id }: { id: string }) {
  const { isAuthenticated } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const { bumpCart } = useCart();
  const [p, setP] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const wishlisted = p ? isWishlisted(p.id) : false;

  const loadProduct = async () => {
    setLoading(true);
    try {
      const [prod, revs, rel] = await Promise.all([
        api.get(`/api/Products/${id}`),
        api.get(`/api/Products/${id}/reviews`).catch(() => ({ data: [] })),
        api.get(`/api/Products/${id}/related`, { params: { limit: 4 } }).catch(() => ({ data: [] })),
      ]);
      setP(prod.data);
      setReviews(Array.isArray(revs.data) ? revs.data : []);
      setRelated(Array.isArray(rel.data) ? rel.data : []);
    } catch { setP(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadProduct(); setSelectedVariation(null); setQty(1); }, [id]);

  useEffect(() => {
    if (p) trackRecentlyViewed(p.id);
  }, [p?.id]);

  const add = async () => {
    if (!isAuthenticated) { toast.error('Log in to add items to your cart.'); return; }
    setAdding(true);
    try {
      await api.post('/api/Cart', { productId: Number(id), quantity: qty, variationId: selectedVariation?.id ?? null });
      bumpCart(qty);
      setAdded(true);
      toast.success(`${p?.name} added to cart!`);
      setTimeout(() => setAdded(false), 2500);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Could not add to cart.');
    } finally { setAdding(false); }
  };

  const handleWishlist = () => {
    if (!p) return;
    toggle(p.id);
    toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!', { icon: wishlisted ? '💔' : '❤️' });
  };

  if (loading) return <Spinner />;
  if (!p) return <div className="page-pad"><EmptyState icon={PackageSearch} message="Product not found." ctaLabel="Back to shop" ctaTo="/shop" /></div>;

  const displayPrice = selectedVariation ? p.price + selectedVariation.priceDelta : p.price;
  const fmt = (n: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n);
  const sizes = [...new Set(p.variations?.map(v => v.size).filter(Boolean))];
  const colors = [...new Set(p.variations?.map(v => v.color).filter(Boolean))];

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => Math.round(r.rating) === star).length,
    pct: reviews.length ? Math.round(reviews.filter(r => Math.round(r.rating) === star).length / reviews.length * 100) : 0,
  }));

  return (
    <div className="page-pad">
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'hsl(256 22% 48%)', marginBottom: '1.25rem' }}>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <Link to="/shop" style={{ color: 'inherit', textDecoration: 'none' }}>Shop</Link>
        <span>/</span>
        {p.categoryName && <><Link to={`/shop?q=${p.categoryName}`} style={{ color: 'inherit', textDecoration: 'none' }}>{p.categoryName}</Link><span>/</span></>}
        <span style={{ color: 'hsl(252 100% 97%)' }}>{p.name}</span>
      </nav>

      <motion.div className="product-detail__grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        {/* Image with zoom */}
        <div>
          <div
            className={`product-detail__img ${zoomed ? 'product-detail__img--zoomed' : ''}`}
            onMouseEnter={() => setZoomed(true)}
            onMouseLeave={() => setZoomed(false)}
            title="Hover to zoom"
          >
            <img src={mediaUrl(p.imageUrl)} alt={p.name} style={{ transform: zoomed ? 'scale(1.12)' : 'scale(1)', transition: 'transform 0.4s ease' }} />
            {!p.inStock && <div className="product-detail__oos">Out of stock</div>}
            <div className="product-detail__zoom-hint">
              <ZoomIn size={14} /> Hover to zoom
            </div>
          </div>

          {/* Perks strip */}
          <div style={{ display: 'flex', gap: '0', marginTop: '1rem', border: '1px solid hsl(258 26% 20%)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            {PERKS.map((pk, i) => {
              const Icon = pk.icon;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', padding: '0.7rem 0.4rem', borderRight: i < PERKS.length - 1 ? '1px solid hsl(258 26% 20%)' : 'none', background: 'hsl(258 30% 12%)' }}>
                  <Icon size={15} color="var(--aura-violet)" />
                  <span style={{ fontSize: '0.68rem', color: 'hsl(256 22% 58%)', textAlign: 'center', lineHeight: 1.3 }}>{pk.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info */}
        <div className="product-detail__info">
          <p className="eyebrow">{p.categoryName}</p>
          <h1 className="product-detail__title">{p.name}</h1>

          <div className="product-detail__rating">
            <StarRating rating={p.averageRating ?? 0} size={16} />
            <span className="product-detail__rating-val">{(p.averageRating ?? 0).toFixed(1)}</span>
            <a href="#reviews" className="product-detail__reviews" style={{ textDecoration: 'none', color: 'hsl(256 22% 50%)' }}>({p.reviewCount ?? 0} reviews)</a>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', margin: '0.25rem 0' }}>
            <p className="product-detail__price">{fmt(displayPrice)}</p>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: p.inStock ? '#34d399' : 'var(--aura-rose)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
              {p.inStock ? 'In stock' : 'Out of stock'}
            </span>
          </div>

          <p className="product-detail__desc">{p.description}</p>

          {sizes.length > 0 && (
            <div className="product-detail__variations">
              <p className="product-detail__var-label">Size</p>
              <div className="product-detail__var-options">
                {sizes.map(size => {
                  const v = p.variations!.find(x => x.size === size);
                  const oos = v?.stockQuantity === 0;
                  return (
                    <button key={size!} type="button"
                      className={`product-detail__var-btn ${selectedVariation?.size === size ? 'product-detail__var-btn--active' : ''} ${oos ? 'product-detail__var-btn--oos' : ''}`}
                      disabled={oos} onClick={() => setSelectedVariation(v ?? null)}>
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div className="product-detail__variations">
              <p className="product-detail__var-label">Color</p>
              <div className="product-detail__var-options">
                {colors.map(color => {
                  const v = p.variations!.find(x => x.color === color);
                  const oos = v?.stockQuantity === 0;
                  return (
                    <button key={color!} type="button"
                      className={`product-detail__var-btn ${selectedVariation?.color === color ? 'product-detail__var-btn--active' : ''} ${oos ? 'product-detail__var-btn--oos' : ''}`}
                      disabled={oos} onClick={() => setSelectedVariation(v ?? null)}>
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="product-detail__row" style={{ flexWrap: 'wrap', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <label className="field__label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Qty</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid hsl(258 26% 24%)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 32, height: 36, background: 'hsl(258 30% 14%)', border: 'none', cursor: 'pointer', color: 'hsl(252 100% 97%)', fontSize: '1rem' }}>−</button>
                <span style={{ padding: '0 0.75rem', fontSize: '0.9rem', fontWeight: 600, color: 'hsl(252 100% 97%)', minWidth: 32, textAlign: 'center' }}>{qty}</span>
                <button type="button" onClick={() => setQty(q => Math.min(99, q + 1))} style={{ width: 32, height: 36, background: 'hsl(258 30% 14%)', border: 'none', cursor: 'pointer', color: 'hsl(252 100% 97%)', fontSize: '1rem' }}>+</button>
              </div>
            </div>

            <motion.button type="button" className={`btn btn--primary ${added ? 'btn--success' : ''}`} onClick={add} disabled={adding || !p.inStock} whileHover={{ scale: p.inStock ? 1.03 : 1 }} whileTap={{ scale: p.inStock ? 0.97 : 1 }} style={{ flex: 1, minWidth: 140 }}>
              <ShoppingCart size={15} /> {added ? '✓ Added!' : adding ? 'Adding…' : 'Add to cart'}
            </motion.button>

            <motion.button type="button" onClick={handleWishlist} style={{ width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', background: wishlisted ? 'rgba(251,113,133,0.15)' : 'hsl(258 26% 18%)', border: `1px solid ${wishlisted ? 'rgba(251,113,133,0.4)' : 'hsl(258 26% 26%)'}`, borderRadius: 'var(--radius)', cursor: 'pointer', flexShrink: 0 }} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}>
              <Heart size={16} fill={wishlisted ? '#fb7185' : 'none'} color={wishlisted ? '#fb7185' : 'hsl(256 22% 60%)'} />
            </motion.button>
          </div>

          {/* Buy now */}
          <Link to="/checkout">
            <motion.button type="button" className="btn btn--ghost btn--block" style={{ marginTop: '0.35rem' }} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              Buy now
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Related */}
      {related.length > 0 && (
        <section className="section">
          <div className="section__head">
            <h2 className="section__title">You might also like</h2>
            <Link to="/shop" className="text-link">View all →</Link>
          </div>
          <div className="carousel-track">
            {related.map((rp, i) => (
              <div key={rp.id} className="carousel-item">
                <ProductCard product={rp} index={i} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="section" id="reviews">
        <h2 className="section__title">Customer Reviews</h2>

        {reviews.length > 0 && (
          <div className="reviews-summary">
            <div className="reviews-summary__score">
              <p className="reviews-summary__big">{(p.averageRating ?? 0).toFixed(1)}</p>
              <StarRating rating={p.averageRating ?? 0} size={18} />
              <p style={{ fontSize: '0.78rem', color: 'hsl(256 22% 52%)', margin: '0.25rem 0 0' }}>{p.reviewCount ?? 0} reviews</p>
            </div>
            <div className="reviews-summary__bars">
              {ratingCounts.map(({ star, count, pct }) => (
                <div key={star} className="rating-bar">
                  <span style={{ fontSize: '0.72rem', color: 'hsl(256 22% 55%)', whiteSpace: 'nowrap', minWidth: 28 }}>{star} <Star size={9} fill="#fbbf24" color="#fbbf24" style={{ verticalAlign: 'middle' }} /></span>
                  <div className="rating-bar__track"><div className="rating-bar__fill" style={{ width: `${pct}%` }} /></div>
                  <span style={{ fontSize: '0.72rem', color: 'hsl(256 22% 52%)', minWidth: 28, textAlign: 'right' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isAuthenticated && !hasReviewed && (
          <ReviewForm productId={Number(id)} onSubmitted={() => { setHasReviewed(true); loadProduct(); }} />
        )}

        {reviews.length === 0
          ? <EmptyState icon={PackageSearch} message="No reviews yet. Be the first!" />
          : (
            <div className="reviews-list">
              {reviews.map(r => (
                <motion.div key={r.id} className="review-item" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <div className="review-item__head">
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'hsl(262 91% 76% / 0.15)', border: '1px solid hsl(262 91% 76% / 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--aura-violet)', flexShrink: 0 }}>
                      {(r.userName ?? 'U')[0].toUpperCase()}
                    </div>
                    <span className="review-item__author">{r.userName ?? 'User'}</span>
                    <StarRating rating={r.rating} size={13} />
                    <span className="review-item__date">{new Date(r.createdAtUtc).toLocaleDateString()}</span>
                  </div>
                  {r.comment && <p className="review-item__comment">{r.comment}</p>}
                </motion.div>
              ))}
            </div>
          )}
      </section>

      {/* Recently viewed */}
      <RecentlyViewed excludeId={p.id} />
    </div>
  );
}
