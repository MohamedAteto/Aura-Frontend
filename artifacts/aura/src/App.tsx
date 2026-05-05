import { Switch, Route, Router as WouterRouter } from 'wouter';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductPage } from './pages/ProductPage';
import { Cart } from './pages/Cart';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Orders } from './pages/Orders';
import { Profile } from './pages/Profile';
import { Wishlist } from './pages/Wishlist';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import NotFound from './pages/not-found';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

function Router() {
  return (
    <Switch>
      {/* Admin routes */}
      <Route path="/admin">
        {() => (
          <ProtectedRoute adminOnly>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/products">
        {() => (
          <ProtectedRoute adminOnly>
            <AdminLayout>
              <AdminProducts />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/orders">
        {() => (
          <ProtectedRoute adminOnly>
            <AdminLayout>
              <AdminOrders />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/users">
        {() => (
          <ProtectedRoute adminOnly>
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/coupons">
        {() => (
          <ProtectedRoute adminOnly>
            <AdminLayout>
              <AdminCoupons />
            </AdminLayout>
          </ProtectedRoute>
        )}
      </Route>

      {/* Main routes */}
      <Route path="/">
        {() => <Layout><Home /></Layout>}
      </Route>
      <Route path="/shop">
        {() => <Layout><Shop /></Layout>}
      </Route>
      <Route path="/shop/:id">
        {(params) => <Layout><ProductPage id={params.id} /></Layout>}
      </Route>
      <Route path="/cart">
        {() => <Layout><Cart /></Layout>}
      </Route>
      <Route path="/login">
        {() => <Layout><Login /></Layout>}
      </Route>
      <Route path="/register">
        {() => <Layout><Register /></Layout>}
      </Route>
      <Route path="/orders">
        {() => <Layout><Orders /></Layout>}
      </Route>
      <Route path="/profile">
        {() => <Layout><Profile /></Layout>}
      </Route>
      <Route path="/wishlist">
        {() => <Layout><Wishlist /></Layout>}
      </Route>
      <Route>
        {() => <Layout><NotFound /></Layout>}
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <WouterRouter base={base}>
          <Router />
        </WouterRouter>
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              background: 'hsl(258 30% 14%)',
              border: '1px solid hsl(258 26% 24%)',
              color: 'hsl(252 100% 97%)',
            },
          }}
        />
      </WishlistProvider>
    </AuthProvider>
  );
}
