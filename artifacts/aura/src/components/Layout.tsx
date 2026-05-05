import { Link } from 'wouter';
import { ShoppingCart } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ScrollToTop } from './ScrollToTop';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { cartCount } = useCart();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Announcement bar */}
      <div className="announcement-bar">
        <span className="live-dot" />
        <span>Free shipping on all orders over <strong>$50</strong> — Limited time only</span>
      </div>

      <Navbar />

      <main style={{ flex: 1 }} className="page-enter">
        {children}
      </main>

      <Footer />

      {/* Floating cart button */}
      <AnimatePresence>
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            style={{ position: 'fixed', bottom: '5.5rem', right: '2rem', zIndex: 90 }}
          >
            <Link to="/cart" className="cart-fab" aria-label="Cart">
              <ShoppingCart size={18} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    className="cart-fab__count"
                    key={cartCount}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <ScrollToTop />
    </div>
  );
}
