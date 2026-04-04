import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const LABELS = {
  '/admin':     'Control Center',
  '/claims':    'Claims',
  '/analytics': 'Analytics',
};

export default function AdminBar() {
  const { pathname } = useLocation();

  return (
    <div className="bg-[#0a0a0a] border-b border-white/6 px-8 py-3 flex items-center justify-between">
      {/* Logo */}
      <Link to="/" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        <span className="text-white font-bold text-base">RIDER</span>
        <span className="text-orange-500 font-bold text-base">SHIELD</span>
        {LABELS[pathname] && (
          <span className="ml-2 text-zinc-600 text-base font-normal">/ {LABELS[pathname]}</span>
        )}
      </Link>

      {/* Back link */}
      <Link
        to="/"
        className="flex items-center gap-1.5 text-zinc-500 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Home
      </Link>
    </div>
  );
}
