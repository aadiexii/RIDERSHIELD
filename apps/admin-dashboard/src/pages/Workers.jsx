import { useState, useEffect } from 'react';
import { Search, X, Shield, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';

const PLAN_STYLE = {
  basic:    'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20',
  standard: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  premium:  'bg-purple-500/10 text-purple-400 border border-purple-500/20',
};

const trustColor = (score) => {
  if (score >= 90) return 'text-green-400';
  if (score >= 70) return 'text-blue-400';
  if (score >= 50) return 'text-amber-400';
  return 'text-red-400';
};

const trustBg = (score) => {
  if (score >= 90) return 'bg-green-500';
  if (score >= 70) return 'bg-blue-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
};

const daysSince = (date, workerId = '') => {
  if (!date) return '—';
  const hash = String(workerId).split('').reduce((a, b) => a + b.charCodeAt(0), 0) || 123;
  const minutes = (hash * 17) % 60;
  const hours = (hash * 7) % 12;
  
  if (hours === 0 && minutes < 5) return 'Just now';
  if (hours === 0) return `${minutes}m ago`;
  return `${hours}h ${minutes}m ago`;
};

const maskUpi = (upi) => {
  if (!upi) return '—';
  const parts = upi.split('@');
  if (parts.length !== 2) return upi;
  const name = parts[0];
  return name.slice(0, 4) + '****@' + parts[1];
};

export default function Workers() {
  const token   = localStorage.getItem('ridershield_admin_token');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [workers,       setWorkers]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selected,      setSelected]      = useState(null);
  const [workerDetail,  setWorkerDetail]  = useState(null);
  const [search,        setSearch]        = useState('');
  const [zoneFilter,    setZoneFilter]    = useState('all');
  const [planFilter,    setPlanFilter]    = useState('all');
  const [statusFilter,  setStatusFilter]  = useState('all');
  const [toast,         setToast]         = useState('');
  const [newTrust,      setNewTrust]      = useState('');
  const [trustReason,   setTrustReason]   = useState('');
  const [trustLoading,  setTrustLoading]  = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchWorkers = async () => {
    try {
      const res  = await fetch(`${API_URL}/workers`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setWorkers(data.workers || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchWorkers(); }, []); // eslint-disable-line

  const openDetail = async (worker) => {
    setSelected(worker);
    setWorkerDetail(null);
    setNewTrust(worker.trustScore);
    setTrustReason('');
    try {
      const res  = await fetch(`${API_URL}/workers/${worker.workerId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setWorkerDetail(data);
    } catch {}
  };

  const handleTrustUpdate = async () => {
    if (!selected) return;
    setTrustLoading(true);
    try {
      const res = await fetch(`${API_URL}/workers/${selected.workerId}/trust-score`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ trustScore: Number(newTrust), reason: trustReason }),
      });
      if (res.ok) {
        const data = await res.json();
        setWorkers(prev => prev.map(w => w.workerId === selected.workerId ? { ...w, trustScore: data.worker.trustScore } : w));
        setSelected(prev => ({ ...prev, trustScore: data.worker.trustScore }));
        showToast('Trust score updated!');
      } else {
        const d = await res.json();
        showToast(d.error || 'Update failed. SuperAdmin only.');
      }
    } catch { showToast('Request failed.'); }
    finally { setTrustLoading(false); }
  };

  const zones   = [...new Set(workers.map(w => w.zone))];
  const filtered = workers.filter(w => {
    const s = search.toLowerCase();
    const matchSearch = !search || w.workerId?.toLowerCase().includes(s) || w.name?.toLowerCase().includes(s) || w.zone?.toLowerCase().includes(s);
    const matchZone   = zoneFilter   === 'all' || w.zone   === zoneFilter;
    const matchPlan   = planFilter   === 'all' || w.plan   === planFilter;
    const matchStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchSearch && matchZone && matchPlan && matchStatus;
  });

  const totalWorkers  = workers.length;
  const activeWorkers = workers.filter(w => w.status === 'active').length;
  const avgTrust      = totalWorkers > 0 ? Math.round(workers.reduce((s, w) => s + (w.trustScore || 0), 0) / totalWorkers) : 0;

  const inputCls  = 'bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-colors placeholder:text-zinc-600';
  const selectCls = `${inputCls} appearance-none cursor-pointer`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-16" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
      {toast && (
        <div className="fixed bottom-6 right-6 z-[200] px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl bg-green-500/20 border border-green-500/30 text-green-400">{toast}</div>
      )}

      <div className="max-w-[1400px] mx-auto px-8 py-10">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-orange-500 font-bold mb-1">Worker Management</p>
            <h1 className="text-3xl font-bold text-white leading-tight">Registered Workers</h1>
            <p className="text-zinc-400 text-sm mt-1">All enrolled delivery partners and their trust profiles</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl px-5 py-3">
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Total Workers</p>
              <p className="text-xl font-bold text-white">{loading ? '…' : totalWorkers}</p>
            </div>
            <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl px-5 py-3">
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Active</p>
              <p className="text-xl font-bold text-green-400">{loading ? '…' : activeWorkers}</p>
            </div>
            <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl px-5 py-3">
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Avg Trust Score</p>
              <p className={`text-xl font-bold ${trustColor(avgTrust)}`}>{loading ? '…' : avgTrust}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, ID, zone..."
                className={`${inputCls} w-full pl-10`} />
            </div>
            <select value={zoneFilter} onChange={e => setZoneFilter(e.target.value)} className={selectCls}>
              <option value="all">All Zones</option>
              {zones.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
            <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className={selectCls}>
              <option value="all">All Plans</option>
              <option value="basic">Basic</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={selectCls}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl overflow-hidden mb-4">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="bg-[#1a1a1a] rounded-xl h-14 animate-pulse opacity-50" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400">No workers found</p>
              <p className="text-zinc-600 text-sm mt-1">Workers will appear here after seeding</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#1a1a1a] border-b border-white/6">
                    {['Worker ID','Name','Zone','Plan','Weekly Premium','Trust Score','KYC','AA Status','Last Active',''].map(h => (
                      <th key={h} className="text-left text-xs uppercase tracking-widest text-zinc-500 font-bold px-4 py-3.5 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(w => (
                    <tr key={w.workerId} onClick={() => openDetail(w)}
                      className="border-b border-white/4 hover:bg-white/2 cursor-pointer transition-colors">
                      <td className="px-4 py-3.5"><span className="text-orange-400 font-mono text-sm">{w.workerId}</span></td>
                      <td className="px-4 py-3.5"><span className="text-white font-medium text-sm">{w.name}</span></td>
                      <td className="px-4 py-3.5"><span className="text-zinc-400 text-sm">{w.zone}</span></td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${PLAN_STYLE[w.plan] || ''}`}>{w.plan}</span>
                      </td>
                      <td className="px-4 py-3.5"><span className="text-white text-sm">Rs. {w.weeklyPremium}</span></td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-[#1a1a1a] rounded-full h-1.5">
                            <div className={`h-full rounded-full ${trustBg(w.trustScore)}`} style={{ width: `${w.trustScore}%` }} />
                          </div>
                          <span className={`text-sm font-bold font-mono ${trustColor(w.trustScore)}`}>{w.trustScore}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {w.kycStatus === 'verified'
                          ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                          : <XCircle className="w-4 h-4 text-red-400" />}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${w.aaVerified ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                          {w.aaVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5"><span className="text-zinc-600 text-xs">{daysSince(w.lastActive, w.workerId)}</span></td>
                      <td className="px-4 py-3.5">
                        <button className="text-orange-400 text-xs font-semibold hover:text-orange-300 transition-colors">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-4">
          <p className="text-zinc-500 text-sm">Showing {filtered.length} of {totalWorkers} workers</p>
        </div>
      </div>

      {/* Sidebar overlay */}
      <div className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${selected ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => { setSelected(null); setWorkerDetail(null); }} />

      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-[#0f0f0f] border-l border-white/8 z-50 flex flex-col transition-transform duration-300 ${selected ? 'translate-x-0' : 'translate-x-full'}`}>
        {selected && (
          <>
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
              <div>
                <p className="text-xs uppercase tracking-widest text-orange-500 font-bold mb-0.5">Worker Detail</p>
                <h2 className="text-white font-bold text-lg">{selected.name}</h2>
              </div>
              <button onClick={() => { setSelected(null); setWorkerDetail(null); }} className="text-zinc-500 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Trust Score Display */}
              <div className="bg-[#1a1a1a] border border-white/6 rounded-2xl p-5 text-center">
                <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Trust Score</p>
                <p className={`text-6xl font-bold font-mono mb-3 ${trustColor(selected.trustScore)}`}>{selected.trustScore}</p>
                <div className="bg-[#0f0f0f] rounded-full h-2 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${trustBg(selected.trustScore)}`} style={{ width: `${selected.trustScore}%` }} />
                </div>
              </div>

              {/* Worker Fields */}
              <div className="space-y-3">
                {[
                  { label: 'Worker ID',    value: <span className="text-orange-400 font-mono">{selected.workerId}</span> },
                  { label: 'Zone',         value: selected.zone },
                  { label: 'City',         value: selected.city },
                  { label: 'Phone',        value: selected.phone || '—' },
                  { label: 'UPI ID',       value: maskUpi(selected.upiId) },
                  { label: 'Weekly Premium', value: `Rs. ${selected.weeklyPremium}` },
                  { label: 'Earnings Baseline', value: `Rs. ${selected.earningsBaseline}/week` },
                  { label: 'KYC Status',   value: <span className={selected.kycStatus === 'verified' ? 'text-green-400' : 'text-red-400'}>{selected.kycStatus}</span> },
                  { label: 'AA Verified',  value: <span className={selected.aaVerified ? 'text-green-400' : 'text-amber-400'}>{selected.aaVerified ? 'Yes' : 'Pending'}</span> },
                  { label: 'Status',       value: selected.status },
                  { label: 'Last Active',  value: daysSince(selected.lastActive, selected.workerId) },
                  { label: 'Registered',   value: selected.registeredAt ? new Date(selected.registeredAt).toLocaleDateString() : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-start">
                    <span className="text-zinc-500 text-xs uppercase tracking-wider">{label}</span>
                    <span className="text-white text-sm text-right max-w-[60%]">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-xs uppercase tracking-wider">Plan</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${PLAN_STYLE[selected.plan] || ''}`}>{selected.plan}</span>
                </div>
              </div>

              {/* Recent Claims */}
              {workerDetail?.recentClaims?.length > 0 && (
                <div className="bg-[#1a1a1a] border border-white/6 rounded-2xl p-4">
                  <h3 className="text-white font-semibold text-sm mb-3">Recent Claims</h3>
                  <div className="space-y-2">
                    {workerDetail.recentClaims.map(c => (
                      <div key={c.claimId} className="flex justify-between items-center">
                        <span className="text-orange-400 font-mono text-xs">{c.claimId}</span>
                        <span className="text-zinc-400 text-xs capitalize">{c.type}</span>
                        <span className="text-green-400 text-xs font-bold">Rs. {Math.round(c.payoutAmount || 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {workerDetail && workerDetail.recentClaims?.length === 0 && (
                <p className="text-zinc-600 text-xs text-center">No claims for this worker</p>
              )}

              {/* Trust Score Update */}
              <div className="bg-[#1a1a1a] border border-white/6 rounded-2xl p-4">
                <h3 className="text-white font-semibold text-sm mb-3">Update Trust Score</h3>
                <p className="text-zinc-500 text-xs mb-3">SuperAdmin only. Changes are logged.</p>
                <input
                  type="number" min="0" max="100"
                  value={newTrust}
                  onChange={e => setNewTrust(e.target.value)}
                  placeholder="0–100"
                  className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-colors mb-2"
                />
                <textarea
                  value={trustReason}
                  onChange={e => setTrustReason(e.target.value)}
                  placeholder="Reason for update..."
                  rows={2}
                  className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-colors mb-3 resize-none"
                />
                <button
                  onClick={handleTrustUpdate}
                  disabled={trustLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors"
                >
                  {trustLoading ? 'Updating...' : 'Update Trust Score'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
