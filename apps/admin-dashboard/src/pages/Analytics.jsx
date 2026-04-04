import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';

const WEEKLY_DATA = [
  { label:'W1', val:38400 }, { label:'W2', val:52100 }, { label:'W3', val:41800 },
  { label:'W4', val:67300 }, { label:'W5', val:58900 }, { label:'W6', val:71200 },
  { label:'W7', val:64800 }, { label:'W8', val:84200 },
];
const BAR_MAX = 84200;

const DISRUPTION_TYPES = [
  { type:'rain',   label:'Rain',   count:523, pct:28, payout:'1,24,800', barCls:'bg-blue-500'   },
  { type:'heat',   label:'Heat',   count:341, pct:18, payout:'78,200',   barCls:'bg-orange-500' },
  { type:'smog',   label:'AQI',    count:298, pct:16, payout:'62,100',   barCls:'bg-zinc-400'   },
  { type:'flood',  label:'Flood',  count:187, pct:10, payout:'98,400',   barCls:'bg-cyan-500'   },
  { type:'curfew', label:'Curfew', count:156, pct: 8, payout:'71,300',   barCls:'bg-red-500'    },
  { type:'wind',   label:'Wind',   count: 89, pct: 5, payout:'24,600',   barCls:'bg-purple-500' },
];

const TYPE_BADGE = {
  rain:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  heat:   'bg-orange-500/10 text-orange-400 border-orange-500/20',
  smog:   'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  flood:  'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  curfew: 'bg-red-500/10 text-red-400 border-red-500/20',
  wind:   'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const TRUST_SCORES = [
  { range:'90–100', label:'Elite',    workers:342,  pct:12 },
  { range:'70–89',  label:'High',     workers:891,  pct:31 },
  { range:'50–69',  label:'Standard', workers:1124, pct:40 },
  { range:'30–49',  label:'Low',      workers:384,  pct:14 },
  { range:'0–29',   label:'New',      workers:106,  pct: 4 },
];

