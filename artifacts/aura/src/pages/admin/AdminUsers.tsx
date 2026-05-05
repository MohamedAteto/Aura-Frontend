import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Shield, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  createdAtUtc?: string;
  orderCount?: number;
}

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (p = page, q = search) => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/Admin/users', { params: { page: p, pageSize: 15, search: q || undefined } });
      setUsers(data.items ?? data ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  const toggleRole = async (id: number, currentRole: string) => {
    const newRole = currentRole === 'Admin' ? 'Customer' : 'Admin';
    if (!confirm(`Change user role to ${newRole}?`)) return;
    try {
      await api.patch(`/api/Admin/users/${id}/role`, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      load();
    } catch {
      toast.error('Could not update role');
    }
  };

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 className="admin-page__title" style={{ margin: 0 }}>Users</h1>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'hsl(256 22% 45%)' }} />
          <input
            className="input"
            style={{ paddingLeft: '2.1rem' }}
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load(1, search)}
          />
        </div>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => load(1, search)}>Search</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 'var(--radius)' }} />)}
        </div>
      ) : (
        <div className="admin-chart-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Orders</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: u.role === 'Admin' ? 'hsl(262 91% 76% / 0.15)' : 'hsl(258 26% 18%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: u.role === 'Admin' ? 'var(--aura-violet)' : 'hsl(256 22% 55%)', flexShrink: 0 }}>
                        {u.fullName?.[0]?.toUpperCase() ?? 'U'}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{u.fullName}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'hsl(256 22% 60%)' }}>{u.email}</td>
                  <td>
                    <span className={`status-badge ${u.role === 'Admin' ? 'status-badge--shipped' : 'status-badge--processing'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'hsl(256 22% 55%)' }}>
                    {u.createdAtUtc ? new Date(u.createdAtUtc).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ fontWeight: 600 }}>{u.orderCount ?? 0}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => toggleRole(u.id, u.role)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      {u.role === 'Admin' ? <ShieldOff size={12} /> : <Shield size={12} />}
                      {u.role === 'Admin' ? 'Revoke admin' : 'Make admin'}
                    </button>
                  </td>
                </motion.tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'hsl(256 22% 50%)' }}>
                  <Users size={32} style={{ margin: '0 auto 0.5rem', display: 'block', opacity: 0.4 }} />
                  No users found
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.25rem' }}>
          <button type="button" className="btn btn--ghost btn--sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span style={{ fontSize: '0.82rem', color: 'hsl(256 22% 55%)', alignSelf: 'center' }}>Page {page} of {totalPages}</span>
          <button type="button" className="btn btn--ghost btn--sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
