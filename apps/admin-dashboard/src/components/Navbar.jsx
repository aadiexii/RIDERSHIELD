import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';

// ─── Page name map for inner navbar ──────────────────────────────────────────
const PAGE_LABELS = {
  '/admin':     'Control Center',
  '/claims':    'Claims',
  '/analytics': 'Analytics',
  '/docs':      'Documentation',
};

const ROLE_DOT = {
  superadmin:  'bg-orange-500',
  zonemanager: 'bg-blue-500',
  analyst:     'bg-green-500',
};

// ─── Inner admin navbar (shown on /admin, /claims, /analytics, /docs) ────────
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
    navigate('/admin/login');
  };

  const pageLabel = PAGE_LABELS[location.pathname] || '';

  return (
    <nav
      className="bg-[#0f0f0f] border-b border-white/8 sticky top-0 z-50 px-8 py-4 flex items-center justify-between"
      style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}
    >
      {/* Left: logo + page name */}
      <div className="flex items-center gap-0">
        <Link to="/">
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
                      { label: 'Dashboard', to: '/admin'     },
            { label: 'Claims',    to: '/claims'    },
            { label: 'Analytics', to: '/analytics' },
            { label: 'Docs',      to: '/docs'      },
            { label: 'Insurance', to: '/insurance' },
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
            to="/admin/login"
            className="text-sm border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 px-4 py-2 rounded-lg transition-all"
          >
            Admin Login
          </Link>
        )}
      </div>
    </nav>
  );
}

// ─── Landing floating pill navbar (shown only on /) ──────────────────────────
function LandingNavbar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const openAuth = () => window.dispatchEvent(new CustomEvent('openAuthModal'));

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .navbar-pill { animation: slideDown 0.35s cubic-bezier(0.4,0,0.2,1) forwards; }
      `}</style>

      {visible && (
        <div className="fixed top-4 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
          <nav
            className="navbar-pill pointer-events-auto bg-black/85 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-8 shadow-2xl"
            style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}
          >
            {/* Logo */}
            <span className="font-bold text-sm shrink-0">
              <span className="text-white">RIDER</span>
              <span className="text-orange-500">SHIELD</span>
            </span>

            {/* Links */}
            <div className="hidden sm:flex items-center gap-6 text-sm">
              {[
                ['How It Works', '#how-it-works'],
                ['Features',     '#features'    ],
                ['Plans',        '#plans'       ],
                ['Insurance',    '/insurance'   ],
                ['Docs',         '/docs'        ],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={openAuth}
              className="shrink-0 bg-zinc-900 border border-white/12 rounded-full px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
            >
              <span className="text-orange-500 font-mono mr-1">&gt;_</span>
              Get Started
            </button>
          </nav>
        </div>
      )}
    </>
  );
}

// ─── Root export — picks the right variant ───────────────────────────────────
export default function Navbar() {
  const { pathname } = useLocation();

  // Landing page → pill navbar
  if (pathname === '/') return <LandingNavbar />;

  // Login + worker → no navbar
  if (pathname === '/admin/login' || pathname === '/worker') return null;

  // All other inner pages → solid inner navbar
  return <InnerNavbar />;
}
