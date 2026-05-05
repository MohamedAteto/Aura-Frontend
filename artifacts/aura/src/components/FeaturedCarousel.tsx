import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { SkeletonGrid } from './SkeletonGrid';
import api from '../lib/api';

interface Product {
  id: number; name: string; price: number; imageUrl?: string;
  categoryName?: string; averageRating?: number; reviewCount?: number; inStock?: boolean;
}

interface Props {
  title: string;
  sort?: string;
  category?: string;
}

export function FeaturedCarousel({ title, sort = 'asc', category }: Props) {
  const [products, setProducts] = useState<Product[] | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancel = false;
    api.get('/api/Products', { params: { page: 1, pageSize: 8, sort, categoryId: category } })
      .then(r => { if (!cancel) setProducts(r.data.items ?? r.data ?? []); })
      .catch(() => { if (!cancel) setProducts([]); });
    return () => { cancel = true; };
  }, [sort, category]);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'right' ? 280 : -280, behavior: 'smooth' });
  };

  return (
    <section className="section">
      <div className="section__head">
        <motion.h2 className="section__title" initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          {title}
        </motion.h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button type="button" className="carousel-arrow" onClick={() => scroll('left')} aria-label="Previous">
            <ChevronLeft size={16} />
          </button>
          <button type="button" className="carousel-arrow" onClick={() => scroll('right')} aria-label="Next">
            <ChevronRight size={16} />
          </button>
          <Link to="/shop" className="text-link">View all →</Link>
        </div>
      </div>

      {products == null
        ? <SkeletonGrid count={4} />
        : (
          <div className="carousel-track" ref={scrollRef}>
            {products.map((p, i) => (
              <div key={p.id} className="carousel-item">
                <ProductCard product={p} index={i} />
              </div>
            ))}
          </div>
        )}
    </section>
  );
}
