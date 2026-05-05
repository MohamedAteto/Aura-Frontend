import { useEffect, useState } from 'react';
import { SlidersHorizontal, PackageSearch } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProductCard } from '../components/ProductCard';
import { SkeletonGrid } from '../components/SkeletonGrid';
import { SearchBar } from '../components/SearchBar';
import { EmptyState } from '../components/EmptyState';
import api from '../lib/api';

interface Category { id: number; name: string; }
interface Product { id: number; name: string; price: number; imageUrl?: string; categoryName?: string; averageRating?: number; reviewCount?: number; inStock?: boolean; }
interface PagedData { items: Product[]; totalPages: number; page: number; totalCount: number; }

const RATINGS = [
  { label: '4★ & up', value: '4' },
  { label: '3★ & up', value: '3' },
  { label: '2★ & up', value: '2' },
];

export function Shop() {
  const params = new URLSearchParams(window.location.search);
  const [q, setQ] = useState(params.get('q') || '');
  const [categoryId, setCategoryId] = useState(params.get('category') || '');
  const [sort, setSort] = useState(params.get('sort') || 'asc');
  const [minPrice, setMinPrice] = useState(params.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(params.get('maxPrice') || '');
  const [minRating, setMinRating] = useState(params.get('minRating') || '');
  const [page, setPage] = useState(1);

  const [data, setData] = useState<PagedData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const activeFilterCount = [categoryId, q, minPrice, maxPrice, minRating].filter(Boolean).length;

  useEffect(() => {
    api.get('/api/Categories').then(r => setCategories(r.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    api.get('/api/Products', {
      params: {
        page, pageSize: 12,
        categoryId: categoryId || undefined,
        search: q || undefined,
        sort: sort === 'high' ? 'desc' : 'asc',
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        minRating: minRating || undefined,
      },
    }).then(r => {
      if (!cancel) { setData(r.data); setErr(null); }
    }).catch(() => {
      if (!cancel) setErr('Failed to load products. Make sure VITE_API_URL points to your backend.');
    }).finally(() => {
      if (!cancel) setLoading(false);
    });
    return () => { cancel = true; };
  }, [page, categoryId, q, sort, minPrice, maxPrice, minRating]);

  const clearAll = () => {
    setQ(''); setCategoryId(''); setSort('asc');
    setMinPrice(''); setMaxPrice(''); setMinRating(''); setPage(1);
  };

  return (
    <div className="page-pad">
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '2rem', fontWeight: 700, margin: 0 }}>Shop</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SlidersHorizontal size={15} color="hsl(256 22% 55%)" />
            <span style={{ fontSize: '0.82rem', color: 'hsl(256 22% 55%)' }}>Filters</span>
            {activeFilterCount > 0 && (
              <span style={{ background: 'var(--aura-violet)', color: 'hsl(260 25% 4%)', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 700, padding: '1px 7px' }}>
                {activeFilterCount}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="shop-layout">
        <aside className="shop-filters">
          <SearchBar onSearch={v => { setQ(v); setPage(1); }} initialValue={q} />

          <div className="field">
            <label className="field__label">Category</label>
            <select className="input" value={categoryId || 'all'} onChange={e => { setCategoryId(e.target.value === 'all' ? '' : e.target.value); setPage(1); }}>
              <option value="all">All categories</option>
              {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
            </select>
          </div>

          <div className="field">
            <label className="field__label">Sort by price</label>
            <select className="input" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
              <option value="asc">Low → High</option>
              <option value="high">High → Low</option>
            </select>
          </div>

          <div className="field">
            <label className="field__label">Price range ($)</label>
            <div className="shop-price-range">
              <input className="input input--sm" type="number" placeholder="Min" min="0" value={minPrice} onChange={e => { setMinPrice(e.target.value); setPage(1); }} />
              <span className="shop-price-range__sep">to</span>
              <input className="input input--sm" type="number" placeholder="Max" min="0" value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setPage(1); }} />
            </div>
          </div>

          <div className="field">
            <label className="field__label">Min rating</label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {RATINGS.map(r => (
                <motion.button key={r.value} type="button"
                  className={`shop-rating-btn ${minRating === r.value ? 'shop-rating-btn--active' : ''}`}
                  onClick={() => { setMinRating(minRating === r.value ? '' : r.value); setPage(1); }}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  {r.label}
                </motion.button>
              ))}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button type="button" className="btn btn--ghost btn--sm" style={{ width: '100%', justifyContent: 'center' }} onClick={clearAll}>
              Clear all filters
            </button>
          )}
        </aside>

        <div>
          {err && <div className="form-error" style={{ marginBottom: '1rem' }}>{err}</div>}
          {loading && <SkeletonGrid />}
          {!loading && data && (
            <>
              {data.items?.length === 0
                ? <EmptyState icon={PackageSearch} message="No products match your filters." ctaLabel="Clear filters" ctaTo="/shop" />
                : (
                  <>
                    <div style={{ fontSize: '0.8rem', color: 'hsl(256 22% 55%)', marginBottom: '1rem' }}>
                      {data.totalCount} product{data.totalCount !== 1 ? 's' : ''} found
                    </div>
                    <div className="grid-products">
                      {data.items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                    </div>
                  </>
                )}
              {(data.totalPages ?? 1) > 1 && (
                <div className="pagination">
                  <button type="button" className="btn btn--ghost btn--sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                  <span className="pagination__meta">Page {data.page} of {data.totalPages}</span>
                  <button type="button" className="btn btn--ghost btn--sm" disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
