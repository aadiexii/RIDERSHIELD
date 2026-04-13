import { useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import SearchModal from './components/SearchModal';

// ─── OS detection for keyboard hint ──────────────────────────────────────────
const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);
const KBD   = isMac ? '⌘' : 'Ctrl';

// ─── Inner navbar (docs / sponsor / worker pages) ────────────────────────────
function InnerNavbar() {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  // Global Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        className="bg-[#0f0f0f] border-b border-white/8 sticky top-0 z-50 px-6 lg:px-8 h-16 flex items-center justify-between gap-4"
        style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}
      >
        {/* ── Left: logo + breadcrumb ── */}
        <div className="flex items-center gap-0 shrink-0">
          <Link to="/" className="flex items-center">
            <span className="text-white font-bold text-sm">RIDER</span>
            <span className="text-orange-500 font-bold text-sm">SHIELD</span>
          </Link>
          {location.pathname !== '/' && (() => {
            const page = {
              '/docs':    'Documentation',
              '/sponsor': 'Sponsor',
              '/worker':  'Download App',
            }[location.pathname];
            return page ? (
              <>
                <span className="text-zinc-700 text-base mx-2.5 font-light">/</span>
                <span className="text-zinc-400 text-sm">{page}</span>
              </>
            ) : null;
          })()}
        </div>

        {/* ── Center: Search bar ── */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden sm:flex flex-1 max-w-xs lg:max-w-sm items-center gap-2.5 bg-white/4 hover:bg-white/6 border border-white/8 hover:border-white/14 rounded-xl px-3.5 py-2 transition-all group"
        >
          <Search className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
          <span className="flex-1 text-left text-sm text-zinc-600 group-hover:text-zinc-500 transition-colors">
            Search docs...
          </span>
          <span className="hidden md:flex items-center gap-0.5 text-[10px] text-zinc-700 font-mono shrink-0">
            <kbd className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5">{KBD}</kbd>
            <kbd className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5">K</kbd>
          </span>
        </button>

        {/* ── Right: nav links ── */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Home */}
          <Link
            to="/"
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
              isActive('/')
                ? 'text-orange-400 font-semibold bg-orange-500/8'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Home
          </Link>

          {/* Docs */}
          <Link
            to="/docs"
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
              isActive('/docs')
                ? 'text-orange-400 font-semibold bg-orange-500/8'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Docs
          </Link>

          {/* Sponsor */}
          <Link
            to="/sponsor"
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
              isActive('/sponsor')
                ? 'text-orange-400 font-semibold bg-orange-500/8'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Sponsor
          </Link>

          {/* Download App — highlighted pill */}
          <Link
            to="/worker"
            className="ml-2 flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <span className="text-base leading-none">↓</span>
            <span className="hidden sm:inline">Download App</span>
            <span className="sm:hidden">App</span>
          </Link>
        </div>
      </nav>

      {/* Search modal */}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </>
  );
}

// ─── Landing floating pill navbar ─────────────────────────────────────────────
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
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="font-bold text-sm shrink-0 flex items-center hover:opacity-80 transition-opacity focus:outline-none"
            >
              <span className="text-white">RIDER</span>
              <span className="text-orange-500">SHIELD</span>
            </button>

            <div className="hidden sm:flex items-center gap-6 text-sm">
              {[
                ['How It Works', '#how-it-works'],
                ['Features',     '#features'    ],
                ['Plans',        '#plans'       ],
                ['Docs',         '/docs'        ],
                ['Sponsor',      '/sponsor'     ],
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

// ─── Root export ──────────────────────────────────────────────────────────────
export default function Navbar() {
  const { pathname } = useLocation();
  if (pathname === '/') return <LandingNavbar />;
  return <InnerNavbar />;
}
