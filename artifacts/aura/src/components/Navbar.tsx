import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  User, Menu, X, Heart, LayoutDashboard,
  ShoppingCart, Headphones, Shirt, Smartphone, Monitor,
  Footprints, Dumbbell, Sparkles, Home, ChevronDown, Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { SearchAutocomplete } from './SearchAutocomplete';

const CATEGORIES = [
  { label: 'Electronics', icon: Monitor, color: '#7dd3fc', q: 'Electronics' },
  { label: 'Audio', icon: Headphones, color: '#a78bfa', q: 'Audio' },
  { label: 'Fashion', icon: Shirt, color: '#f472b6', q: 'Fashion' },
  { label: 'Phones', icon: Smartphone, color: '#34d399', q: 'Phones' },
  { label: 'Footwear', icon: Footprints, color: '#fb7185', q: 'Footwear' },
  { label: 'Sports', icon: Dumbbell, color: '#f97316', q: 'Sports' },
  { label: 'Beauty', icon: Sparkles, color: '#e879f9', q: 'Beauty' },
  { label: 'Home', icon: Home, color: '#fbbf24', q: 'Home' },
];

const linkMotion = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.04, y: -1, transition: { type: 'spring' as const, stiffness: 400, damping: 22 } },
  tap: { scale: 0.97 },
};

export function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const { cartCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const megaRef = useRef<HTMLDivElement>(null);
  const megaTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onPop = () => { setCurrentPath(window.location.pathname); setOpen(false); setMegaOpen(false); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const isActive = (to: string, end = false) => {
    if (end) return currentPath === to || currentPath === to + '/';
    return currentPath.startsWith(to);
  };

  const openMega = () => {
    if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current);
    setMegaOpen(true);
  };
  const closeMega = () => {
    megaTimeoutRef.current = setTimeout(() => setMegaOpen(false), 180);
  };

  const navLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/orders', label: 'Orders' },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: LayoutDashboard }] : []),
  ];

  return (
    <motion.header
      className={`nav-shell ${scrolled ? 'nav-shell--scrolled' : ''}`}
      initial={false}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="nav-inner">
        {/* Brand */}
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <Link to="/" className="nav-brand" onClick={() => { setCurrentPath('/'); setMegaOpen(false); }}>
            <span className="nav-mark" />
            AURA
          </Link>
        </motion.div>

        {/* Mobile burger */}
        <button type="button" className="nav-burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(v => !v)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Nav links */}
        <nav className={`nav-links ${open ? 'nav-links--open' : ''}`}>
          <LayoutGroup id="main-nav">
            {/* Home */}
            <motion.div className="nav-link-wrap" initial="rest" whileHover="hover" whileTap="tap" variants={linkMotion}>
              <Link to="/" className={`nav-a ${isActive('/', true) ? 'nav-a--active' : ''}`} onClick={() => { setCurrentPath('/'); setOpen(false); }}>
                {isActive('/', true) && <motion.span className="nav-a__pill" layoutId="nav-active-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                <span className="nav-a__label">Home</span>
              </Link>
            </motion.div>

            {/* Shop with mega menu */}
            <motion.div
              className="nav-link-wrap mega-wrap"
              ref={megaRef}
              onMouseEnter={openMega}
              onMouseLeave={closeMega}
              initial="rest" whileHover="hover" whileTap="tap" variants={linkMotion}
            >
              <Link
                to="/shop"
                className={`nav-a ${isActive('/shop') ? 'nav-a--active' : ''}`}
                onClick={() => { setCurrentPath('/shop'); setOpen(false); setMegaOpen(false); }}
              >
                {isActive('/shop') && <motion.span className="nav-a__pill" layoutId="nav-active-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                <span className="nav-a__label">
                  Shop <ChevronDown size={11} style={{ opacity: 0.6, transition: 'transform 0.2s', transform: megaOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </span>
              </Link>

              <AnimatePresence>
                {megaOpen && (
                  <motion.div
                    className="mega-menu"
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    onMouseEnter={openMega}
                    onMouseLeave={closeMega}
                  >
                    <p className="mega-menu__title">Shop by category</p>
                    <div className="mega-menu__grid">
                      {CATEGORIES.map(cat => {
                        const Icon = cat.icon;
                        return (
                          <Link
                            key={cat.label}
                            to={`/shop?q=${cat.q}`}
                            className="mega-item"
                            onClick={() => { setCurrentPath('/shop'); setMegaOpen(false); setOpen(false); }}
                          >
                            <span className="mega-item__dot" style={{ background: cat.color, boxShadow: `0 0 6px ${cat.color}60` }} />
                            <Icon size={13} color={cat.color} />
                            {cat.label}
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Other links */}
            {navLinks.slice(1).map(item => (
              <motion.div key={item.to} className="nav-link-wrap" initial="rest" whileHover="hover" whileTap="tap" variants={linkMotion}>
                <Link
                  to={item.to}
                  className={`nav-a ${isActive(item.to, false) ? 'nav-a--active' : ''}`}
                  onClick={() => { setCurrentPath(item.to); setOpen(false); }}
                >
                  {isActive(item.to) && <motion.span className="nav-a__pill" layoutId="nav-active-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                  <span className="nav-a__label">
                    {'icon' in item && item.icon && <LayoutDashboard size={13} />}
                    {item.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </LayoutGroup>
        </nav>

        {/* Search bar — desktop */}
        <div className="nav-search-wrap">
          <SearchAutocomplete />
        </div>

        {/* Right side icons */}
        <div className="nav-auth" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {/* Wishlist */}
          <div className="nav-wishlist-badge">
            <Link to="/wishlist" onClick={() => setCurrentPath('/wishlist')} style={{ display: 'flex', alignItems: 'center', color: 'hsl(256 22% 60%)', padding: '0.4rem', borderRadius: 'calc(var(--radius) - 4px)', transition: 'color 0.15s, background 0.15s' }}>
              <Heart size={17} />
            </Link>
            {wishlistCount > 0 && <span className="nav-wishlist-count">{wishlistCount}</span>}
          </div>

          {/* Cart icon with count */}
          {isAuthenticated && (
            <div className="nav-wishlist-badge">
              <Link to="/cart" onClick={() => setCurrentPath('/cart')} style={{ display: 'flex', alignItems: 'center', color: 'hsl(256 22% 60%)', padding: '0.4rem', borderRadius: 'calc(var(--radius) - 4px)', transition: 'color 0.15s' }}>
                <ShoppingCart size={17} />
              </Link>
              {cartCount > 0 && (
                <motion.span
                  className="nav-wishlist-count"
                  key={cartCount}
                  initial={{ scale: 1.4 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                  style={{ background: 'var(--aura-sky)', color: 'hsl(260 25% 4%)' }}
                >
                  {cartCount}
                </motion.span>
              )}
            </div>
          )}

          {/* Auth section */}
          <AnimatePresence mode="wait">
            {isAuthenticated ? (
              <motion.div key="in" className="nav-auth__row" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.15rem' }}>
                <Link to="/profile" onClick={() => setCurrentPath('/profile')} className="nav-user" style={{ textDecoration: 'none' }}>
                  <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'hsl(262 91% 76% / 0.15)', border: '1px solid hsl(262 91% 76% / 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'var(--aura-violet)' }}>
                    {user?.fullName?.[0]?.toUpperCase() ?? 'U'}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: 'hsl(256 22% 70%)' }}>{user?.fullName?.split(' ')[0]}</span>
                </Link>
                <motion.button type="button" className="btn btn--ghost btn--sm" onClick={logout} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                  Log out
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="out" className="nav-auth__row" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.15rem' }}>
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
