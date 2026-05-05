import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';

interface CartContextValue {
  cartCount: number;
  refreshCart: () => void;
  bumpCart: (delta: number) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const fetchCount = useCallback(async () => {
    if (!isAuthenticated) { setCartCount(0); return; }
    try {
      const { data } = await api.get('/api/Cart');
      const items = Array.isArray(data) ? data : (data?.items ?? []);
      setCartCount(items.reduce((sum: number, i: any) => sum + (i.quantity ?? 1), 0));
    } catch { /* ignore */ }
  }, [isAuthenticated]);

  useEffect(() => { fetchCount(); }, [fetchCount]);

  const bumpCart = useCallback((delta: number) => {
    setCartCount(prev => Math.max(0, prev + delta));
  }, []);

  const value = useMemo(() => ({ cartCount, refreshCart: fetchCount, bumpCart }), [cartCount, fetchCount, bumpCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
