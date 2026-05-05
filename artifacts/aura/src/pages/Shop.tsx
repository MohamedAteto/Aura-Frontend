import { useEffect, useState } from 'react';
import { SlidersHorizontal, PackageSearch, LayoutGrid, List, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

const SORT_OPTIONS = [
  { value: 'asc', label: 'Price: Low → High' },
  { value: 'high', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'new', label: 'Newest First' },
];

export function Shop() {
  const params = new URLSearchParams(window.location.search);
  const [q, setQ] = useState(params.get('q') || '');
  const [categoryId, setCategoryId] = useState(params.get('category') || '');
  const [sort, setSort] = useState('asc');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
      {/* Page header */}
      <motion.header className="page-header" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '2rem', fontWeight: 700, margin: '0 0 0.15rem' }}>Shop</h1>
            {data && <p style={{ margin: 0, fontSize: '0.82rem', color: 'hsl(256 22% 50%)' }}>{data.totalCount ?? 0} products</p>}
          </div>
          {/* Active filter chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <AnimatePresence>
              {q && (
                <motion.button type="button" className="btn btn--ghost btn--sm" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} onClick={() => setQ('')} style={{ gap: '0.3rem', fontSize: '0.75rem' }}>
                  "{q}" <X size={11} />
                </motion.button>
              )}
              {categoryId && (
                <motion.button type="button" className="btn btn--ghost btn--sm" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} onClick={() => setCategoryId('')} style={{ gap: '0.3rem', fontSize: '0.75rem' }}>
                  Category <X size={11} />
                </motion.button>
              )}
            </AnimatePresence>
            {activeFilterCount > 0 && (
              <button type="button" className="btn btn--ghost btn--sm" style={{ fontSize: '0.75rem', color: 'var(--aura-rose)', borderColor: 'rgba(251,113,133,0.3)' }} onClick={clearAll}>
                Clear all ({activeFilterCount})
              </button>
            )}
          </div>
        </div>
      </motion.header>

      <div className="shop-layout">
        {/* Sidebar filters */}
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
            <label className="field__label">Sort</label>
            <select className="input" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="field">
            <label className="field__label">Price range ($)</label>
            <div className="shop-price-range">
              <input className="input input--sm" type="number" placeholder="Min" min="0" value={minPrice} onChange={e => { setMinPrice(e.target.value); setPage(1); }} />
              <span className="shop-price-range__sep">–</span>
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
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  {r.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* In stock toggle */}
          <div style={{ paddingTop: '0.25rem', borderTop: '1px solid hsl(258 26% 18%)' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(256 22% 55%)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0.75rem 0 0.5rem' }}>Availability</p>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', color: 'hsl(256 22% 70%)' }}>
              <input type="checkbox" style={{ accentColor: 'var(--aura-violet)' }} /> In stock only
            </label>
          </div>
        </aside>

        {/* Products area */}
        <div>
          {/* Toolbar: sort + view toggle */}
          <div className="shop-toolbar">
            <div className="shop-toolbar__left">
              <SlidersHorizontal size={14} color="hsl(256 22% 50%)" />
              <span style={{ fontSize: '0.78rem', color: 'hsl(256 22% 50%)' }}>
                {data ? `${data.totalCount ?? 0} products` : 'Loading…'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <select className="shop-toolbar__sort" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="view-toggle">
                <button type="button" className={`view-toggle__btn ${viewMode === 'grid' ? 'view-toggle__btn--active' : ''}`} onClick={() => setViewMode('grid')} aria-label="Grid view">
                  <LayoutGrid size={14} />
                </button>
                <button type="button" className={`view-toggle__btn ${viewMode === 'list' ? 'view-toggle__btn--active' : ''}`} onClick={() => setViewMode('list')} aria-label="List view">
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>

          {err && <div className="form-error" style={{ marginBottom: '1rem' }}>{err}</div>}

          {loading && <SkeletonGrid />}

          <AnimatePresence mode="wait">
            {!loading && data && (
              <motion.div key={`${viewMode}-${page}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {data.items?.length === 0
                  ? <EmptyState icon={PackageSearch} message="No products match your filters." ctaLabel="Clear filters" ctaTo="/shop" />
                  : (
                    <div className={viewMode === 'grid' ? 'grid-products' : 'grid-products--list'}>
                      {data.items.map((p, i) => (
                        <ProductCard key={p.id} product={p} index={i} viewMode={viewMode} />
                      ))}
                    </div>
                  )}

                {(data.totalPages ?? 1) > 1 && (
                  <div className="pagination" style={{ marginTop: '2rem' }}>
                    <button type="button" className="btn btn--ghost btn--sm" disabled={page <= 1} onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                      ← Previous
                    </button>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {Array.from({ length: Math.min(data.totalPages, 5) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button key={pageNum} type="button"
                            className={`view-toggle__btn ${page === pageNum ? 'view-toggle__btn--active' : ''}`}
                            onClick={() => { setPage(pageNum); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            style={{ width: 32, height: 32, fontSize: '0.78rem', fontWeight: page === pageNum ? 700 : 400 }}>
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button type="button" className="btn btn--ghost btn--sm" disabled={page >= data.totalPages} onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                      Next →
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
