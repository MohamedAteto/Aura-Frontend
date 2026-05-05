import { Link } from 'wouter';
import { Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: 6, height: 6, background: 'var(--aura-violet)', borderRadius: '50%', boxShadow: '0 0 8px var(--aura-violet)', display: 'inline-block' }} />
          <span className="footer-brand">AURA</span>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to="/shop" style={{ fontSize: '0.8rem', color: 'hsl(256 22% 50%)' }}>Shop</Link>
          <Link to="/orders" style={{ fontSize: '0.8rem', color: 'hsl(256 22% 50%)' }}>Orders</Link>
          <Link to="/wishlist" style={{ fontSize: '0.8rem', color: 'hsl(256 22% 50%)' }}>Wishlist</Link>
        </div>
        <p className="footer-copy">© {new Date().getFullYear()} Aura Store. All rights reserved.</p>
      </div>
    </footer>
  );
}
