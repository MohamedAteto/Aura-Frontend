import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { ProductCard } from './ProductCard';
import api from '../lib/api';

interface Product {
  id: number; name: string; price: number; imageUrl?: string;
  categoryName?: string; averageRating?: number; reviewCount?: number; inStock?: boolean;
}

const KEY = 'aura_recently_viewed';

export function trackRecentlyViewed(id: number) {
  const existing = JSON.parse(localStorage.getItem(KEY) || '[]') as number[];
  const updated = [id, ...existing.filter(x => x !== id)].slice(0, 8);
  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function RecentlyViewed({ excludeId }: { excludeId?: number }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const ids = (JSON.parse(localStorage.getItem(KEY) || '[]') as number[])
      .filter(id => id !== excludeId)
      .slice(0, 6);
    if (ids.length === 0) return;

    Promise.allSettled(ids.map(id => api.get(`/api/Products/${id}`)))
      .then(results => {
        const loaded = results
          .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
          .map(r => r.value.data);
        setProducts(loaded);
      });
  }, [excludeId]);

  if (products.length === 0) return null;

  return (
    <section className="section">
      <div className="section__head">
        <motion.h2 className="section__title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <Clock size={18} color="hsl(256 22% 55%)" /> Recently Viewed
        </motion.h2>
      </div>
      <div className="carousel-track">
        {products.map((p, i) => (
          <div key={p.id} className="carousel-item">
            <ProductCard product={p} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
