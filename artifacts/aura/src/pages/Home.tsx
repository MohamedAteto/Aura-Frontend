import { Link } from 'wouter';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HeroSection } from '../components/HeroSection';
import { PromoShowcase } from '../components/PromoShowcase';
import { ProductCard } from '../components/ProductCard';
import { SkeletonGrid } from '../components/SkeletonGrid';
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

export function Home() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const { data } = await api.get('/api/Products', { params: { page: 1, pageSize: 4, sort: 'asc' } });
        if (!cancel) setProducts(data.items ?? data ?? []);
      } catch {
        if (!cancel) setErr('Could not load products. Check your API connection.');
      }
    })();
    return () => { cancel = true; };
  }, []);

  return (
    <div>
      <HeroSection />

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1.5rem' }}>
        <section className="section">
          <div className="section__head">
            <motion.h2 className="section__title" initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              Spotlight
            </motion.h2>
            <Link to="/shop" className="text-link">View all →</Link>
          </div>

          {err && (
            <div style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', borderRadius: 'var(--radius)', padding: '1rem', color: 'var(--aura-rose)', fontSize: '0.88rem', marginBottom: '1rem' }}>
              {err} <span style={{ color: 'hsl(256 22% 55%)' }}>— Set VITE_API_URL to your backend URL.</span>
            </div>
          )}

          {products == null && !err && <SkeletonGrid count={4} />}
          {products && (
            <div className="grid-products">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </section>

        <PromoShowcase />

        {/* Categories strip */}
        <section className="section" style={{ paddingBottom: '2rem' }}>
          <div className="section__head">
            <h2 className="section__title">Browse by category</h2>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {['Electronics', 'Fashion', 'Audio', 'Home', 'Sports', 'Beauty'].map((cat, i) => (
              <motion.div key={cat} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                <Link
                  to={`/shop?q=${cat.toLowerCase()}`}
                  className="btn btn--ghost"
                  style={{ borderRadius: '999px', fontSize: '0.82rem' }}
                >
                  {cat}
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
