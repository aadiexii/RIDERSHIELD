import { useState, useEffect, useRef } from 'react';
import { Search, X, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Timer } from 'lucide-react';

const TYPE_STYLE = {
  rain:   'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  flood:  'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
  heat:   'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  smog:   'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20',
  curfew: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

const STATUS_STYLE = {
  paid:      'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  approved:  'bg-green-500/10 text-green-400 border border-green-500/20',
  triggered: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  rejected:  'bg-red-500/10 text-red-400 border border-red-500/20',
};

const VERIFY_CHECKS = [
  'Location Verified', 'Activity Confirmed', 'No GPS Spoofing',
  'No Duplicate Claim', 'Behavioral Pattern Normal',
];

export default function ClaimsPage() {
  const [search,        setSearch]        = useState('');
  const [statusFilter,  setStatusFilter]  = useState('all');
  const [typeFilter,    setTypeFilter]    = useState('all');
  const [selected,      setSelected]      = useState(null);
  const [claims,        setClaims]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [toast,         setToast]         = useState('');
  const [toastType,     setToastType]     = useState('success');
  const [actionSuccess, setActionSuccess] = useState(null);
  const [flashNew,      setFlashNew]      = useState(false);
  const prevCountRef = useRef(0);

  const token = localStorage.getItem('ridershield_admin_token');

  const showToast = (msg, type = 'success') => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(''), 3000);
  };

  // ── Fetch claims ────────────────────────────────────────────────────────────
  const fetchClaims = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res  = await fetch(`${API_URL}/claims`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const newClaims = data.claims || data || [];
      if (prevCountRef.current !== 0 && newClaims.length > prevCountRef.current) {
        setFlashNew(true);
        setTimeout(() => setFlashNew(false), 3000);
      }
      prevCountRef.current = newClaims.length;
      setClaims(newClaims);
    } catch (err) {
      console.log('Claims fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
    const interval = setInterval(fetchClaims, 30000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line

  // ── Status update ────────────────────────────────────────────────────────────
  const updateClaimStatus = async (claimId, newStatus) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/claims/${claimId}/status`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setClaims(prev => prev.map(c =>
          (c.claimId === claimId || c.id === claimId) ? { ...c, status: newStatus } : c
        ));
        setSelected(prev =>
          prev && (prev.claimId === claimId || prev.id === claimId)
            ? { ...prev, status: newStatus } : prev
        );
        setActionSuccess(newStatus);
        setTimeout(() => setActionSuccess(null), 2000);
        showToast(`Claim marked as ${newStatus}.`);
      } else {
        const d = await res.json();
        showToast(d.error || 'Backend update failed.', 'warn');
      }
    } catch {
      showToast('Cannot reach backend — local state updated only.', 'warn');
    }
  };

  // Normalise claim fields (backend uses camelCase + legacy snake_case)
  const norm = (c, idx) => ({
    id:            c.claimId || c.id || `CLM-${idx}`,
    worker:        c.workerId || c.worker || '—',
    zone:          c.zone || c.city || '—',
    type:          c.type || c.disruption_type || '—',
    severity:      c.severity ?? c.severity_score ?? 0,
    hours:         c.hours || c.hours_affected || 0,
    payout:        c.payoutAmount || c.payout_amount || c.payout || 0,
    status:        c.status || 'triggered',
    conf:          c.confidence || c.conf || 0,
    time:          c.timestamp ? new Date(c.timestamp).toLocaleTimeString() : '—',
    autoTriggered: c.autoTriggered || false,
    signalDetail:  c.signalDetail || c.detail || null,
  });

  const normalized = claims.map(norm);

  const filtered = normalized.filter(c => {
    const matchSearch = !search ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.worker.toLowerCase().includes(search.toLowerCase()) ||
      c.zone.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchType   = typeFilter   === 'all' || c.type   === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const inputCls  = 'bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-colors placeholder:text-zinc-600';
  const selectCls = `${inputCls} appearance-none cursor-pointer`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-16" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>

      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl transition-all ${
          toastType === 'success'
            ? 'bg-green-500/20 border border-green-500/30 text-green-400'
            : 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
        }`}>
          {toast}
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-8 py-10">

        {/* ══ 1. HEADER ═════════════════════════════════════════════════════════ */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-orange-500 font-bold mb-1">Claims Management</p>
            <h1 className="text-3xl font-bold text-white leading-tight">All Claims</h1>
            <p className="text-zinc-400 text-sm mt-1">Real-time parametric claim tracking and verification</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl px-5 py-3">
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Total Claims</p>
              <p className="text-xl font-bold text-white">{loading ? '…' : claims.length}</p>
            </div>
            <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl px-5 py-3">
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Approved</p>
              <p className="text-xl font-bold text-green-400">{loading ? '…' : normalized.filter(c => c.status === 'approved' || c.status === 'paid').length}</p>
            </div>
            <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl px-5 py-3">
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Pending</p>
              <p className="text-xl font-bold text-amber-400">{loading ? '…' : normalized.filter(c => c.status === 'triggered').length}</p>
            </div>
          </div>
        </div>

        {/* ══ 2. FILTER BAR ══════════════════════════════════════════════════════ */}
        <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by zone, worker ID..."
                className={`${inputCls} w-full pl-10`} />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={selectCls}>
              <option value="all">All Status</option>
              <option value="triggered">Triggered</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="rejected">Rejected</option>
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className={selectCls}>
              <option value="all">All Types</option>
              <option value="rain">Rain</option>
              <option value="flood">Flood</option>
              <option value="heat">Heat</option>
              <option value="smog">AQI</option>
              <option value="curfew">Curfew</option>
            </select>
            <select className={selectCls}>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>This month</option>
            </select>
          </div>
        </div>

        {/* ══ 3. TABLE ═══════════════════════════════════════════════════════════ */}
        <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl overflow-hidden mb-4">

          {loading ? (
            // 5 skeleton rows
            <div className="space-y-2 p-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="bg-[#1a1a1a] rounded-xl h-14 mb-2 animate-pulse opacity-50"></div>
              ))}
            </div>
          ) : claims.length === 0 ? (
            // Empty state
            <div className="text-center py-12">
              <div className="w-12 h-12 mx-auto bg-zinc-800 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-zinc-400">No claims yet</p>
              <p className="text-zinc-600 text-sm mt-1">Claims will appear here when disruptions are triggered</p>
            </div>
          ) : (
            // Table
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#1a1a1a] border-b border-white/6">
                    {['Claim ID','Worker','Zone','Type','Severity','Hours','Payout','Status','Confidence','Time'].map(h => (
                      <th key={h} className="text-left text-xs uppercase tracking-widest text-zinc-500 font-bold px-4 py-3.5 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <tr key={c.id} onClick={() => setSelected(c)}
                      className={`border-b border-white/4 transition-colors cursor-pointer ${
                        flashNew && i === 0 ? 'bg-green-500/20 shadow-[inset_0_0_15px_rgba(34,197,94,0.3)]' : 'hover:bg-white/2'
                      }`}>
                      <td className="px-4 py-3.5"><span className="text-orange-400 font-mono text-sm">{c.id}</span></td>
                      <td className="px-4 py-3.5"><span className="text-white font-medium text-sm">{c.worker}</span></td>
                      <td className="px-4 py-3.5"><span className="text-zinc-400 text-sm">{c.zone}</span></td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${TYPE_STYLE[c.type] || 'bg-white/5 text-zinc-400 border border-white/10'}`}>{c.type}</span>
                          {c.autoTriggered && (
                            <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs px-2 py-0.5 rounded-full">Auto</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5"><span className="text-white text-sm">{c.severity}</span></td>
                      <td className="px-4 py-3.5"><span className="text-zinc-400 text-sm">{c.hours}h</span></td>
                      <td className="px-4 py-3.5"><span className="text-green-400 font-bold text-sm">Rs. {Math.round(c.payout)}</span></td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap ${STATUS_STYLE[c.status] || 'bg-white/5 text-zinc-400 border border-white/10'}`}>{c.status}</span>
                      </td>
                      <td className="px-4 py-3.5"><span className="text-orange-400 font-mono text-sm">{c.conf}%</span></td>
                      <td className="px-4 py-3.5"><span className="text-zinc-600 text-xs whitespace-nowrap">{c.time}</span></td>
                    </tr>
                  ))}
                  {filtered.length === 0 && claims.length > 0 && (
                    <tr><td colSpan={10} className="text-center py-16 text-zinc-500 text-sm">No claims match your filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ══ 4. PAGINATION ══════════════════════════════════════════════════════ */}
        <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-4 flex items-center justify-between">
          <p className="text-zinc-500 text-sm">Showing {filtered.length} of {claims.length} claims</p>
          <div className="flex items-center gap-1">
            <button className="flex items-center gap-1 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-sm">
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            {[1].map(n => (
              <button key={n} className="px-3 py-1 rounded-lg text-sm font-medium bg-orange-500 text-white">{n}</button>
            ))}
            <button className="flex items-center gap-1 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-sm">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ══ 5. DETAIL SIDEBAR ═════════════════════════════════════════════════ */}
      <div className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${selected ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSelected(null)} />

      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-[#0f0f0f] border-l border-white/8 z-50 flex flex-col transition-transform duration-300 ${selected ? 'translate-x-0' : 'translate-x-full'}`}>
        {selected && (
          <>
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
              <div>
                <p className="text-xs uppercase tracking-widest text-orange-500 font-bold mb-0.5">Claim Detail</p>
                <h2 className="text-white font-bold text-lg">{selected.id}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="text-zinc-500 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Action success flash */}
              {actionSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2">
                  <p className="text-green-400 text-sm text-center">Claim marked as {actionSuccess}</p>
                </div>
              )}

              <div className="space-y-3">
                {[
                  { label: 'Claim ID',      value: <span className="text-orange-400 font-mono">{selected.id}</span> },
                  { label: 'Worker ID',     value: selected.worker },
                  { label: 'Zone',          value: selected.zone },
                  { label: 'Hours Affected',value: `${selected.hours} hours` },
                  { label: 'Timestamp',     value: selected.time },
                  ...(selected.signalDetail ? [{ label: 'Signal Source', value: <span className="text-zinc-300 text-xs">{selected.signalDetail}</span> }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-start">
                    <span className="text-zinc-500 text-xs uppercase tracking-wider">{label}</span>
                    <span className="text-white text-sm text-right max-w-[60%]">{value}</span>
                  </div>
                ))}

                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-xs uppercase tracking-wider">Type</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${TYPE_STYLE[selected.type] || ''}`}>{selected.type}</span>
                    {selected.autoTriggered && <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs px-2 py-0.5 rounded-full">Auto</span>}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-xs uppercase tracking-wider">Status</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_STYLE[selected.status] || ''}`}>{selected.status}</span>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-zinc-500 text-xs uppercase tracking-wider">Payout Amount</span>
                  <span className="text-green-400 text-2xl font-bold">Rs. {Math.round(selected.payout)}</span>
                </div>
              </div>

              {/* Severity bar */}
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-zinc-500 uppercase tracking-wider">Severity Score</span>
                  <span className="text-white font-bold">{(selected.severity * 100).toFixed(0)}%</span>
                </div>
                <div className="bg-[#1a1a1a] rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500" style={{ width: `${selected.severity * 100}%` }} />
                </div>
              </div>

              {/* Confidence bar */}
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-zinc-500 uppercase tracking-wider">AI Confidence</span>
                  <span className="text-orange-400 font-bold font-mono">{selected.conf}%</span>
                </div>
                <div className="bg-[#1a1a1a] rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${selected.conf}%` }} />
                </div>
              </div>

              {/* Verification checks */}
              <div className="bg-[#1a1a1a] border border-white/6 rounded-2xl p-4">
                <h3 className="text-white font-semibold text-sm mb-3">AI Verification Checks</h3>
                <div className="space-y-2.5">
                  {VERIFY_CHECKS.map((check, i) => {
                    const pass = selected.status !== 'rejected' || i > 1;
                    return (
                      <div key={check} className="flex items-center justify-between">
                        <span className="text-zinc-400 text-xs">{check}</span>
                        {pass ? <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar action buttons */}
            <div className="px-6 py-5 border-t border-white/8 space-y-2">
              {selected.status === 'triggered' && (
                <button onClick={() => updateClaimStatus(selected.id, 'approved')}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                  Approve Claim
                </button>
              )}
              {selected.status === 'approved' && (
                <button onClick={() => updateClaimStatus(selected.id, 'paid')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                  Mark as Paid
                </button>
              )}
              {selected.status !== 'rejected' && (
                <button onClick={() => updateClaimStatus(selected.id, 'rejected')}
                  className="w-full border border-red-500/30 text-red-400 hover:bg-red-500/10 font-semibold py-3 rounded-xl transition-colors text-sm">
                  Flag for Review
                </button>
              )}
              {selected.status === 'rejected' && (
                <div className="text-center py-2 text-zinc-500 text-xs">Claim has been flagged for review.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
