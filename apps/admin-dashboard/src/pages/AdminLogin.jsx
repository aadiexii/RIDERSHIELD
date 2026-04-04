import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const ROLES = [
  { label: 'SuperAdmin',    id: 'superadmin',  email: 'admin@ridershield.in',  password: 'RiderShield@2026'  },
  { label: 'Zone Manager',  id: 'zonemanager', email: 'zone@ridershield.in',   password: 'ZoneManager@2026'  },
  { label: 'Analyst',       id: 'analyst',     email: 'analyst@ridershield.in',password: 'Analyst@2026'      },
];

const STATS = [
  '2,847 Active Policies',
  'Rs. 4.2L Paid This Week',
  '99.2% Claim Approval Rate',
];

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [activeRole, setActiveRole] = useState(null);

  const selectRole = (role) => {
    setActiveRole(role.id);
    setEmail(role.email);
    setError('');
  };

  const fillDemo = (role) => {
    setActiveRole(role.id);
    setEmail(role.email);
    setPassword(role.password);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed. Please try again.');
        return;
      }
      localStorage.setItem('ridershield_admin_token', data.token);
      localStorage.setItem('ridershield_admin', JSON.stringify(data.admin));
      navigate('/admin');
    } catch {
      setError('Cannot reach server. Make sure the backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result  = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/auth/google/verify`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Google sign-in failed.');
        return;
      }
      localStorage.setItem('ridershield_admin_token', data.token);
      localStorage.setItem('ridershield_admin', JSON.stringify(data.admin));
      navigate('/admin');
    } catch (err) {
      setError(err.message?.includes('popup-closed') ? 'Sign-in cancelled.' : 'Google sign-in failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors placeholder:text-zinc-600';

  return (
    <div
      className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"
      style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}
    >
      {/* ── Left panel ─────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-20 h-screen border-r border-white/6">
        <div className="max-w-md">
          <p className="text-[10px] uppercase tracking-widest text-orange-500 font-bold mb-6">
            RiderShield Admin
          </p>
          <h1 className="text-5xl font-bold leading-tight mb-10">
            <span className="bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
              Protecting India's<br />
              Delivery Workforce<br />
              One Zone at a Time.
            </span>
          </h1>

          <div className="space-y-4 mb-16">
            {STATS.map(s => (
              <div key={s} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                <span className="text-zinc-300 text-sm">{s}</span>
              </div>
            ))}
          </div>

          <p className="text-zinc-600 text-xs">RiderShield Admin Portal v2.0</p>
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12">

        {/* Back to home */}
        <div className="w-full max-w-md mb-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-zinc-500 hover:text-white text-sm transition-colors"
          >
            <span className="text-base leading-none">←</span>
            Back to Home
          </Link>
        </div>

        <div className="w-full max-w-md bg-[#0f0f0f] border border-white/8 rounded-2xl p-8">

          {/* Logo */}
          <div className="mb-6">
            <div className="mb-1">
              <span className="text-white font-bold text-2xl">RIDER</span>
              <span className="text-orange-500 font-bold text-2xl">SHIELD</span>
            </div>
            <p className="text-zinc-400 text-sm">Admin Portal</p>
          </div>

          <div className="border-t border-white/8 mb-6" />

          {/* Role selector */}
          <div className="flex gap-2 mb-6">
            {ROLES.map(r => (
              <button
                key={r.id}
                onClick={() => selectRole(r)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  activeRole === r.id
                    ? 'bg-orange-500/10 border-orange-500/50 text-orange-400'
                    : 'bg-[#1a1a1a] border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-zinc-400 text-sm block mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@ridershield.in"
                className={inputCls}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-zinc-400 text-sm">Password</label>
                <button type="button" className="text-zinc-500 text-xs hover:text-zinc-300 transition-colors">
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`${inputCls} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl py-3.5 transition-colors disabled:opacity-60 text-sm mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In to Dashboard'}
            </button>
          </form>

          {/* Google Sign-In */}
          <div className="mt-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 border-t border-white/8" />
              <span className="text-zinc-600 text-xs px-1">or continue with</span>
              <div className="flex-1 border-t border-white/8" />
            </div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] border border-white/10 hover:bg-[#222] text-white rounded-xl py-3 text-sm font-medium transition-colors disabled:opacity-60"
            >
              {/* Google icon */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </div>

          {/* Demo credentials */}
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 border-t border-white/8" />
              <span className="text-zinc-600 text-xs px-1">Demo Credentials</span>
              <div className="flex-1 border-t border-white/8" />
            </div>

            <div className="space-y-2">
              {ROLES.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => fillDemo(r)}
                  className="w-full bg-[#1a1a1a] rounded-xl p-3 text-left hover:bg-[#222] transition-colors group"
                >
                  <p className="text-zinc-400 text-xs font-semibold mb-0.5 group-hover:text-zinc-200 transition-colors">{r.label}</p>
                  <p className="text-zinc-600 text-xs font-mono group-hover:text-zinc-300 transition-colors">
                    {r.email} / {r.password}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-zinc-700 text-xs text-center mt-6 leading-relaxed">
            This portal is restricted to authorized RiderShield personnel only.<br />
            All actions are logged.
          </p>
        </div>
      </div>
    </div>
  );
}
