import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { ShoppingCart, User, Menu, X, Heart, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

const linkMotion = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.04, y: -2, transition: { type: 'spring' as const, stiffness: 400, damping: 22 } },
  tap: { scale: 0.97 },
};

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

export function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onPop = () => { setCurrentPath(window.location.pathname); setOpen(false); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const isActive = (to: string, end = false) => {
    if (end) return currentPath === to || currentPath === to + '/';
    return currentPath.startsWith(to);
  };

  const links: NavItem[] = [
    { to: '/', end: true, label: 'Home' },
    { to: '/shop', label: 'Shop' },
    ...(isAuthenticated ? [
      { to: '/cart', label: 'Cart' },
      { to: '/orders', label: 'Orders' },
    ] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <motion.header
      className={`nav-shell ${scrolled ? 'nav-shell--scrolled' : ''}`}
      initial={false}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="nav-inner">
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
          <Link to="/" className="nav-brand" onClick={() => setCurrentPath('/')}>
            <span className="nav-mark" />
            AURA
          </Link>
        </motion.div>

        <button type="button" className="nav-burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(v => !v)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav className={`nav-links ${open ? 'nav-links--open' : ''}`}>
          <LayoutGroup id="main-nav">
            {links.map(item => (
              <motion.div key={item.to} className="nav-link-wrap" initial="rest" whileHover="hover" whileTap="tap" variants={linkMotion}>
                <Link
                  to={item.to}
                  className={`nav-a ${isActive(item.to, item.end) ? 'nav-a--active' : ''}`}
                  onClick={() => { setCurrentPath(item.to); setOpen(false); }}
                >
                  {isActive(item.to, item.end) && (
                    <motion.span className="nav-a__pill" layoutId="nav-active-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                  )}
                  <span className="nav-a__label">
                    {item.to === '/cart' && <ShoppingCart size={13} />}
                    {item.to === '/admin' && <LayoutDashboard size={13} />}
                    {item.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </LayoutGroup>
        </nav>

        <div className={`nav-auth ${open ? 'nav-auth--open' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Wishlist icon */}
          <div className="nav-wishlist-badge">
            <Link to="/wishlist" onClick={() => setCurrentPath('/wishlist')} style={{ display: 'flex', alignItems: 'center', color: 'hsl(256 22% 65%)', padding: '0.35rem' }}>
              <Heart size={17} />
            </Link>
            {wishlistCount > 0 && (
              <span className="nav-wishlist-count">{wishlistCount}</span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {isAuthenticated ? (
              <motion.div key="in" className="nav-auth__row" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
                <Link to="/profile" onClick={() => setCurrentPath('/profile')} className="nav-user" style={{ textDecoration: 'none' }}>
                  <User size={13} />
                  {user?.fullName?.split(' ')[0]}
                </Link>
                <motion.button type="button" className="btn btn--ghost btn--sm" onClick={logout} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                  Log out
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="out" className="nav-auth__row" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
                <Link to="/login" className="btn btn--ghost btn--sm">Log in</Link>
                <Link to="/register" className="btn btn--primary btn--sm">Sign up</Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}
