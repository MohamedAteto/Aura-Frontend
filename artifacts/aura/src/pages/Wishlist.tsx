import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import { Spinner } from '../components/Spinner';
import api from '../lib/api';

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  categoryName?: string;
  averageRating?: number;
  reviewCount?: number;
  inStock?: boolean;
}

export function Wishlist() {
  const { wishlist, count } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wishlist.length === 0) { setProducts([]); return; }
    let cancel = false;
    setLoading(true);
    Promise.all(wishlist.map(id => api.get(`/api/Products/${id}`).then(r => r.data).catch(() => null)))
      .then(results => {
        if (!cancel) setProducts(results.filter(Boolean));
      })
      .finally(() => { if (!cancel) setLoading(false); });
    return () => { cancel = true; };
  }, [wishlist.join(',')]);

  return (
    <div className="page-pad">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '2rem', fontWeight: 700, margin: 0 }}>Wishlist</h1>
          {count > 0 && (
            <span style={{ background: 'rgba(251,113,133,0.15)', color: 'var(--aura-rose)', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, padding: '0.2rem 0.65rem' }}>
              {count} {count === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>
      </div>

      {loading && <Spinner />}

      {!loading && wishlist.length === 0 && (
        <motion.div
          className="wishlist-empty"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Heart size={56} color="hsl(256 22% 35%)" strokeWidth={1} />
          <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.2rem', fontWeight: 600, margin: '0 0 0.25rem' }}>Your wishlist is empty</p>
          <p style={{ color: 'hsl(256 22% 55%)', fontSize: '0.88rem', margin: 0 }}>Save your favourite items by tapping the heart icon on any product.</p>
          <a href="/shop" className="btn btn--primary" style={{ marginTop: '0.5rem' }}>Browse shop</a>
        </motion.div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid-products">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
