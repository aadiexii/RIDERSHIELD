import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';

// ─── Page name map for inner navbar ──────────────────────────────────────────
const PAGE_LABELS = {
  '/dashboard': 'Control Center',
  '/claims':    'Claims',
  '/analytics': 'Analytics',
  '/workers':   'Workers',
  '/zones':     'Zone Map',
  '/docs':      'Documentation',
};

const ROLE_DOT = {
  superadmin:  'bg-orange-500',
  zonemanager: 'bg-blue-500',
  analyst:     'bg-green-500',
};

// ─── Inner admin navbar ───────────────────────────────────────────────────────
function InnerNavbar() {
  const location = useLocation();
  const navigate  = useNavigate();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ridershield_admin');
      if (stored) setAdmin(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ridershield_admin_token');
    localStorage.removeItem('ridershield_admin');
    navigate('/login');
  };

  const pageLabel = PAGE_LABELS[location.pathname] || '';

  return (
    <nav
      className="bg-[#0f0f0f] border-b border-white/8 sticky top-0 z-50 px-8 py-4 flex items-center justify-between"
      style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}
    >
      {/* Left: logo + page name */}
      <div className="flex items-center gap-0">
        <Link to="/dashboard">
          <span className="text-white font-bold text-base">RIDER</span>
          <span className="text-orange-500 font-bold text-base">SHIELD</span>
        </Link>
        {pageLabel && (
          <>
            <span className="text-zinc-700 text-lg mx-3 font-light">/</span>
            <span className="text-zinc-300 text-sm font-medium">{pageLabel}</span>
          </>
        )}
      </div>

      {/* Center: nav links */}
      {admin !== null && (
        <div className="hidden md:flex items-center gap-6">
          {[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'Claims',    to: '/claims'    },
            { label: 'Analytics', to: '/analytics' },
            { label: 'Workers',   to: '/workers'   },
            { label: 'Zone Map',  to: '/zones'     },
            { label: 'Docs',      to: '/docs'      },
          ].map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm transition-colors ${
                location.pathname === to
                  ? 'text-orange-400 font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}

      {/* Right: admin pill + logout */}
      <div className="flex items-center gap-3">
        {admin ? (
          <>
            <div className="bg-[#1a1a1a] border border-white/10 rounded-full px-4 py-2 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full shrink-0 ${ROLE_DOT[admin.role] || 'bg-zinc-500'}`} />
              <span className="text-white text-sm font-medium">{admin.name}</span>
              <span className="text-zinc-500 text-xs capitalize">{admin.role}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-zinc-500 hover:text-red-400 transition-colors p-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="text-sm border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 px-4 py-2 rounded-lg transition-all"
          >
            Admin Login
          </Link>
        )}
      </div>
    </nav>
  );
}

// ─── Root export — hide on login, show inner on all other pages ───────────────
export default function Navbar() {
  const { pathname } = useLocation();
  if (pathname === '/login') return null;
  return <InnerNavbar />;
}
