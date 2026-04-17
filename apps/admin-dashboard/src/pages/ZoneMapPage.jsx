import { useState, useEffect } from 'react';
import ZoneMap from '../components/ZoneMap';

export default function ZoneMapPage() {
  const [zonesData,   setZonesData]   = useState([]);
  const [liveStats,   setLiveStats]   = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const token   = localStorage.getItem('ridershield_admin_token');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const H       = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    try {
      const [zonesRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/zones`,           { headers: H }),
        fetch(`${API_URL}/analytics/live`,  { headers: H }),
      ]);
      const zones = await zonesRes.json();
      const stats = await statsRes.json();
      setZonesData(zones.zones || []);
      setLiveStats(stats);
      setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.log('Zone map fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []); // eslint-disable-line

  const activeZones    = zonesData.filter(z => z.hasActiveAlert).length;
  const highRisk       = zonesData.filter(z => z.riskScore > 0.7).length;
  const totalWorkers   = zonesData.reduce((s, z) => s + (z.activeWorkers || 0), 0);

  return (
    <main
      className="min-h-screen bg-[#0a0a0a] text-white pb-20"
      style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}
    >
      <div className="max-w-7xl mx-auto px-8 py-10">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-orange-500 font-bold mb-1">
              Zone Intelligence
            </p>
            <h1 className="text-3xl font-bold text-white leading-tight">Zone Risk Map</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Real-time geographic risk monitoring across all covered zones.<br/>
              <span className="text-orange-400 font-medium mt-1 inline-block">Displaying 6 live demo regions. System natively scales to Pan-India API coverage.</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <div className="bg-[#0f0f0f] border border-white/8 rounded-xl px-4 py-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-zinc-400 text-xs font-mono">Updated {lastUpdated}</span>
              </div>
            )}
            <button
              onClick={fetchAll}
              className="bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Zones',    val: zonesData.length,              color: 'text-white'      },
            { label: 'Active Alerts',  val: activeZones,                   color: 'text-red-400'    },
            { label: 'High Risk',      val: highRisk,                      color: 'text-amber-400'  },
            { label: 'Active Workers', val: totalWorkers.toLocaleString(), color: 'text-green-400'  },
          ].map((kpi, i) => (
            <div key={i} className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">{kpi.label}</p>
              <p className={`text-3xl font-bold ${kpi.color}`}>
                {loading ? <span className="animate-pulse text-zinc-700">—</span> : kpi.val}
              </p>
            </div>
          ))}
        </div>

        {/* Map */}
        {loading ? (
          <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl" style={{ height: 540 }}>
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <span key={i} className="w-2 h-2 rounded-full bg-orange-500 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <p className="text-zinc-600 text-xs uppercase tracking-widest font-mono">Loading zones</p>
              </div>
            </div>
          </div>
        ) : (
          <ZoneMap zonesData={zonesData} />
        )}

        {/* Zone Table */}
        <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6 mt-6">
          <h2 className="text-base font-bold text-white mb-5">Zone Status Table</h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="bg-white/5 rounded-xl h-12 animate-pulse" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-white/8">
                    <th className="text-zinc-500 text-xs uppercase tracking-widest pb-3 font-medium pr-6">Zone</th>
                    <th className="text-zinc-500 text-xs uppercase tracking-widest pb-3 font-medium pr-6">City</th>
                    <th className="text-zinc-500 text-xs uppercase tracking-widest pb-3 font-medium pr-6">Risk Score</th>
                    <th className="text-zinc-500 text-xs uppercase tracking-widest pb-3 font-medium pr-6">Status</th>
                    <th className="text-zinc-500 text-xs uppercase tracking-widest pb-3 font-medium pr-6">Active Workers</th>
                    <th className="text-zinc-500 text-xs uppercase tracking-widest pb-3 font-medium">Recent Claims</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {zonesData.map((z, i) => {
                    const risk  = z.riskScore || 0;
                    const level = risk > 0.7 ? 'High' : risk > 0.4 ? 'Medium' : 'Low';
                    const riskColor = risk > 0.7 ? 'text-red-400' : risk > 0.4 ? 'text-amber-400' : 'text-green-400';
                    const statusCls = z.hasActiveAlert
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-green-500/10 text-green-400 border-green-500/20';
                    return (
                      <tr key={i}>
                        <td className="py-3 pr-6 text-white font-medium">{z.name}</td>
                        <td className="py-3 pr-6 text-zinc-400">{z.city}</td>
                        <td className="py-3 pr-6">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-white/8 rounded-full h-1.5 overflow-hidden">
                              <div className={`h-full rounded-full ${risk > 0.7 ? 'bg-red-500' : risk > 0.4 ? 'bg-amber-500' : 'bg-green-500'}`}
                                style={{ width: `${risk * 100}%` }} />
                            </div>
                            <span className={`text-xs font-mono font-bold ${riskColor}`}>{(risk * 100).toFixed(0)}%</span>
                            <span className={`text-xs ${riskColor}`}>{level}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-6">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusCls}`}>
                            {z.hasActiveAlert ? 'Disrupted' : 'Clear'}
                          </span>
                        </td>
                        <td className="py-3 pr-6 text-zinc-300">{z.activeWorkers ?? '—'}</td>
                        <td className="py-3 text-zinc-300">{z.recentClaimsCount ?? 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats note */}
        {liveStats && (
          <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5 mt-4 flex flex-wrap gap-6">
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Total Claims</p>
              <p className="text-white font-bold text-lg">{liveStats.totalClaims}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Auto-Triggered</p>
              <p className="text-orange-400 font-bold text-lg">{liveStats.autoTriggered}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Total Payout</p>
              <p className="text-green-400 font-bold text-lg">
                Rs. {Math.round(liveStats.totalPayout || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Active Alerts</p>
              <p className={`font-bold text-lg ${liveStats.activeAlerts > 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                {liveStats.activeAlerts}
              </p>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
