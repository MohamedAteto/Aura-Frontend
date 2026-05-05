import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Lock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { PasswordStrength } from '../components/PasswordStrength';
import { Redirect } from 'wouter';
import api from '../lib/api';

export function Profile() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [nameLoading, setNameLoading] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  if (!isAuthenticated) return <Redirect to="/login" />;

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameLoading(true);
    try {
      await api.put('/api/Auth/profile', { fullName });
      updateUser({ fullName });
      toast.success('Name updated!');
    } catch (ex: any) {
      toast.error(ex?.response?.data?.message || 'Could not update name');
    } finally {
      setNameLoading(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setPwLoading(true);
    try {
      await api.put('/api/Auth/change-password', { currentPassword: currentPw, newPassword: newPw });
      toast.success('Password changed successfully!');
      setCurrentPw('');
      setNewPw('');
    } catch (ex: any) {
      toast.error(ex?.response?.data?.message || 'Could not change password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="page-pad">
      <div className="page-header">
        <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '2rem', fontWeight: 700, margin: 0 }}>My Profile</h1>
      </div>

      <div className="profile-grid">
        {/* Sidebar */}
        <motion.div className="profile-card" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
          <div className="profile-avatar">{user?.fullName?.[0]?.toUpperCase() ?? 'U'}</div>
          <p className="profile-name">{user?.fullName}</p>
          <p className="profile-email">{user?.email}</p>
          <div style={{ marginTop: '1rem', padding: '0.6rem 0.85rem', background: 'hsl(262 91% 76% / 0.08)', borderRadius: 'var(--radius)', border: '1px solid hsl(262 91% 76% / 0.2)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle size={13} color="var(--aura-violet)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--aura-violet)', fontWeight: 600 }}>{user?.role}</span>
          </div>
        </motion.div>

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Edit name */}
          <motion.div className="profile-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2>Personal Information</h2>
            <form onSubmit={saveName} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="field__label">Full name</label>
                <div style={{ position: 'relative' }}>
                  <User size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'hsl(256 22% 45%)' }} />
                  <input className="input" style={{ paddingLeft: '2.2rem' }} type="text" value={fullName} onChange={e => setFullName(e.target.value)} required minLength={2} />
                </div>
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="field__label">Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'hsl(256 22% 45%)' }} />
                  <input className="input" style={{ paddingLeft: '2.2rem', opacity: 0.6 }} type="email" value={user?.email ?? ''} disabled />
                </div>
                <span className="form-hint">Email cannot be changed</span>
              </div>
              <motion.button type="submit" className="btn btn--primary btn--sm" disabled={nameLoading} style={{ alignSelf: 'flex-start' }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                {nameLoading ? 'Saving…' : 'Save changes'}
              </motion.button>
            </form>
          </motion.div>

          {/* Change password */}
          <motion.div className="profile-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2>Change Password</h2>
            <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="field__label">Current password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'hsl(256 22% 45%)' }} />
                  <input
                    className="input"
                    style={{ paddingLeft: '2.2rem', paddingRight: '2.5rem' }}
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPw}
                    onChange={e => setCurrentPw(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowCurrent(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'hsl(256 22% 50%)', cursor: 'pointer' }}>
                    {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="field__label">New password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'hsl(256 22% 45%)' }} />
                  <input
                    className="input"
                    style={{ paddingLeft: '2.2rem', paddingRight: '2.5rem' }}
                    type={showNew ? 'text' : 'password'}
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowNew(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'hsl(256 22% 50%)', cursor: 'pointer' }}>
                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <PasswordStrength password={newPw} />
              </div>
              <motion.button type="submit" className="btn btn--primary btn--sm" disabled={pwLoading} style={{ alignSelf: 'flex-start' }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                {pwLoading ? 'Changing…' : 'Change password'}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
