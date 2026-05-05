import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

interface Coupon {
  id: number;
  code: string;
  discountType: 'Percentage' | 'Fixed';
  discountValue: number;
  minOrderAmount?: number;
  expiresAtUtc?: string;
  isActive?: boolean;
  usageCount?: number;
}

export function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '', discountType: 'Percentage' as 'Percentage' | 'Fixed',
    discountValue: '', minOrderAmount: '', expiresAt: '',
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/Admin/coupons');
      setCoupons(Array.isArray(data) ? data : (data.items ?? []));
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/Admin/coupons', {
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
        expiresAtUtc: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      });
      toast.success('Coupon created!');
      setShowForm(false);
      setForm({ code: '', discountType: 'Percentage', discountValue: '', minOrderAmount: '', expiresAt: '' });
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Could not create coupon');
    } finally {
      setSaving(false);
    }
  };

  const deleteCoupon = async (id: number) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/api/Admin/coupons/${id}`);
      toast.success('Coupon deleted');
      load();
    } catch {
      toast.error('Could not delete coupon');
    }
  };

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 className="admin-page__title" style={{ margin: 0 }}>Coupons</h1>
        <button type="button" className="btn btn--primary btn--sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={() => setShowForm(v => !v)}>
          <Plus size={14} /> New coupon
        </button>
      </div>

      {showForm && (
        <motion.div
          className="admin-chart-card"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '1.25rem' }}
        >
          <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'hsl(256 22% 65%)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1rem' }}>Create coupon</p>
          <form onSubmit={createCoupon} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: '0.85rem', alignItems: 'end' }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field__label">Code</label>
              <input className="input" required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="SUMMER20" />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field__label">Type</label>
              <select className="input" value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value as any }))}>
                <option value="Percentage">Percentage (%)</option>
                <option value="Fixed">Fixed ($)</option>
              </select>
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field__label">Value</label>
              <input className="input" type="number" required min="0" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} placeholder={form.discountType === 'Percentage' ? '20' : '10'} />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field__label">Min order ($)</label>
              <input className="input" type="number" min="0" value={form.minOrderAmount} onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))} placeholder="Optional" />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field__label">Expires</label>
              <input className="input" type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>{saving ? '…' : 'Create'}</button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 'var(--radius)' }} />)}
        </div>
      ) : (
        <div className="admin-chart-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min Order</th>
                <th>Expires</th>
                <th>Uses</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c, i) => (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Tag size={12} color="var(--aura-sky)" />
                      <code style={{ background: 'hsl(258 26% 18%)', padding: '0.15rem 0.5rem', borderRadius: 4, fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                        {c.code}
                      </code>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: '#34d399' }}>
                    {c.discountType === 'Percentage' ? `${c.discountValue}%` : `$${c.discountValue}`}
                  </td>
                  <td style={{ color: 'hsl(256 22% 55%)', fontSize: '0.82rem' }}>{c.minOrderAmount ? `$${c.minOrderAmount}` : '—'}</td>
                  <td style={{ color: 'hsl(256 22% 55%)', fontSize: '0.78rem' }}>
                    {c.expiresAtUtc ? (
                      new Date(c.expiresAtUtc) < new Date()
                        ? <span style={{ color: 'var(--aura-rose)' }}>Expired</span>
                        : new Date(c.expiresAtUtc).toLocaleDateString()
                    ) : 'No expiry'}
                  </td>
                  <td style={{ fontWeight: 600 }}>{c.usageCount ?? 0}</td>
                  <td>
                    <button type="button" className="btn btn--ghost btn--sm" style={{ color: 'var(--aura-rose)', borderColor: 'rgba(251,113,133,0.3)', display: 'flex', alignItems: 'center', gap: '0.3rem' }} onClick={() => deleteCoupon(c.id)}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </td>
                </motion.tr>
              ))}
              {coupons.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'hsl(256 22% 50%)' }}>
                  <Tag size={32} style={{ margin: '0 auto 0.5rem', display: 'block', opacity: 0.4 }} />
                  No coupons yet
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
