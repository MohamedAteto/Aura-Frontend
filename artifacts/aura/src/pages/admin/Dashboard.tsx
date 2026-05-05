import { useEffect, useState, useCallback } from 'react';
import { DollarSign, ShoppingBag, Users, Package, RefreshCw, TrendingUp } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { KpiCard } from '../../components/KpiCard';
import api from '../../lib/api';

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  revenueByDay?: { date: string; revenue: number }[];
  ordersByStatus?: { status: string; count: number }[];
  topProducts?: { productId: number; name: string; revenue: number }[];
  revenueGrowth?: number;
  ordersGrowth?: number;
  usersGrowth?: number;
  lowStockProducts?: { id: number; name: string; stock: number }[];
}

const PIE_COLORS = ['#a78bfa', '#7dd3fc', '#fb7185', '#34d399', '#f97316'];

const TOOLTIP_STYLE = {
  background: 'hsl(258 30% 12%)',
  border: '1px solid hsl(258 26% 22%)',
  borderRadius: 8,
  fontSize: 12,
  color: 'hsl(252 100% 97%)',
};

export function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const r = await api.get('/api/Admin/dashboard');
      setData(r.data);
    } catch { /* ignore */ }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  if (loading) return <div className="admin-page"><p className="admin-loading">Loading dashboard…</p></div>;
  if (!data) return (
    <div className="admin-page">
      <p style={{ color: 'var(--aura-rose)', fontSize: '0.9rem' }}>
        Failed to load dashboard. Make sure VITE_API_URL points to your backend and you're logged in as admin.
      </p>
    </div>
  );

  const pieData = data.ordersByStatus?.map(s => ({ name: s.status, value: s.count })) ?? [];

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 className="admin-page__title" style={{ margin: 0 }}>Dashboard</h1>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => load(true)}
          disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="admin-kpis">
        <KpiCard icon={DollarSign} label="Total Revenue" value={fmt(data.totalRevenue)} color="var(--aura-sky)" trend={data.revenueGrowth} />
        <KpiCard icon={ShoppingBag} label="Total Orders" value={data.totalOrders.toLocaleString()} color="var(--aura-violet)" trend={data.ordersGrowth} />
        <KpiCard icon={Users} label="Total Users" value={data.totalUsers.toLocaleString()} color="#34d399" trend={data.usersGrowth} />
        <KpiCard icon={Package} label="Total Products" value={data.totalProducts.toLocaleString()} color="var(--aura-orange)" />
      </div>

      {/* Charts row */}
      <div className="admin-charts">
        <div className="admin-chart-card">
          <p className="admin-chart-title">Revenue — Last 30 Days</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.revenueByDay ?? []} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7dd3fc" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7dd3fc" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(258 26% 18%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(256 22% 55%)' }} tickFormatter={d => d?.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(256 22% 55%)' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [fmt(v), 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#7dd3fc" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="admin-chart-card">
          <p className="admin-chart-title">Orders by Status</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 10 }}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.ordersByStatus ?? []} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(258 26% 18%)" />
                <XAxis dataKey="status" tick={{ fontSize: 10, fill: 'hsl(256 22% 55%)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(256 22% 55%)' }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" fill="var(--aura-violet)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Products + Low Stock */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div className="admin-chart-card">
          <p className="admin-chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingUp size={13} color="var(--aura-sky)" /> Top 5 Products by Revenue
          </p>
          <table className="admin-table">
            <thead><tr><th>Product</th><th>Revenue</th></tr></thead>
            <tbody>
              {data.topProducts?.map(p => (
                <tr key={p.productId}>
                  <td>{p.name}</td>
                  <td style={{ color: 'var(--aura-sky)', fontWeight: 700 }}>{fmt(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.lowStockProducts && data.lowStockProducts.length > 0 && (
          <div className="admin-chart-card">
            <p className="admin-chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: 8, height: 8, background: 'var(--aura-rose)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
              Low Stock Alert
            </p>
            <table className="admin-table">
              <thead><tr><th>Product</th><th>Stock</th></tr></thead>
              <tbody>
                {data.lowStockProducts.slice(0, 5).map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>
                      <span className="status-badge" style={{ background: p.stock === 0 ? 'rgba(251,113,133,0.15)' : 'rgba(251,191,36,0.15)', color: p.stock === 0 ? 'var(--aura-rose)' : '#fbbf24' }}>
                        {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
