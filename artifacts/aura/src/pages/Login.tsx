import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(email, password, remember);
      toast.success('Welcome back!');
      navigate('/');
    } catch (ex: any) {
      const msg = ex?.response?.data?.error || ex?.response?.data?.message || 'Login failed. Check your credentials.';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-pad auth">
      <motion.div className="auth__card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Logo mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <span style={{ width: 8, height: 8, background: 'var(--aura-violet)', borderRadius: '50%', boxShadow: '0 0 10px var(--aura-violet)', display: 'inline-block' }} />
          <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.9rem', color: 'hsl(256 22% 65%)' }}>AURA</span>
        </div>

        <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.35rem' }}>Welcome back</h1>
        <p className="page-lead">Sign in to access your cart and order history.</p>

        {err && (
          <motion.div className="form-error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1rem' }}>
            {err}
          </motion.div>
        )}

        <form onSubmit={submit} className="form-stack">
          <div className="field">
            <label className="field__label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'hsl(256 22% 45%)' }} />
              <input
                className="input"
                style={{ paddingLeft: '2.2rem' }}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>
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
                autoComplete="current-password"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'hsl(256 22% 50%)', cursor: 'pointer', padding: '2px' }}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              id="remember"
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              style={{ accentColor: 'var(--aura-violet)', width: 14, height: 14 }}
            />
            <label htmlFor="remember" style={{ fontSize: '0.82rem', color: 'hsl(256 22% 60%)', cursor: 'pointer' }}>
              Keep me signed in
            </label>
          </div>

          <motion.button
            type="submit"
            className="btn btn--primary btn--block"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? 'Signing in…' : 'Log in'}
          </motion.button>
        </form>

        <p className="auth__foot">
          New here? <Link to="/register">Create an account</Link>
        </p>
        <p className="form-hint" style={{ textAlign: 'center', marginTop: '0.75rem' }}>
          Demo admin: <span style={{ color: 'var(--aura-sky)' }}>admin@shop.com</span> / <span style={{ color: 'var(--aura-sky)' }}>Admin123!</span>
        </p>
      </motion.div>
    </div>
  );
}
