import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { PasswordStrength } from '../components/PasswordStrength';

export function Register() {
  const { register } = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Real-time validation
  const emailValid = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const nameValid = !fullName || fullName.trim().length >= 2;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await register(email, fullName, password);
      toast.success('Account created! Welcome to Aura 🎉');
      navigate('/');
    } catch (ex: any) {
      const msg = ex?.response?.data?.error || ex?.response?.data?.message || 'Registration failed. Please try again.';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-pad auth">
      <motion.div className="auth__card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <span style={{ width: 8, height: 8, background: 'var(--aura-violet)', borderRadius: '50%', boxShadow: '0 0 10px var(--aura-violet)', display: 'inline-block' }} />
          <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.9rem', color: 'hsl(256 22% 65%)' }}>AURA</span>
        </div>

        <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.35rem' }}>Create account</h1>
        <p className="page-lead">Join Aura for exclusive drops and seamless shopping.</p>

        {err && (
          <motion.div className="form-error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1rem' }}>
            {err}
          </motion.div>
        )}

        <form onSubmit={submit} className="form-stack">
          <div className="field">
            <label className="field__label">Full name</label>
            <div style={{ position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: nameValid ? 'hsl(256 22% 45%)' : 'var(--aura-rose)' }} />
              <input
                className="input"
                style={{ paddingLeft: '2.2rem', borderColor: !nameValid ? 'rgba(251,113,133,0.5)' : undefined }}
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                minLength={2}
                placeholder="Jane Doe"
              />
            </div>
            {!nameValid && <span style={{ fontSize: '0.72rem', color: 'var(--aura-rose)' }}>Name must be at least 2 characters</span>}
          </div>

          <div className="field">
            <label className="field__label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: emailValid ? 'hsl(256 22% 45%)' : 'var(--aura-rose)' }} />
              <input
                className="input"
                style={{ paddingLeft: '2.2rem', borderColor: !emailValid ? 'rgba(251,113,133,0.5)' : undefined }}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>
            {!emailValid && <span style={{ fontSize: '0.72rem', color: 'var(--aura-rose)' }}>Enter a valid email address</span>}
          </div>

          <div className="field">
            <label className="field__label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'hsl(256 22% 45%)' }} />
              <input
                className="input"
                style={{ paddingLeft: '2.2rem', paddingRight: '2.5rem' }}
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'hsl(256 22% 50%)', cursor: 'pointer', padding: '2px' }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          <motion.button
            type="submit"
            className="btn btn--primary btn--block"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </motion.button>
        </form>

        <p className="auth__foot">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}
