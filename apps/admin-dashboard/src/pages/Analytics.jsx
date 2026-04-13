import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Zap, BarChart3, Shield, FileText, Activity } from 'lucide-react';

const TYPE_BADGE = {
  rain:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
  heat:    'bg-orange-500/10 text-orange-400 border-orange-500/20',
  smog:    'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  flood:   'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  curfew:  'bg-red-500/10 text-red-400 border-red-500/20',
  wind:    'bg-purple-500/10 text-purple-400 border-purple-500/20',
  unknown: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};
const TYPE_BAR = {
  rain: 'bg-blue-500', heat: 'bg-orange-500', smog: 'bg-zinc-400',
  flood: 'bg-cyan-500', curfew: 'bg-red-500', wind: 'bg-purple-500', unknown: 'bg-zinc-500',
};
const TYPE_LABEL = {
  rain: 'Rain', heat: 'Heat', smog: 'AQI', flood: 'Flood', curfew: 'Curfew', wind: 'Wind', unknown: 'Other',
};

// Fallback static data
const STATIC_WEEKLY = [
  { label: 'W1', val: 38400 }, { label: 'W2', val: 52100 }, { label: 'W3', val: 41800 },
  { label: 'W4', val: 67300 }, { label: 'W5', val: 58900 }, { label: 'W6', val: 71200 },
  { label: 'W7', val: 64800 }, { label: 'W8', val: 84200 },
];
const STATIC_DISRUPTIONS = [
  { type: 'rain',   label: 'Rain',   count: 523, pct: 28, payout: '1,24,800', barCls: 'bg-blue-500'   },
  { type: 'heat',   label: 'Heat',   count: 341, pct: 18, payout: '78,200',   barCls: 'bg-orange-500' },
  { type: 'smog',   label: 'AQI',    count: 298, pct: 16, payout: '62,100',   barCls: 'bg-zinc-400'   },
  { type: 'flood',  label: 'Flood',  count: 187, pct: 10, payout: '98,400',   barCls: 'bg-cyan-500'   },
  { type: 'curfew', label: 'Curfew', count: 156, pct:  8, payout: '71,300',   barCls: 'bg-red-500'    },
];
const STATIC_TRUST = [
  { range: '90–100', label: 'Elite',    workers: 342,  pct: 12 },
  { range: '70–89',  label: 'High',     workers: 891,  pct: 31 },
  { range: '50–69',  label: 'Standard', workers: 1124, pct: 40 },
  { range: '30–49',  label: 'Low',      workers: 384,  pct: 14 },
  { range: '0–29',   label: 'New',      workers: 106,  pct:  4 },
];

