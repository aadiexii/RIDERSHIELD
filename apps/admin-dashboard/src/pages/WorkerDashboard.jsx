import { Link } from 'react-router-dom';
import { Shield, Zap, Clock, ArrowLeft } from 'lucide-react';

const FEATURES = [
  {
    Icon: Shield,
    title: 'Zero Touch Claims',
    desc: 'No forms. No calls. Payout arrives automatically.',
  },
  {
    Icon: Zap,
    title: 'Instant UPI Payout',
    desc: 'Money in your account within minutes of disruption.',
  },
  {
    Icon: Clock,
    title: '24/7 Zone Monitoring',
    desc: 'AI watches your zone round the clock.',
  },
];

export default function WorkerDashboard() {
  return (
    <div
      className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-8 py-16"
      style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}
    >
      {/* ── Back link ─────────────────────────────────────────────────────────── */}
      <Link
        to="/insurance"
        className="flex items-center gap-1.5 text-zinc-500 hover:text-white text-xs transition-colors mb-8"
      >
        <ArrowLeft className="w-3 h-3" />
        Back to Insurance
      </Link>

      {/* ── Top section ──────────────────────────────────────────────────────── */}
      <div className="text-center">
        <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-6">
          RiderShield Worker App
        </span>

        <h1 className="text-4xl font-bold text-white leading-tight">
          Protect Your Income.<br />Download the App.
        </h1>

        <p className="text-zinc-400 text-base leading-relaxed max-w-lg mx-auto mt-4">
          Zero-touch parametric insurance for Zomato and Swiggy delivery partners.
          Money in your UPI automatically when disruptions hit your zone.
        </p>
      </div>

      {/* ── QR Code card ─────────────────────────────────────────────────────── */}
      <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-10 max-w-sm w-full text-center mt-10">
        <div className="w-48 h-48 mx-auto bg-[#1a1a1a] border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-1">
          <div className="grid grid-cols-7 gap-0.5 opacity-30">
            {Array.from({ length: 49 }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-sm ${Math.sin(i * 7.3) > 0 ? 'bg-orange-400' : 'bg-zinc-700'}`}
              />
            ))}
          </div>
          <p className="text-zinc-600 text-xs mt-2">Scan to download</p>
        </div>

        <p className="text-zinc-400 text-sm mt-5">Available on Android</p>
        <p className="text-zinc-600 text-xs mt-1">iOS coming soon</p>
      </div>

      {/* ── Features row ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-8 mt-12 max-w-2xl w-full justify-center">
        {FEATURES.map(({ Icon, title, desc }) => (
          <div key={title} className="text-center flex-1">
            <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center mx-auto">
              <Icon className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-white font-semibold text-sm mt-3">{title}</p>
            <p className="text-zinc-500 text-xs mt-1 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
