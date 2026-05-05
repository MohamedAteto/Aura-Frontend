import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, LogOut, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/coupons', icon: Tag, label: 'Coupons' },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (to: string, exact = false) => {
    if (exact) return location === to || location === to + '/';
    return location.startsWith(to);
  };

  return (
    <div className="admin-layout">
      <motion.aside
        className="admin-sidebar"
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <div className="admin-sidebar__brand">
          <Store size={18} />
          <span>AURA Admin</span>
        </div>
        <nav className="admin-sidebar__nav">
          {navItems.map(({ to, icon: Icon, label, exact }) => (
            <Link
              key={to}
              to={to}
              className={`admin-nav-item ${isActive(to, exact) ? 'admin-nav-item--active' : ''}`}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <div className="admin-sidebar__avatar">{user?.fullName?.[0]?.toUpperCase() ?? 'A'}</div>
            <div>
              <div className="admin-sidebar__name">{user?.fullName}</div>
              <div className="admin-sidebar__role">Administrator</div>
            </div>
          </div>
          <button type="button" className="admin-sidebar__logout" onClick={handleLogout}>
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </motion.aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