function Trend({ up, val }) {
  return (
    <span className={`flex items-center gap-1 text-xs font-semibold ${up ? 'text-green-400' : 'text-red-400'}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {val}
    </span>
  );
}

export default function AnalyticsPage() {
  const [hoveredBar,      setHoveredBar]      = useState(null);
  const [liveData,        setLiveData]        = useState(null);
  const [zonesData,       setZonesData]       = useState([]);
  const [dataLoading,     setDataLoading]     = useState(true);
  const [forecast,        setForecast]        = useState(null);
  const [weeklyData,      setWeeklyData]      = useState(STATIC_WEEKLY);
  const [disruptionTypes, setDisruptionTypes] = useState(STATIC_DISRUPTIONS);
  const [trustScores,     setTrustScores]     = useState(STATIC_TRUST);

  const token   = localStorage.getItem('ridershield_admin_token');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const H       = { Authorization: `Bearer ${token}` };

  // Fetch live stats + zones
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [liveRes, zonesRes] = await Promise.all([
          fetch(`${API_URL}/analytics/live`,  { headers: H }),
          fetch(`${API_URL}/zones`,           { headers: H }),
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

  // Fetch forecast
  useEffect(() => {
    fetch(`${API_URL}/analytics/forecast`, { headers: H })
      .then(r => r.json()).then(setForecast).catch(() => {});
  }, []); // eslint-disable-line

  // Fetch chart-level data
  useEffect(() => {
    fetch(`${API_URL}/analytics/weekly-trend`, { headers: H })
      .then(r => r.json())
      .then(d => { if (d.data?.length) setWeeklyData(d.data); })
      .catch(() => {});

    fetch(`${API_URL}/analytics/claims-by-type`, { headers: H })
      .then(r => r.json())
      .then(d => {
        if (d.data?.length) {
          setDisruptionTypes(d.data.map(a => ({
            type:   a.type,
            label:  TYPE_LABEL[a.type] || a.type,
            count:  a.count,
            pct:    a.pct,
            payout: a.totalPayout.toLocaleString('en-IN'),
            barCls: TYPE_BAR[a.type] || 'bg-zinc-500',
          })));
        }
      })
      .catch(() => {});

    fetch(`${API_URL}/analytics/trust-distribution`, { headers: H })
      .then(r => r.json())
      .then(d => { if (d.data?.length) setTrustScores(d.data); })
      .catch(() => {});
  }, []); // eslint-disable-line

  const barMax = Math.max(...weeklyData.map(d => d.val), 1);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-8 py-8">

        {/* ══ HEADER ══════════════════════════════════════════════════════════════ */}
        <div className="flex items-end justify-between border-b border-white/5 pb-5 mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-orange-500 font-bold mb-1">Analytics</p>
            <h1 className="text-2xl font-bold text-white leading-tight">Insights Dashboard</h1>
            <p className="text-zinc-500 text-sm mt-1">Predictive analytics, loss ratios, and trust monitoring</p>
          </div>
          <div className="flex items-center gap-2 bg-[#0f0f0f] border border-white/8 rounded-xl px-4 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-zinc-400 text-xs">Last 30 Days · Live</span>
          </div>
        </div>

        {/* ══ KPI STRIP ════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Total Payouts */}
          <div className="bg-[#0f0f0f] border-l-4 border-l-orange-500 border-t border-r border-b border-white/8 rounded-xl p-5 relative overflow-hidden group hover:border-white/15 transition-all">
            <div className="flex justify-between items-start">
              <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-4">Total Payouts</p>
              <div className="bg-orange-500/10 p-2 rounded-lg"><Activity className="w-4 h-4 text-orange-400" /></div>
            </div>
            {dataLoading
              ? <div className="h-8 bg-white/5 rounded-lg animate-pulse mb-2" />
              : <p className="text-2xl font-bold text-white mb-2 font-mono">
                  Rs. {liveData?.totalPayout?.toLocaleString('en-IN') || '—'}
                </p>}
            <Trend up val="+23% vs last month" />
          </div>

          {/* Loss Ratio */}
          <div className="bg-[#0f0f0f] border-l-4 border-l-amber-500 border-t border-r border-b border-white/8 rounded-xl p-5 relative overflow-hidden group hover:border-white/15 transition-all">
            <div className="flex justify-between items-start">
              <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-4">Loss Ratio</p>
              <div className="bg-amber-500/10 p-2 rounded-lg"><BarChart3 className="w-4 h-4 text-amber-400" /></div>
            </div>
            <p className="text-2xl font-bold text-white mb-2 font-mono">68%</p>
            <div className="flex items-center gap-2">
              <Trend up={false} val="-2% this month" />
              <span className="text-zinc-600 text-[10px]">Target &lt;75%</span>
            </div>
          </div>

          {/* Active Policies */}
          <div className="bg-[#0f0f0f] border-l-4 border-l-blue-500 border-t border-r border-b border-white/8 rounded-xl p-5 relative overflow-hidden group hover:border-white/15 transition-all">
            <div className="flex justify-between items-start">
              <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-4">Active Policies</p>
              <div className="bg-blue-500/10 p-2 rounded-lg"><FileText className="w-4 h-4 text-blue-400" /></div>
            </div>
            <p className="text-2xl font-bold text-white mb-2 font-mono">2,847</p>
            <Trend up val="+12% this week" />
          </div>

          {/* Fraud Prevented */}
          <div className="bg-[#0f0f0f] border-l-4 border-l-green-500 border-t border-r border-b border-white/8 rounded-xl p-5 relative overflow-hidden group hover:border-white/15 transition-all">
            <div className="flex justify-between items-start">
              <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-4">Fraud Prevented</p>
              <div className="bg-green-500/10 p-2 rounded-lg"><Shield className="w-4 h-4 text-green-400" /></div>
            </div>
            <p className="text-2xl font-bold text-white mb-2 font-mono">Rs. 1.24L</p>
            <div className="flex items-center gap-2">
              <Trend up val="+8% this month" />
              <span className="text-zinc-600 text-[10px]">31 blocked</span>
            </div>
          </div>
        </div>

        {/* ══ MAIN 2-COLUMN GRID ══════════════════════════════════════════════════ */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">

          {/* LEFT: Weekly Payout Trend Bar Chart */}
          <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Weekly Payout Trend</h2>
              <span className="text-[10px] text-zinc-500 bg-white/5 border border-white/8 px-3 py-1 rounded-full">Last 8 Weeks</span>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col justify-between text-right pr-2 h-44 shrink-0">
                {['75K', '50K', '25K', '0'].map(l => (
                  <span key={l} className="text-zinc-600 text-[10px]">Rs. {l}</span>
                ))}
              </div>
              <div className="flex items-end gap-2 h-44 flex-1">
                {weeklyData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1"
                    onMouseEnter={() => setHoveredBar(i)} onMouseLeave={() => setHoveredBar(null)}>
                    <span className={`text-zinc-400 text-[10px] transition-opacity ${hoveredBar === i ? 'opacity-100' : 'opacity-0'}`}>
                      {d.val >= 1000 ? `${(d.val / 1000).toFixed(0)}K` : d.val}
                    </span>
                    <div className="w-full bg-orange-500/70 hover:bg-orange-500 rounded-t-md transition-all duration-300 cursor-pointer"
                      style={{ height: `${(d.val / barMax) * 176}px` }} />
                    <span className="text-zinc-600 text-[10px]">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Claims by Disruption Type */}
          <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Claims by Disruption Type</h2>
            </div>
            <div className="space-y-4">
              {disruptionTypes.map(d => (
                <div key={d.type}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TYPE_BADGE[d.type] || TYPE_BADGE.unknown}`}>{d.label}</span>
                      <span className="text-zinc-400 text-xs">{d.count} claims</span>
                    </div>
                    <span className="text-orange-400 text-xs font-mono">Rs. {d.payout}</span>
                  </div>
                  <div className="bg-white/6 rounded-full h-2 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${d.barCls}`} style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Auto-detection mini card */}
            <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-300 text-xs font-semibold">Auto-Detection Rate</span>
                <span className="text-purple-400 text-sm font-bold font-mono">
                  {liveData?.totalClaims > 0
                    ? `${Math.round((liveData.autoTriggered / liveData.totalClaims) * 100)}%`
                    : '—'}
                </span>
              </div>
              <div className="bg-white/6 rounded-full h-1.5">
                <div className="h-full bg-purple-500 rounded-full transition-all duration-700"
                  style={{ width: liveData?.totalClaims > 0 ? `${(liveData.autoTriggered / liveData.totalClaims) * 100}%` : '0%' }} />
              </div>
              <p className="text-zinc-600 text-xs mt-2">
                {liveData?.autoTriggered ?? 0} of {liveData?.totalClaims ?? 0} claims auto-triggered by ML pipeline
              </p>
            </div>
          </div>
        </div>

        {/* ══ INTELLIGENCE ROW ════════════════════════════════════════════════════ */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">

          {/* Zone Risk Scores — live */}
          <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Live Zone Risk Scores</h2>
              <span className="flex items-center gap-1.5 text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full font-bold">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />Live
              </span>
            </div>
            {dataLoading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => <div key={i} className="bg-white/5 rounded-xl h-10 animate-pulse" />)}
              </div>
            ) : zonesData.length > 0 ? (
              <div className="space-y-3.5">
                {zonesData.map((z, i) => {
                  const barCls   = z.riskScore > 0.7 ? 'bg-red-500' : z.riskScore > 0.4 ? 'bg-amber-500' : 'bg-green-500';
                  const level    = z.riskScore > 0.7 ? 'High' : z.riskScore > 0.4 ? 'Medium' : 'Low';
                  const badgeCls = z.riskScore > 0.7
                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                    : z.riskScore > 0.4
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-green-500/10 text-green-400 border-green-500/20';
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          {z.hasActiveAlert && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0" />}
                          <span className="text-white text-sm font-medium">{z.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400 text-xs font-mono">{(z.riskScore * 100).toFixed(0)}%</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeCls}`}>{level}</span>
                        </div>
                      </div>
                      <div className="bg-white/6 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full rounded-full ${barCls} transition-all duration-700`} style={{ width: `${z.riskScore * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3.5">
                {[{name:'Noida Sector 18',risk:0.87,level:'High'},{name:'Delhi Rohini',risk:0.79,level:'High'},{name:'Gurugram Sector 45',risk:0.64,level:'Medium'},{name:'Mumbai Andheri',risk:0.41,level:'Medium'},{name:'Hyderabad Banjara',risk:0.22,level:'Low'}].map((z,i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-white text-sm">{z.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400 text-xs font-mono">{(z.risk * 100).toFixed(0)}%</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${z.level==='High' ? 'bg-red-500/10 text-red-400 border-red-500/20' : z.level==='Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>{z.level}</span>
                      </div>
                    </div>
                    <div className="bg-white/6 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full rounded-full ${z.level==='High'?'bg-red-500':z.level==='Medium'?'bg-amber-500':'bg-green-500'} transition-all duration-700`} style={{ width: `${z.risk * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Weekly Forecast */}
          <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Zap className="w-5 h-5 text-orange-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">AI Weekly Forecast</h2>
              <span className="text-[10px] text-zinc-500 ml-auto">Powered by ML + Weather API</span>
            </div>

            {forecast ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <p className="text-3xl font-bold text-white">{forecast.totalExpectedClaims}</p>
                    <p className="text-zinc-500 text-xs mt-1">predicted claims</p>
                    <p className="text-orange-400 text-[10px] font-mono mt-1">Confidence: 89%</p>
                  </div>
                  <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <p className="text-xl font-bold text-orange-400">Rs. {forecast.totalExpectedPayout?.toLocaleString('en-IN')}</p>
                    <p className="text-zinc-500 text-xs mt-1">est. payout</p>
                  </div>
                  <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <p className="text-xl font-bold text-amber-400">Rs. {Math.round((forecast.totalExpectedPayout || 0) * 1.2).toLocaleString('en-IN')}</p>
                    <p className="text-zinc-500 text-xs mt-1">reserve rec.</p>
                  </div>
                </div>
                {forecast.highRiskZones?.length > 0 && (
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">High-Risk Zones Next Week</p>
                    <div className="flex flex-wrap gap-2">
                      {forecast.highRiskZones.map(z => (
                        <span key={z} className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-1 rounded-full">{z}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-2 pt-2 border-t border-white/8">
                  {[...(forecast.zones || [])].sort((a,b) => b.nextWeekRisk - a.nextWeekRisk).slice(0,4).map(z => (
                    <div key={z.zoneName} className="flex items-center gap-3">
                      <span className="text-zinc-300 text-xs truncate flex-1">{z.zoneName}</span>
                      <div className="flex gap-0.5">
                        {(z.forecastDays || []).slice(0,7).map((d,i) => (
                          <div key={i} className={`w-4 h-4 rounded-sm ${d.severity==='severe'?'bg-red-500':d.severity==='moderate'?'bg-amber-500':'bg-green-500/30'}`} title={d.date} />
                        ))}
                      </div>
                      <span className={`text-xs font-bold font-mono w-10 text-right ${z.nextWeekRisk>0.7?'text-red-400':z.nextWeekRisk>0.4?'text-amber-400':'text-green-400'}`}>{(z.nextWeekRisk*100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Skeleton */}
                {[1,2,3].map(i => <div key={i} className="bg-white/5 rounded-xl h-12 animate-pulse" />)}
                {/* Fallback static */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <p className="text-3xl font-bold text-white">187</p>
                    <p className="text-zinc-500 text-xs mt-1">predicted claims</p>
                    <p className="text-orange-400 text-[10px] font-mono mt-1">Confidence: 89%</p>
                  </div>
                  <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <p className="text-xl font-bold text-orange-400">Rs. 48,200</p>
                    <p className="text-zinc-500 text-xs mt-1">est. payout</p>
                  </div>
                  <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <p className="text-xl font-bold text-amber-400">Rs. 52,000</p>
                    <p className="text-zinc-500 text-xs mt-1">reserve rec.</p>
                  </div>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">High-Risk Zones</p>
                  <div className="flex flex-wrap gap-2">
                    {['Noida Sector 18', 'Delhi Rohini', 'Patna'].map(z => (
                      <span key={z} className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-1 rounded-full">{z}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══ TRUST SCORE DISTRIBUTION ════════════════════════════════════════════ */}
        <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Worker Trust Score Distribution</h2>
              <p className="text-zinc-600 text-xs mt-1">Determines Safety Mode limits and fraud sensitivity thresholds</p>
            </div>
            <div className="bg-[#1a1a1a] border border-white/8 rounded-xl px-4 py-2">
              <p className="text-xs text-zinc-500">Total Workers</p>
              <p className="text-white font-bold">{trustScores.reduce((s, t) => s + t.workers, 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
          <div className="space-y-4">
            {trustScores.map(t => (
              <div key={t.range}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400 text-xs font-mono w-14">{t.range}</span>
                    <span className="text-zinc-500 text-xs">{t.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400 text-xs">{t.workers.toLocaleString()} workers</span>
                    <span className="text-orange-400 text-xs font-mono w-8 text-right">{t.pct}%</span>
                  </div>
                </div>
                <div className="bg-white/6 rounded-full h-2 overflow-hidden">
                  <div className="bg-orange-500/80 h-full rounded-full transition-all duration-700" style={{ width: `${t.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
