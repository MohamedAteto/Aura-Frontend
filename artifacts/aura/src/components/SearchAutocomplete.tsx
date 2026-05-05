import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp } from 'lucide-react';
import { useLocation } from 'wouter';
import { mediaUrl } from '../lib/api';
import api from '../lib/api';

interface Product { id: number; name: string; price: number; imageUrl?: string; categoryName?: string; }

const TRENDING = ['Headphones', 'Sneakers', 'Smartphone', 'Watch', 'Laptop'];

interface Props {
  onClose?: () => void;
}

export function SearchAutocomplete({ onClose }: Props) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim() || q.length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/api/Products', { params: { search: q.trim(), page: 1, pageSize: 5 } });
        setResults(data.items ?? data ?? []);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const go = (path: string) => {
    navigate(path);
    setQ('');
    setResults([]);
    setFocused(false);
    onClose?.();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) go(`/shop?q=${encodeURIComponent(q.trim())}`);
  };

  const fmt = (n: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n);
  const showDropdown = focused && (q.length >= 2 || results.length > 0 || q.length === 0);

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', maxWidth: 560 }}>
      <form onSubmit={submit}>
        <div className={`search-bar search-bar--lg ${focused ? 'search-bar--focus' : ''}`}>
          <Search size={16} color={focused ? 'var(--aura-violet)' : 'hsl(256 22% 45%)'} style={{ flexShrink: 0, transition: 'color 0.15s' }} />
          <input
            ref={inputRef}
            type="search"
            placeholder="Search products, brands, categories…"
            value={q}
            onChange={e => setQ(e.target.value)}
            onFocus={() => setFocused(true)}
            autoComplete="off"
          />
          {q && (
            <button type="button" onClick={() => { setQ(''); setResults([]); inputRef.current?.focus(); }} style={{ background: 'none', border: 'none', color: 'hsl(256 22% 45%)', cursor: 'pointer', display: 'flex', padding: 0 }}>
              <X size={14} />
            </button>
          )}
          {loading && <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2, flexShrink: 0 }} />}
        </div>
      </form>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            className="search-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Trending when empty */}
            {q.length < 2 && (
              <div className="search-dropdown__section">
                <p className="search-dropdown__label"><TrendingUp size={12} /> Trending</p>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', padding: '0 0.5rem 0.5rem' }}>
                  {TRENDING.map(t => (
                    <button key={t} type="button" className="btn btn--ghost btn--sm" style={{ fontSize: '0.75rem', borderRadius: '999px' }} onClick={() => go(`/shop?q=${t}`)}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="search-dropdown__section">
                {q.length >= 2 && <p className="search-dropdown__label">Products</p>}
                {results.map(p => (
                  <button key={p.id} type="button" className="search-result-item" onClick={() => go(`/shop/${p.id}`)}>
                    <img src={mediaUrl(p.imageUrl)} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', background: 'hsl(258 30% 14%)', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                      <p style={{ margin: 0, fontSize: '0.73rem', color: 'hsl(256 22% 52%)' }}>{p.categoryName}</p>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--aura-violet)', whiteSpace: 'nowrap' }}>{fmt(p.price)}</span>
                  </button>
                ))}
                <button type="button" className="search-dropdown__see-all" onClick={() => go(`/shop?q=${encodeURIComponent(q)}`)}>
                  See all results for "{q}" →
                </button>
              </div>
            )}

            {q.length >= 2 && !loading && results.length === 0 && (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'hsl(256 22% 50%)', fontSize: '0.85rem' }}>
                No results for "{q}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