function Trend({ up, val }) {
  return (
    <span className={`flex items-center gap-1 text-xs font-semibold ${up ? 'text-green-400' : 'text-red-400'}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {val}
    </span>
  );
}

const getRiskColor = (riskScore) => {
  if (riskScore > 0.7) return 'bg-red-500';
  if (riskScore > 0.4) return 'bg-amber-500';
  return 'bg-green-500';
};

export default function AnalyticsPage() {
  const [hoveredBar,   setHoveredBar]   = useState(null);
  const [liveData,     setLiveData]     = useState(null);
  const [zonesData,    setZonesData]    = useState([]);
  const [dataLoading,  setDataLoading]  = useState(true);

  const token = localStorage.getItem('ridershield_admin_token');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const [liveRes, zonesRes] = await Promise.all([
          fetch(`${API_URL}/analytics/live`,  { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/zones`,           { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const live  = await liveRes.json();
        const zones = await zonesRes.json();
        setLiveData(live);
        setZonesData(zones.zones || []);
      } catch (err) {
        console.log('Analytics fetch error:', err);
      } finally {
        setDataLoading(false);
      }
    };
    fetchAll();
    const interval = setInterval(fetchAll, 60000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line

  const fmt = (n) => n >= 100000 ? `${(n/100000).toFixed(2)}L` : n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(Math.round(n));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-16" style={{ fontFamily:'Plus Jakarta Sans, Inter, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-8 py-10">

        {/* ══ 1. HEADER ══════════════════════════════════════════════════════ */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-orange-500 font-bold mb-1">Analytics</p>
            <h1 className="text-3xl font-bold text-white leading-tight">Insights Dashboard</h1>
            <p className="text-zinc-400 text-sm mt-1">Predictive analytics and loss ratio monitoring</p>
          </div>
          <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl px-5 py-3">
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-0.5">Date Range</p>
            <p className="text-white font-semibold text-sm">Last 30 Days</p>
          </div>
        </div>

        {/* ══ 2. KPI ROW ═════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Total Payouts — live */}
          <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5 flex flex-col min-h-[136px]">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Total Payouts</p>
            {dataLoading
              ? <div className="h-8 bg-white/5 rounded-lg animate-pulse mb-1" />
              : <p className="text-2xl font-bold text-white mb-1">
                  {liveData ? `Rs. ${liveData.totalPayout?.toLocaleString('en-IN') || 0}` : 'Rs. —'}
                </p>
            }
            <Trend up val="+23% vs last month" />
            <p className="text-zinc-600 text-xs mt-2">
              {dataLoading ? '' : liveData ? `Across ${liveData.totalClaims} claims` : 'Loading...'}
            </p>
          </div>
          {/* Loss Ratio — hardcoded */}
          <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5 flex flex-col min-h-[136px]">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Loss Ratio</p>
            <p className="text-2xl font-bold text-white mb-1">68%</p>
            <Trend up={false} val="-2% this month" />
            <p className="text-zinc-600 text-xs mt-2">Target: below 75%</p>
          </div>
          {/* Active Policies — hardcoded */}
          <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5 flex flex-col min-h-[136px]">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Active Policies</p>
            <p className="text-2xl font-bold text-white mb-1">2,847</p>
            <Trend up val="+12% this week" />
            <p className="text-zinc-600 text-xs mt-2">Standard plan most popular</p>
          </div>
          {/* Fraud Prevented — hardcoded */}
          <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5 flex flex-col min-h-[136px]">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Fraud Prevented</p>
            <p className="text-2xl font-bold text-white mb-1">Rs. 1,24,000</p>
            <Trend up val="+8% this month" />
            <p className="text-zinc-600 text-xs mt-2">31 fraudulent claims blocked</p>
          </div>
        </div>

        {/* Live stat pills */}
        <div className="flex gap-4 mb-6">
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-2 flex flex-col">
            <span className="text-purple-400 font-bold text-lg">{liveData?.autoTriggered ?? 0}</span>
            <span className="text-zinc-600 text-xs">Auto-Triggered claims</span>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 flex flex-col">
            <span className="text-amber-400 font-bold text-lg">{liveData?.activeAlerts ?? 0}</span>
            <span className="text-zinc-600 text-xs">Active Alerts in zones</span>
          </div>
        </div>

        {/* ══ 3. TWO COLUMN GRID ════════════════════════════════════════════ */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6" style={{ minHeight:'720px' }}>

          {/* LEFT */}
          <div className="flex flex-col gap-6 h-full">

            {/* Bar chart */}
            <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6 flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-white">Weekly Payout Trend</h2>
                <span className="text-xs text-zinc-500 bg-white/5 border border-white/8 px-3 py-1 rounded-full">Last 8 Weeks</span>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col justify-between text-right pr-2 h-48 shrink-0">
                  {['Rs. 75K','Rs. 50K','Rs. 25K','Rs. 0'].map(l => (
                    <span key={l} className="text-zinc-600 text-[10px]">{l}</span>
                  ))}
                </div>
                <div className="flex items-end gap-3 h-48 flex-1">
                  {WEEKLY_DATA.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1"
                      onMouseEnter={() => setHoveredBar(i)} onMouseLeave={() => setHoveredBar(null)}>
                      <span className={`text-zinc-400 text-[10px] transition-opacity ${hoveredBar === i ? 'opacity-100' : 'opacity-0'}`}>
                        {(d.val/1000).toFixed(0)}K
                      </span>
                      <div className="w-full bg-orange-500/70 hover:bg-orange-500 rounded-t-lg transition-all duration-300 cursor-pointer"
                        style={{ height: `${(d.val / BAR_MAX) * 192}px` }} />
                      <span className="text-zinc-600 text-[10px]">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Disruption Type Breakdown */}
            <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6 flex-1">
              <h2 className="text-base font-bold text-white mb-5">Claims by Disruption Type</h2>
              <div className="space-y-3">
                {DISRUPTION_TYPES.map(d => (
                  <div key={d.type} className="flex items-center gap-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border w-14 text-center shrink-0 ${TYPE_BADGE[d.type]}`}>{d.label}</span>
                    <div className="flex-1 bg-white/8 rounded-full h-2 overflow-hidden">
                      <div className={`h-full rounded-full ${d.barCls}`} style={{ width:`${d.pct}%` }} />
                    </div>
                    <span className="text-zinc-400 text-sm w-8 text-right shrink-0">{d.count}</span>
                    <span className="text-orange-400 text-sm font-mono w-24 text-right shrink-0">Rs. {d.payout}</span>
                  </div>
                ))}
              </div>

              {/* Auto-Detection Rate card */}
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-zinc-300 text-sm font-medium">Auto-Detection Rate</span>
                </div>
                <p className="text-zinc-300 text-sm mb-2">
                  {liveData?.autoTriggered ?? 0} of {liveData?.totalClaims ?? 0} claims were auto-detected
                </p>
                <div className="bg-white/8 rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full bg-purple-500 transition-all duration-700"
                    style={{ width: liveData?.totalClaims > 0 ? `${(liveData.autoTriggered / liveData.totalClaims * 100)}%` : '0%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-6 h-full">

            {/* Zone Risk Heatmap — live */}
            <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6 flex-1">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-white">Zone Risk Scores</h2>
                <span className="text-xs text-zinc-500 bg-white/5 border border-white/8 px-3 py-1 rounded-full">Live</span>
              </div>

              {dataLoading ? (
                <div className="space-y-3">
                  {[1,2,3,4,5].map(i => <div key={i} className="bg-white/5 rounded-xl h-10 animate-pulse" />)}
                </div>
              ) : zonesData.length > 0 ? (
                <div className="space-y-3">
                  {zonesData.map((z, i) => {
                    const level     = z.riskScore > 0.7 ? 'High' : z.riskScore > 0.4 ? 'Medium' : 'Low';
                    const barCls    = z.riskScore > 0.7 ? 'bg-red-500' : z.riskScore > 0.4 ? 'bg-amber-500' : 'bg-green-500';
                    const badgeCls  = z.riskScore > 0.7 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : z.riskScore > 0.4 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20';
                    return (
                      <div key={i} className={`flex items-center gap-3 rounded-xl p-2 transition-colors ${z.hasActiveAlert ? 'bg-red-950/10' : ''}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              {z.hasActiveAlert && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                              <span className="text-white text-sm font-medium truncate">{z.name}</span>
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ml-2 shrink-0 ${badgeCls}`}>{level}</span>
                          </div>
                          <div className="bg-white/8 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-full rounded-full ${barCls}`} style={{ width:`${z.riskScore*100}%` }} />
                          </div>
                        </div>
                        <div className="text-right shrink-0 w-20">
                          <p className="text-white text-sm font-bold">{z.riskScore.toFixed(2)}</p>
                          <p className="text-zinc-600 text-[10px]">{z.recentClaimsCount ?? 0} recent</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {[{zone:'Noida Sector 18',risk:0.87,level:'High',claims:42},{zone:'Delhi Rohini',risk:0.79,level:'High',claims:38},{zone:'Gurugram Sector 45',risk:0.64,level:'Medium',claims:22}].map((z,i)=>(
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white text-sm font-medium truncate">{z.zone}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ml-2 shrink-0 ${z.level==='High'?'bg-red-500/10 text-red-400 border-red-500/20':z.level==='Medium'?'bg-amber-500/10 text-amber-400 border-amber-500/20':'bg-green-500/10 text-green-400 border-green-500/20'}`}>{z.level}</span>
                        </div>
                        <div className="bg-white/8 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full rounded-full ${getRiskColor(z.risk)}`} style={{ width:`${z.risk*100}%` }} />
                        </div>
                      </div>
                      <div className="text-right shrink-0 w-20">
                        <p className="text-white text-sm font-bold">{z.risk}</p>
                        <p className="text-zinc-600 text-[10px]">{z.claims} predicted</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Next Week AI Prediction & Mini P&L */}
            <div className="flex flex-col gap-6 h-full">
              <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6 flex-1">
                <div className="flex items-center gap-2 mb-5">
                  <Zap className="w-5 h-5 text-orange-500" />
                  <h2 className="text-base font-bold text-white">Next Week AI Prediction</h2>
                </div>
                <div className="space-y-5">
                  <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <p className="text-4xl font-bold text-white">187</p>
                    <p className="text-zinc-400 text-sm mt-0.5">predicted claims next week</p>
                    <p className="text-zinc-600 text-xs mt-1">Based on weather forecast + historical patterns</p>
                    <p className="text-orange-400 text-xs font-mono mt-2">Model confidence: 89%</p>
                  </div>
                  <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <p className="text-2xl font-bold text-orange-400">Rs. 48,200</p>
                    <p className="text-zinc-400 text-sm mt-0.5">estimated total payout</p>
                    <p className="text-zinc-600 text-xs mt-1">Reserve recommendation: Rs. 52,000</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">High Risk Zones</p>
                    <div className="flex flex-wrap gap-2">
                      {['Noida Sector 18','Delhi Rohini','Patna'].map(z => (
                        <span key={z} className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs px-3 py-1 rounded-full">{z}</span>
                      ))}
                    </div>
                    <p className="text-zinc-600 text-xs mt-2">Rain forecast &gt; 60mm across these zones</p>
                  </div>
                </div>
              </div>

              {/* D2 — Weekly Premium Collected vs Payouts */}
              <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6 mt-auto">
                <h3 className="text-white font-semibold mb-4">Weekly P&L (Estimated)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-zinc-500 text-xs">Premiums Collected</p>
                    <p className="text-white text-xl font-bold">Rs. 2,84,700</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs">Payouts Made</p>
                    <p className="text-red-400 text-xl font-bold">Rs. 1,94,680</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs">Gross Profit</p>
                    <p className="text-green-400 text-xl font-bold">Rs. 90,020</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Loss Ratio</span>
                    <span className="text-white">68.4%</span>
                  </div>
                  <div className="bg-[#111] rounded-full h-1.5 mt-1">
                    <div className="bg-orange-500 rounded-full h-1.5" style={{ width: '68.4%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ 4. TRUST DISTRIBUTION ════════════════════════════════════════ */}
        <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-1">Worker Trust Score Distribution</h2>
          <p className="text-zinc-500 text-sm mb-6">Trust scores determine Safety Mode limits and fraud sensitivity</p>
          <div className="space-y-3">
            {TRUST_SCORES.map(t => (
              <div key={t.range} className="flex items-center gap-4">
                <span className="text-zinc-400 text-xs font-mono w-14 shrink-0">{t.range}</span>
                <span className="text-zinc-600 text-xs w-16 shrink-0">{t.label}</span>
                <div className="flex-1 bg-white/8 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-orange-500/80 h-full rounded-full" style={{ width:`${t.pct}%` }} />
                </div>
                <span className="text-zinc-400 text-sm w-20 text-right shrink-0">{t.workers.toLocaleString()} workers</span>
                <span className="text-orange-400 text-xs font-mono w-8 text-right shrink-0">{t.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
