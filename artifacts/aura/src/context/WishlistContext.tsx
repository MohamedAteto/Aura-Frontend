import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface WishlistContextValue {
  wishlist: number[];
  toggle: (id: number) => void;
  isWishlisted: (id: number) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

const load = (): number[] => {
  try {
    const raw = localStorage.getItem('aura_wishlist');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
};

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<number[]>(load);

  useEffect(() => {
    localStorage.setItem('aura_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggle = useCallback((id: number) => {
    setWishlist(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  const isWishlisted = useCallback((id: number) => wishlist.includes(id), [wishlist]);

  const value = useMemo(
    () => ({ wishlist, toggle, isWishlisted, count: wishlist.length }),
    [wishlist, toggle, isWishlisted]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
