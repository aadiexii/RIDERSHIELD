import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Toast from '../components/Toast';
import AnimatedCounter from '../components/AnimatedCounter';
import StatCard from '../components/StatCard';

import {
  ShieldAlert,
  Activity,
  FileText,
  Users,
  TrendingUp,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';

const TYPE_COLORS = {
  rain:   'bg-blue-500/10  text-blue-400  border-blue-500/20',
  flood:  'bg-cyan-500/10  text-cyan-400  border-cyan-500/20',
  heat:   'bg-orange-500/10 text-orange-400 border-orange-500/20',
  smog:   'bg-zinc-500/10  text-zinc-400  border-zinc-500/20',
  curfew: 'bg-red-500/10   text-red-400   border-red-500/20',
};

const CHECK_LABELS = {
  claimVelocity:     'Velocity',
  trustScore:        'Trust',
  timePattern:       'Hours',
  gpsCluster:        'GPS',
  deviceFingerprint: 'Device',
};

export default function AdminDashboard() {
  const token = localStorage.getItem('ridershield_admin_token');

  const [toast, setToast] = useState(null);
  const [claimVelocity, setClaimVelocity] = useState({ count: 0, alert: false });
  const [claims, setClaims] = useState([]);
  
  // Fraud state is now purely analytical/display (simulation moved to Simulation Studio)
  const [fraudAlerts, setFraudAlerts] = useState([]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  };

  const refreshClaims = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/claims`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setClaims(data.claims || data);
    } catch { /* silently fail */ }
  };

  useEffect(() => { refreshClaims(); }, []); // eslint-disable-line

  useEffect(() => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const recentClaims = claims.filter(c => new Date(c.timestamp).getTime() > fiveMinutesAgo);
    setClaimVelocity({ count: recentClaims.length, alert: recentClaims.length > 50 });
  }, [claims]);

  // Analytics Derivations
  const totalClaims = claims.length;
  const totalPayout = claims.reduce((s, c) => s + (c.payoutAmount || c.payout_amount || 0), 0);
  const avgPayout   = totalClaims > 0 ? totalPayout / totalClaims : 0;

  // ── 4. Zones ──────────────────────────────────────────────────────────────────
  const [zones,        setZones]        = useState([]);
  const [zonesLoading, setZonesLoading] = useState(true);

  const fetchZones = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${API_URL}/zones`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setZones(data.zones || []); setZonesLoading(false); })
      .catch(() => setZonesLoading(false));
  };

  useEffect(() => { fetchZones(); }, []); // eslint-disable-line

  // ── 5. Live Stats ─────────────────────────────────────────────────────────────
  const [liveStats, setLiveStats] = useState(null);

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/analytics/live`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json();
        setLiveStats(data);
      } catch (err) {
        console.log('Auto-refresh failed:', err);
      }
    };
    
    fetchLiveStats();
    const interval = setInterval(fetchLiveStats, 10000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line

  const recentClaimsList = claims.slice(0, 5);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pb-24" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
      
      {/* Toast Notification */}
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* Claim Velocity Alert Banner */}
      {claimVelocity.alert && (
        <div className="max-w-7xl mx-auto px-8 pt-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              <p className="text-red-400 text-sm font-medium">
                Claim Velocity Alert — {claimVelocity.count} claims in the last 5 minutes
              </p>
            </div>
            <p className="text-zinc-500 text-xs mt-1 ml-4">
              Possible fraud ring detected — auto-approvals paused for this zone
            </p>
          </div>
        </div>
      )}

      {/* ══ HEADER ════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-8 pt-6 pb-6">
        <div className="flex items-end justify-between border-b border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white leading-tight">Control Center</h1>
              <span className="flex items-center gap-1.5 bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Live Feed
              </span>
            </div>
            <p className="text-zinc-500 text-sm">Real-time macro operations overview and claims validation stream.</p>
          </div>
        </div>
      </div>

      {/* ══ KPI CARDS ══════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-3 gap-6 items-start">
        {/* KPI 1: Claims */}
        <div className="bg-[#0f0f0f] border-l-4 border-l-blue-500 border-t border-r border-b border-white/8 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-white/15 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5 bg-blue-500 w-24 h-24 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <div className="flex justify-between items-start">
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-4">Total Settled</p>
            <div className="bg-blue-500/10 p-2 rounded-lg"><FileText className="w-4 h-4 text-blue-400" /></div>
          </div>
          <h3 className="text-3xl font-bold text-white font-mono tracking-tight">{liveStats?.totalClaims ?? totalClaims}</h3>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-green-400 text-xs font-bold bg-green-500/10 px-1.5 py-0.5 rounded">+14.2%</span>
            <span className="text-zinc-600 text-[10px] uppercase tracking-wider">vs last week</span>
          </div>
        </div>

        {/* KPI 2: Payout */}
        <div className="bg-[#0f0f0f] border-l-4 border-l-orange-500 border-t border-r border-b border-white/8 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-white/15 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5 bg-orange-500 w-24 h-24 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <div className="flex justify-between items-start">
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-4">Total Payouts</p>
            <div className="bg-orange-500/10 p-2 rounded-lg"><Activity className="w-4 h-4 text-orange-400" /></div>
          </div>
          <h3 className="text-3xl font-bold text-white font-mono tracking-tight">₹ {Math.round(liveStats?.totalPayout ?? totalPayout).toLocaleString('en-IN')}</h3>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-green-400 text-xs font-bold bg-green-500/10 px-1.5 py-0.5 rounded">+8.1%</span>
            <span className="text-zinc-600 text-[10px] uppercase tracking-wider">vs last week</span>
          </div>
        </div>

        {/* KPI 3: Workers */}
        <div className="bg-[#0f0f0f] border-l-4 border-l-teal-500 border-t border-r border-b border-white/8 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-white/15 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5 bg-teal-500 w-24 h-24 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <div className="flex justify-between items-start">
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-4">Active Coverage</p>
            <div className="bg-teal-500/10 p-2 rounded-lg"><Users className="w-4 h-4 text-teal-400" /></div>
          </div>
          <h3 className="text-3xl font-bold text-white font-mono tracking-tight">{liveStats?.activePolicies ?? '—'}</h3>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-amber-400 text-xs font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">+2.4%</span>
            <span className="text-zinc-600 text-[10px] uppercase tracking-wider">vs last week</span>
          </div>
        </div>
      </div>

      {/* ══ MAIN DASHBOARD CONTENT ═════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-8 mt-8 grid lg:grid-cols-[2fr_1fr] gap-6 items-start">
        
        {/* Left Col: Claims Stream */}
        <section className="bg-[#0f0f0f] border border-white/8 rounded-2xl flex flex-col items-stretch overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recent Claims Stream</h2>
            </div>
            {totalClaims > 0 && (
              <Link to="/claims" className="text-orange-400 hover:text-orange-300 text-xs font-semibold flex items-center gap-1 transition-colors">
                View Library <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
          
          <div className="p-5 flex flex-col gap-3">
            {recentClaimsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl py-16 text-center">
                <Activity className="w-8 h-8 text-zinc-600 mb-3 opacity-50" />
                <p className="text-zinc-500 text-sm">Awaiting new claim data pipeline.</p>
              </div>
            ) : (
              recentClaimsList.map((c, idx) => {
                const id     = c.claimId || c.id || idx;
                const zone   = c.zone || c.city || '—';
                const amount = c.payoutAmount || c.payout_amount || 0;
                const ts     = c.timestamp ? new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                return (
                  <div key={id} className={`bg-[#1a1a1a] rounded-xl p-4 border-l-2 ${c.status === 'triggered' ? 'border-amber-500' : c.status === 'approved' ? 'border-green-500' : 'border-blue-500'}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                       <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${TYPE_COLORS[c.type] || 'bg-white/5 text-zinc-400 border-white/10'}`}>{c.type}</span>
                          <span className="text-white font-medium text-sm">{zone}</span>
                       </div>
                       <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1.5 text-xs text-zinc-400 uppercase tracking-wider font-semibold">
                            <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'triggered' ? 'bg-amber-400' : c.status === 'approved' ? 'bg-white' : 'bg-green-400'}`} />
                            {c.status}
                          </span>
                          <p className={`font-mono text-sm ${c.status === 'paid' ? 'text-green-400' : c.status === 'approved' ? 'text-white' : 'text-amber-400'}`}>
                            ₹ {Math.round(amount).toLocaleString('en-IN')}
                          </p>
                          <span className="text-zinc-600 text-xs w-16 text-right">{ts}</span>
                       </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right Col: AI Fraud Alerts Preview */}
        <section className="bg-[#0f0f0f] border border-white/8 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">AI Fraud Flags</h2>
            </div>
          </div>
          <div className="p-5">
            {fraudAlerts.length === 0 ? (
              <div className="bg-[#1a1a1a] border border-dashed border-white/10 rounded-xl py-12 flex flex-col items-center justify-center text-center">
                <ShieldAlert className="w-6 h-6 text-green-500/50 mb-3" />
                <p className="text-white font-medium text-sm mb-1">System Secure</p>
                <p className="text-zinc-500 text-xs px-6">No fraudulent telemetry detected recently. Run a disruption simulation to view checks.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {fraudAlerts.map(alert => (
                  <div key={alert.id} className="bg-[#1a1a1a] rounded-xl p-3 border-l-2 border-red-500">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-zinc-300 text-xs font-semibold">{alert.zone}</p>
                      <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-bold uppercase">{alert.fraudRiskLevel} Risk</span>
                    </div>
                    <div className="text-orange-400 text-xs font-mono mb-1">Match: {alert.confidenceScore}%</div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Quick Link block */}
            <div className="mt-4 pt-4 border-t border-white/5">
                <Link to="/simulation" className="flex items-center justify-center gap-2 w-full py-2 bg-white/5 hover:bg-white/10 text-zinc-300 text-xs rounded-lg transition-colors group">
                   Run Synthetic Attack <ArrowRight className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300" />
                </Link>
            </div>
          </div>
        </section>
      </div>

    </main>
  );
}
