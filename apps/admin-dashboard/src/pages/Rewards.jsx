import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  ChevronRight, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Award
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Rewards() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notif, setNotif] = useState(null);

  useEffect(() => {
    fetchEligible();
  }, []);

  const fetchEligible = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('ridershield_admin_token');
      const res = await fetch(`${API_URL}/workers/cashback-eligible`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setWorkers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch error:', err);
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCashback = async (worker) => {
    try {
      const token = localStorage.getItem('ridershield_admin_token');
      const res = await fetch(`${API_URL}/payout/cashback`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          workerId: worker.workerId, 
          amount: worker.rebackAmount, 
          weeksStreak: worker.streak 
        }),
      });
      if (res.ok) {
        showNotif(`Success: Rs. ${worker.rebackAmount} Reback issued to ${worker.name}`, 'success');
        fetchEligible();
      }
    } catch (err) {
      showNotif('Failed to issue cashback', 'error');
    }
  };

  const handleAdvanceStreak = async (workerId) => {
    try {
      const token = localStorage.getItem('ridershield_admin_token');
      const res = await fetch(`${API_URL}/dev/advance-streak`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ workerId, weeks: 1 }),
      });
      if (res.ok) {
        fetchEligible();
      }
    } catch (err) { /* ignore */ }
  };

  const showNotif = (msg, type) => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 4000);
  };

  const filtered = workers.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.workerId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Gift className="w-6 h-6 text-orange-500" />
            </div>
            Rewards & Rebacks
          </h1>
          <p className="text-zinc-500 text-sm mt-3 leading-relaxed max-w-lg">
            Manage the "No-Claim Reback" program. Workers who haven't filed a claim for 4+ weeks 
            are eligible for 15% premium cashback.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchEligible}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 text-zinc-300 hover:text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all">
            <Download className="w-4 h-4" />
            Export Audit
          </button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-zinc-500 text-xs uppercase tracking-widest font-bold mb-4">
            <Award className="w-4 h-4 text-orange-400" />
            Eligible Partners
          </div>
          <p className="text-3xl font-bold text-white">{workers.length}</p>
          <p className="text-[10px] text-zinc-600 mt-2 uppercase tracking-wide">Qualified for payout</p>
        </div>
        <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-zinc-500 text-xs uppercase tracking-widest font-bold mb-4">
            <TrendingUp className="w-4 h-4 text-green-400" />
            Retention Impact
          </div>
          <p className="text-3xl font-bold text-white">+2.4%</p>
          <p className="text-[10px] text-zinc-600 mt-2 uppercase tracking-wide">Partner stickiness delta</p>
        </div>
        <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-zinc-500 text-xs uppercase tracking-widest font-bold mb-4">
            <RefreshCw className="w-4 h-4 text-blue-400" />
            Avg. Reback
          </div>
          <p className="text-3xl font-bold text-white">Rs. 420</p>
          <p className="text-[10px] text-zinc-600 mt-2 uppercase tracking-wide">Per eligible worker</p>
        </div>
      </div>

      {/* Notifications */}
      {notif && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
          notif.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {notif.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{notif.msg}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-zinc-400 hover:text-white transition-colors">
            <Filter className="w-4 h-4" />
            Recent
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/8 bg-white/[0.02]">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Partner Details</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Streak (Weeks)</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Est. Reback</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Policy Details</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-8 h-8 text-orange-500/40 animate-spin" />
                    <p className="text-zinc-600 text-sm font-medium">Scanning for eligible partners...</p>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-20 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-zinc-700" />
                  </div>
                  <p className="text-zinc-500 text-sm">No eligible partners found.</p>
                  <p className="text-zinc-700 text-xs mt-1">Streaks must be 4 weeks minimum for reback eligibility.</p>
                </td>
              </tr>
            ) : (
              filtered.map((worker) => (
                <tr key={worker._id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-bold text-xs">
                        {worker.name.substring(0,2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white leading-none">{worker.name}</p>
                        <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-tighter">{worker.workerId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        {[...Array(Math.min(worker.streak, 4))].map((_, i) => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-green-500 border border-[#0f0f0f]" />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-green-500">{worker.streak} Weeks</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-extrabold text-white">Rs. {worker.rebackAmount}</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[9px] text-zinc-500 border border-white/10">15%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full bg-blue-500`} />
                        <span className="text-[11px] text-zinc-300 capitalize">{worker.plan} Plan</span>
                      </div>
                      <p className="text-[10px] text-zinc-600 leading-none ml-3 uppercase">UPI: {worker.upiId || 'Not set'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleAdvanceStreak(worker.workerId)}
                        className="p-1 px-3 border border-zinc-800 text-zinc-600 hover:text-white hover:border-zinc-600 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all"
                        title="Add 1 Week (Demo Utility)"
                      >
                        + Demo Week
                      </button>
                      <button 
                         onClick={() => handleIssueCashback(worker)}
                         className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-lg shadow-orange-500/10"
                      >
                        Issue Reback
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex items-center gap-6 p-6 bg-orange-500/5 border border-orange-500/10 rounded-2xl">
        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
          <Clock className="w-6 h-6 text-orange-500" />
        </div>
        <div>
          <h4 className="text-white font-bold text-sm">How Rebacks are calculated</h4>
          <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
            Every 4 consecutive weeks with zero total claims (Automatic or Safety) triggers a reback eligibility. 
            The system calculates 15% of the total premiums paid during those 4 weeks as a reward for safe riding.
          </p>
        </div>
      </div>
    </div>
  );
}
