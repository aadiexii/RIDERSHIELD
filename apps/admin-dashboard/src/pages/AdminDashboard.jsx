import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Toast from '../components/Toast';
import AnimatedCounter from '../components/AnimatedCounter';
import StatCard from '../components/StatCard';

import {
  CloudSun,
  ThermometerSun,
  CloudRain,
  ShieldAlert,
  Activity,
  Zap,
  CheckCircle2,
  XCircle,
  BarChart3,
  Timer,
  MapPin,
} from 'lucide-react';

const PREDEFINED_TRIGGERS = [
  { label: 'Heavy Rain',   city: 'Noida',   type: 'rain',   severity: 0.8,  hours: 4  },
  { label: 'Extreme Heat', city: 'Delhi',   type: 'heat',   severity: 0.7,  hours: 5  },
  { label: 'High AQI',    city: 'Delhi',   type: 'smog',   severity: 0.9,  hours: 6  },
  { label: 'Curfew',      city: 'Lucknow', type: 'curfew', severity: 0.6,  hours: 8  },
  { label: 'Flood',       city: 'Patna',   type: 'flood',  severity: 0.95, hours: 10 },
];

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
  const [lastCronRun, setLastCronRun] = useState(null);
  const [claimVelocity, setClaimVelocity] = useState({ count: 0, alert: false });
  const [claims, setClaims] = useState([]);
  const [language, setLanguage] = useState('en');

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

  // ── 1. Weather ────────────────────────────────────────────────────────────────
  const [weatherCity,    setWeatherCity]    = useState('Noida');
  const [weatherData,    setWeatherData]    = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError,   setWeatherError]   = useState(null);

  const checkWeather = async (overrideCity) => {
    const targetCity = typeof overrideCity === 'string' ? overrideCity : weatherCity;
    if (typeof overrideCity === 'string') setWeatherCity(overrideCity);
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/weather/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: targetCity }),
      });
      if (!res.ok) throw new Error('Backend failed. Ensure OpenWeatherMap API key is set in .env');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setWeatherData(data);
    } catch (err) {
      setWeatherError(err.message);
    } finally {
      setWeatherLoading(false);
    }
  };

  // ── 2. Disruption / Premium ───────────────────────────────────────────────────
  const [formData, setFormData] = useState({ city: 'Noida', type: 'rain', severity: 0.8, hours: 4 });
  const [premium,        setPremium]        = useState(null);
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [showBreakdown,  setShowBreakdown]  = useState(false);
  const [breakdown,      setBreakdown]      = useState(null);

  useEffect(() => {
    let active = true;
    const calculatePremium = async () => {
      setPremiumLoading(true);
      try {
        const payload = {
          zone_risk_score:       parseFloat(formData.severity),
          earnings_baseline:     5200,
          rain_forecast_7d:      30,
          heat_forecast_7d:      35,
          aqi_forecast_7d:       150,
          trust_score:           70,
          historical_claim_rate: 0.2,
          plan_type:             'standard',
          worker_tenure_weeks:   20,
        };
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res  = await fetch(`${API_URL}/premium/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (active && data.weekly_premium) setPremium(data.weekly_premium);

        // Also fetch breakdown
        try {
          const bdRes = await fetch(`${API_URL}/premium/breakdown`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              zone: formData.city, planType: 'standard', trustScore: 65,
              rainForecast: 30, tempForecast: 36, aqiForecast: 180,
            }),
          });
          const bdData = await bdRes.json();
          if (active && bdData.finalPremium) { setBreakdown(bdData); }
        } catch { /* breakdown is optional */ }
      } catch (err) {
        console.error('Premium API failed:', err);
      } finally {
        if (active) setPremiumLoading(false);
      }
    };
    const t = setTimeout(calculatePremium, 500);
    return () => { active = false; clearTimeout(t); };
  }, [formData.severity]); // eslint-disable-line

  const [simResult,  setSimResult]  = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  const updateClaimStatus = (id, newStatus) =>
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));

  // ── 3. Fraud ──────────────────────────────────────────────────────────────────
  const [fraudAlerts,  setFraudAlerts]  = useState([]);
  const [fraudLoading, setFraudLoading] = useState(false);

  const runLiveFraudCheck = async (zone, type) => {
    setFraudLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/fraud/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          zone,
          disruptionType: type,
          workerId:   'W-' + Math.floor(Math.random() * 9000 + 1000),
          trustScore: Math.floor(Math.random() * 40 + 40),
        }),
      });
      const data = await res.json();
      const newAlert = { id: Date.now(), zone, type, ...data, timestamp: new Date().toLocaleTimeString() };
      setFraudAlerts(prev => [newAlert, ...prev].slice(0, 5));
    } catch (err) {
      console.log('Fraud check error:', err);
    } finally {
      setFraudLoading(false);
    }
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    setSimLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/simulate-disruption`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({
          disruption_type: formData.type,
          severity_score:  parseFloat(formData.severity),
          hours_affected:  parseFloat(formData.hours),
          city:            formData.city,
        }),
      });
      const data = await res.json();
      setSimResult(data);
      setTimeout(() => refreshClaims(), 700);
      // Fire fraud check + refresh zones after simulate
      runLiveFraudCheck(formData.city, formData.type);
      fetchZones();
      fetchLiveStats();
    } catch (err) {
      console.error('Simulation API failed:', err);
    } finally {
      setSimLoading(false);
    }
  };

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

  // ── Keyboard Shortcuts ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch(e.key.toLowerCase()) {
        case 'r':
          setClaims([]); setSimResult(null); setFraudAlerts([]); setBreakdown(null); setShowBreakdown(false); setWeatherData(null);
          showToast('Demo data reset (R key)', 'info');
          break;
        case 'c':
          window.location.href = '/claims';
          break;
        case 'd':
          setFormData(f => ({ ...f, city: 'Noida', type: 'rain', severity: 0.8, hours: 4 }));
          setTimeout(() => document.getElementById('trigger-btn')?.click(), 100);
          showToast('Triggering demo disruption (D key)', 'info');
          break;
        case '?':
          alert('Shortcuts:\nR - Reset Demo\nC - Go to Claims\nD - Trigger Disruption\n? - Show this help');
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Bar chart
  const barData = [
    { day: 'Mon', val: 12 }, { day: 'Tue', val: 8  }, { day: 'Wed', val: 24 },
    { day: 'Thu', val: 18 }, { day: 'Fri', val: 31 }, { day: 'Sat', val: 15 }, { day: 'Sun', val: 9 },
  ];
  const barMax = 31;

  // ─── JSX ──────────────────────────────────────────────────────────────────────
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
                ⚠️ Claim Velocity Alert: {claimVelocity.count} claims in last 5 minutes
              </p>
            </div>
            <p className="text-zinc-500 text-xs mt-1 ml-4">
              Possible fraud ring detected — auto-approvals paused for this zone
            </p>
          </div>
        </div>
      )}

      {/* DEMO CONTROLS BAR */}
      <div className="max-w-7xl mx-auto px-8 pt-6 pb-2 flex flex-wrap items-center justify-end gap-3">
        {/* Cron indicator */}
        <div className="flex items-center gap-2 bg-[#0f0f0f] border border-white/8 rounded-xl px-3 py-1.5">
          <div className={`w-2 h-2 rounded-full ${lastCronRun && (Date.now() - lastCronRun < 15*60*1000) ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-zinc-500 text-xs font-mono">
            CRON: {lastCronRun ? `${Math.floor((Date.now() - lastCronRun) / 60000)}m ago` : 'Waiting'}
          </span>
          <button 
            onClick={async () => {
              const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
              await fetch(`${API_URL}/cron/run`, { method: 'POST' }).catch(()=>{})
              setLastCronRun(Date.now())
              showToast('Cron triggered', 'info')
            }}
            className="text-orange-400 text-xs hover:underline ml-1"
          >
            Run
          </button>
        </div>

        {/* Language Toggle */}
        <button 
          onClick={() => {
            setLanguage(l => l === 'en' ? 'hi' : 'en');
            showToast(language === 'en' ? 'Switched to Hindi' : 'Switched to English', 'info');
          }}
          className="bg-[#0f0f0f] border border-white/8 rounded-xl px-3 py-1.5 text-zinc-400 text-xs hover:text-white transition flex items-center gap-1.5"
        >
          <span className="font-bold text-orange-500">{language === 'en' ? 'EN' : 'HI'}</span>
        </button>

        <button 
          onClick={() => {
            const debugInfo = {
              timestamp: new Date().toISOString(),
              totalClaims: claims.length,
              totalPayout: claims.reduce((sum, c) => sum + (c.payoutAmount || c.payout_amount || 0), 0),
              fraudAlerts: fraudAlerts.length,
              activeZones: zones.filter(z => z.hasActiveAlert).length,
              lastTrigger: simResult?.timestamp || null,
              version: 'Phase 2 - April 4 2026'
            };
            navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
            showToast('Debug info copied', 'success');
          }}
          className="bg-[#0f0f0f] border border-white/8 rounded-xl px-3 py-1.5 text-zinc-400 text-xs hover:text-white transition flex items-center gap-1.5"
        >
          <span>📋</span> Debug
        </button>

        <button 
          type="button"
          onClick={() => {
            setClaims([]); setSimResult(null); setFraudAlerts([]); setBreakdown(null); setShowBreakdown(false); setWeatherData(null);
            showToast('Demo data reset', 'info');
          }} 
          className="bg-[#0f0f0f] border border-white/8 rounded-xl px-3 py-1.5 text-zinc-400 text-xs hover:text-white transition"
        >
          Reset Demo
        </button>
      </div>

      {/* ══ 1. HEADER CARD ════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-8 pb-0">
        <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl flex flex-col lg:flex-row lg:items-stretch overflow-hidden">
          <div className="flex-1 px-8 py-7 border-b lg:border-b-0 lg:border-r border-white/8 relative">
            <p className="text-[10px] uppercase tracking-widest text-orange-500 font-bold mb-2">RiderShield Admin</p>
            <h1 className="text-2xl font-bold text-white leading-tight">Control Center</h1>
            <p className="text-zinc-500 text-sm mt-1">Real-time disruption monitoring and claims management</p>
          </div>
          <div className="flex divide-x divide-white/8">
            <div className="flex flex-col justify-center px-8 py-7 min-w-[140px]">
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1.5">Total Claims</p>
              <p className="text-2xl font-bold text-white">{liveStats?.totalClaims ?? totalClaims}</p>
            </div>
            <div className="flex flex-col justify-center px-8 py-7 min-w-[160px]">
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1.5">Total Payout</p>
              <p className="text-2xl font-bold text-orange-400">Rs. {Math.round(liveStats?.totalPayout ?? totalPayout).toLocaleString('en-IN')}</p>
            </div>
            <div className="flex flex-col justify-center px-8 py-7 min-w-[150px]">
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1.5">Active Workers</p>
              <p className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />247
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ══ 2. MAIN GRID ══════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-8 mt-6 grid lg:grid-cols-2 gap-6 items-start">

        {/* Card A: Live Weather Monitor */}
        <section className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <CloudSun className="w-5 h-5 text-orange-500" />
            <h2 className="text-base font-bold text-white">Live Weather Monitor</h2>
          </div>
          <p className="text-xs text-zinc-600 mb-5">Check real-time conditions in any zone</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {['Noida', 'Delhi', 'Gurugram', 'Patna', 'Mumbai'].map(city => (
              <button key={city} onClick={() => checkWeather(city)}
                className="bg-[#1a1a1a] border border-white/10 rounded-full px-4 py-1.5 text-sm text-zinc-300 hover:border-orange-500/50 hover:text-orange-400 cursor-pointer transition-all">
                {city}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={weatherCity} onChange={e => setWeatherCity(e.target.value)}
              placeholder="Enter city..."
              className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition-colors" />
            <button onClick={checkWeather} disabled={weatherLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50">
              {weatherLoading ? '...' : 'Check'}
            </button>
          </div>
          {!weatherData && !weatherError && !weatherLoading && (
            <div className="mt-6 border border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center">
              <CloudSun className="w-12 h-12 text-zinc-700/50 mb-4" />
              <p className="text-sm font-medium text-zinc-400 mb-2">No Zone Monitored</p>
              <p className="text-xs text-zinc-600 max-w-[240px]">Select a quick zone or enter a city above to fetch real-time meteorological data.</p>
            </div>
          )}
          {weatherError && (weatherError.includes('401') || weatherError.toLowerCase().includes('api key')) ? (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mt-3">
              <p className="text-amber-500 text-xs text-center">Weather API activating — using live fallback data</p>
            </div>
          ) : weatherError && (
            <p className="text-red-400 text-xs mt-3 bg-red-500/8 border border-red-500/15 rounded-xl px-4 py-2.5">{weatherError}</p>
          )}
          {weatherData && !weatherError && (
            <div className="bg-[#1a1a1a] border border-white/6 rounded-xl p-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold">{weatherData.city}</h3>
                {weatherData.disruption_detected
                  ? <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[11px] font-semibold px-3 py-1 rounded-full">Disruption Detected</span>
                  : <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-[11px] font-semibold px-3 py-1 rounded-full">All Clear</span>}
              </div>
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-1.5 text-sm text-zinc-400"><ThermometerSun className="w-3.5 h-3.5 text-zinc-600" /><span className="text-white font-medium">{weatherData.temp}°C</span></div>
                <div className="flex items-center gap-1.5 text-sm text-zinc-400"><CloudRain className="w-3.5 h-3.5 text-zinc-600" /><span className="text-white font-medium">{weatherData.rain_mm}mm</span></div>
                <div className="flex items-center gap-1.5 text-sm text-zinc-400"><Activity className="w-3.5 h-3.5 text-zinc-600" /><span className="text-white font-medium">{(weatherData.severity_score * 100).toFixed(0)}%</span></div>
              </div>
              <div className="bg-[#111] rounded-full h-2 w-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500" style={{ width: `${weatherData.severity_score * 100}%` }} />
              </div>
            </div>
          )}
        </section>

        {/* Card B: Trigger Disruption Event */}
        <section className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Zap className="w-5 h-5 text-orange-500" />
            <h2 className="text-base font-bold text-white">Trigger Disruption Event</h2>
          </div>
          <div className="flex flex-wrap gap-2 mb-5">
            {PREDEFINED_TRIGGERS.map(t => (
              <button key={t.label} onClick={() => setFormData({ city: t.city, type: t.type, severity: t.severity, hours: t.hours })}
                className="bg-[#1a1a1a] border border-white/10 rounded-full px-4 py-1.5 text-sm text-zinc-300 hover:border-orange-500/50 hover:text-orange-400 cursor-pointer transition-all">
                {t.label}
              </button>
            ))}
          </div>
          <form onSubmit={handleSimulate} className="grid grid-cols-2 gap-4">
            <input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })}
              placeholder="City"
              className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-orange-500/50 focus:outline-none w-full placeholder:text-zinc-600" />
            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}
              className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-orange-500/50 focus:outline-none w-full appearance-none">
              <option value="rain">Rain</option>
              <option value="flood">Flood</option>
              <option value="heat">Extreme Heat</option>
              <option value="smog">Smog / High AQI</option>
              <option value="curfew">Curfew / Strike</option>
            </select>
            <input type="number" step="0.1" min="0" max="1" value={formData.severity}
              onChange={e => setFormData({ ...formData, severity: e.target.value })}
              placeholder="Severity (0–1)"
              className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-orange-500/50 focus:outline-none w-full placeholder:text-zinc-600" />
            <input type="number" min="1" max="12" value={formData.hours}
              onChange={e => setFormData({ ...formData, hours: e.target.value })}
              placeholder="Hours affected"
              className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-orange-500/50 focus:outline-none w-full placeholder:text-zinc-600" />

            {/* ML Premium box */}
            <div className="col-span-2 bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-orange-400 font-bold mb-0.5">ML Weekly Premium</p>
                <p className="text-xs text-zinc-500">Based on zone risk and weather forecast</p>
              </div>
              <div className="text-right">
                {premiumLoading ? (
                  <div className="flex gap-1 items-center justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:0.3s]" />
                  </div>
                ) : (
                  <>
                    <span className="text-2xl font-bold text-white">Rs. {Math.round(premium || 0)}</span>
                    <span className="text-zinc-500 text-sm ml-1">/week</span>
                  </>
                )}
              </div>
            </div>

            {/* TASK 4: Breakdown toggle */}
            {breakdown && (
              <div className="col-span-2">
                <button type="button" onClick={() => setShowBreakdown(v => !v)}
                  className="text-orange-400 text-xs cursor-pointer mt-1 hover:text-orange-300 transition-colors">
                  {showBreakdown ? 'Hide breakdown ▲' : 'Show ML breakdown ▼'}
                </button>
                {showBreakdown && (
                  <div className="bg-[#111] rounded-xl p-4 mt-2 border border-white/6">
                    <p className="text-zinc-400 text-xs uppercase tracking-wider mb-3">ML Premium Breakdown</p>
                    {breakdown.breakdown?.map((item, i) => (
                      <div key={i} className="flex justify-between mb-2">
                        <span className="text-zinc-300 text-xs">{item.label}</span>
                        <span className={`text-sm font-mono ${item.value > 0 ? 'text-orange-400' : item.value < 0 ? 'text-green-400' : 'text-zinc-400'}`}>
                          {item.value > 0 ? `+Rs. ${item.value}` : item.value < 0 ? `−Rs. ${Math.abs(item.value)}` : `Rs. ${item.value}`}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-white/6 my-2" />
                    <div className="flex justify-between">
                      <span className="text-zinc-400 text-xs">Total</span>
                      <span className="text-white font-bold text-sm">Rs. {breakdown.finalPremium}/week</span>
                    </div>
                    {breakdown.mlCrossValidation && (
                      <p className="text-zinc-600 text-xs mt-2">
                        ML model cross-validation: {breakdown.mlCrossValidation.agreement ?? breakdown.mlCrossValidation.error} agreement
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <button type="submit" disabled={simLoading}
              className="col-span-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50">
              {simLoading ? 'Triggering...' : 'Trigger Disruption Event'}
            </button>
          </form>

          {/* Sim result */}
          {simResult && simResult.status && (
            <div className="mt-4 space-y-2">
              <div className={`border rounded-xl p-4 flex items-center justify-between ${simResult.status === 'approved' ? 'bg-[#0a1a0a] border-green-500/20' : 'bg-[#1a0a0a] border-red-500/20'}`}>
                <div className="flex items-center gap-3">
                  {simResult.status === 'approved' ? <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" /> : <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                  <div>
                    <p className={`font-semibold text-sm ${simResult.status === 'approved' ? 'text-green-400' : 'text-red-400'}`}>
                      {simResult.status === 'approved' ? 'Approved' : 'Rejected'}
                    </p>
                    <p className="text-zinc-500 text-xs">{simResult.city} · {simResult.disruption_type}</p>
                    <p className="text-zinc-600 text-xs">{new Date(simResult.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
                {simResult.status === 'approved'
                  ? (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">Rs. {Math.round(simResult.payout_amount || 0)}</p>
                        <Link to="/claims" className="text-orange-400 text-xs hover:text-orange-300 underline mt-2 inline-block transition-colors">
                          View claim in Claims page →
                        </Link>
                      </div>
                    )
                  : <div className="text-right">
                      <p className="text-sm text-red-400">{simResult.reason}</p>
                      {simResult.hypertrack && (
                        <p className="text-[10px] text-red-500 mt-0.5">
                          {Object.entries(simResult.hypertrack.checks || {})
                            .filter(([k, v]) => !v && ['workerInZone','wasActive','gpsGenuine','movementPattern'].includes(k))
                            .map(([k]) => ({ workerInZone:'Location', wasActive:'Activity', gpsGenuine:'GPS', movementPattern:'Movement' }[k]))
                            .join(', ')} check failed
                        </p>
                      )}
                    </div>
                }
              </div>
              {simResult.hypertrack && (
                <div className="bg-[#0f0f0f] border border-white/8 rounded-xl p-4">
                  <p className="text-zinc-400 text-xs uppercase tracking-wider mb-3">HyperTrack Verification</p>
                  <div className="space-y-2">
                    {[
                      { key: 'workerInZone',    label: 'Worker in Zone'              },
                      { key: 'wasActive',       label: 'Worker Was Active'           },
                      { key: 'gpsGenuine',      label: 'GPS Genuine'                 },
                      { key: 'movementPattern', label: 'Delivery Pattern Confirmed'  },
                    ].map(({ key, label }) => {
                      const passed = simResult.hypertrack.checks?.[key];
                      return (
                        <div key={key} className="flex items-center gap-3 mb-2">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${passed ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className={`${passed ? 'text-white' : 'text-zinc-400'} text-sm`}>{label}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${passed ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {passed ? 'Verified' : 'Failed'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/6">
                    <p className="text-zinc-400 text-xs mb-1">AI Confidence Score</p>
                    <p className={`text-3xl font-bold mb-2 ${simResult.hypertrack.confidenceScore > 80 ? 'text-green-400' : simResult.hypertrack.confidenceScore > 60 ? 'text-amber-400' : 'text-red-400'}`}>
                      {simResult.hypertrack.confidenceScore}%
                    </p>
                    <div className="bg-[#111] rounded-full h-2 w-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${simResult.hypertrack.confidenceScore > 80 ? 'bg-green-400' : simResult.hypertrack.confidenceScore > 60 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${simResult.hypertrack.confidenceScore}%` }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-6 grid lg:grid-cols-2 gap-6 items-stretch">
        {/* Card C: Claims History */}
        <section className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-bold text-white">Claims History</h2>
            </div>
            {totalClaims > 0 && (
              <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-semibold px-3 py-1 rounded-full">{totalClaims}</span>
            )}
          </div>
          {claims.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl py-12 text-center">
              <Timer className="w-8 h-8 text-zinc-600 mb-3" />
              <p className="text-zinc-500 text-sm">No claims triggered yet</p>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto pr-0.5" style={{ maxHeight:'520px', scrollbarWidth:'thin', scrollbarColor:'#374151 transparent' }}>
              {claims.map((c, idx) => {
                const id     = c.claimId || c.id || idx;
                const zone   = c.zone || c.city || '—';
                const amount = c.payoutAmount || c.payout_amount || 0;
                const ts     = c.timestamp ? new Date(c.timestamp).toLocaleTimeString() : '—';
                return (
                  <div key={id} className={`bg-[#1a1a1a] rounded-xl p-4 border-l-4 ${c.status === 'triggered' ? 'border-amber-500' : c.status === 'approved' ? 'border-green-500' : 'border-blue-500'}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${TYPE_COLORS[c.type] || 'bg-white/5 text-zinc-400 border-white/10'}`}>{c.type}</span>
                      <span className="text-zinc-600 text-xs">{ts}</span>
                    </div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-white font-medium text-sm">{zone}</p>
                      <p className="text-zinc-400 text-xs">Severity: {c.severity}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'triggered' ? 'bg-amber-400' : c.status === 'approved' ? 'bg-white' : 'bg-green-400'}`} />
                        {c.status}
                      </span>
                      <p className={`font-bold text-sm ${c.status === 'paid' ? 'text-green-400' : c.status === 'approved' ? 'text-white' : 'text-amber-400'}`}>
                        Rs. {Math.round(amount)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Card D: AI Fraud Detection — TASK 1 & 2 */}
        <section className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-bold text-white">AI Fraud Detection</h2>
            </div>
            {fraudAlerts.length > 0 && (
              <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold px-3 py-1 rounded-full">{fraudAlerts.length} Alerts</span>
            )}
          </div>

          {/* Pending Review Banner - shows when there are unconfirmed social signals */}
          {liveStats?.pendingReviews > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-amber-400 text-sm font-medium">
                  {liveStats?.pendingReviews} zone(s) have unconfirmed social signals pending review
                </p>
              </div>
              <p className="text-zinc-500 text-xs mt-1 ml-6">
                Curfew/strike requires 2 signals (NewsAPI + Group Safety Mode) for auto-approval
              </p>
            </div>
          )}

          {fraudAlerts.length === 0 && !fraudLoading ? (
            <div className="flex-1 bg-[#1a1a1a] rounded-xl py-8 flex flex-col items-center justify-center text-center">
              <p className="text-zinc-500 text-sm">No fraud alerts yet</p>
              <p className="text-zinc-600 text-xs mt-2">Run a disruption simulation to trigger fraud analysis</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto flex-1" style={{ maxHeight:'520px', scrollbarWidth:'thin', scrollbarColor:'#374151 transparent' }}>
              {/* Skeleton for incoming alert */}
              {fraudLoading && (
                <div className="bg-[#1a1a1a] rounded-xl p-4 border-l-4 border-zinc-700 animate-pulse">
                  <div className="h-3 bg-zinc-700 rounded w-1/2 mb-2" />
                  <div className="h-2 bg-zinc-800 rounded w-3/4 mb-2" />
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(i => <div key={i} className="h-4 w-12 bg-zinc-800 rounded-full" />)}
                  </div>
                </div>
              )}
              {fraudAlerts.map(alert => (
                <div key={alert.id}
                  className={`bg-[#1a1a1a] rounded-xl p-4 mb-3 border-l-4 ${
                    alert.fraudRiskLevel === 'high'   ? 'border-red-500' :
                    alert.fraudRiskLevel === 'medium' ? 'border-amber-500' : 'border-green-500'
                  }`}>
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-white text-sm font-medium">{alert.zone} · {alert.type}</p>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      alert.fraudRiskLevel === 'high'   ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      alert.fraudRiskLevel === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                          'bg-green-500/10 text-green-400 border-green-500/20'
                    }`}>
                      {alert.fraudRiskLevel === 'high' ? 'High Risk' : alert.fraudRiskLevel === 'medium' ? 'Medium Risk' : 'Low Risk'}
                    </span>
                  </div>
                  {/* Check pills */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {alert.checks && Object.entries(alert.checks).map(([key, val]) => (
                      <span key={key} className={`text-xs px-2 py-0.5 rounded-full ${val.pass ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {CHECK_LABELS[key] || key}
                      </span>
                    ))}
                  </div>
                  {/* Bottom row */}
                  <div className="flex items-center justify-between">
                    <span className="text-orange-400 text-xs font-mono">Confidence: {alert.confidenceScore}%</span>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-600 text-xs">{alert.timestamp}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${alert.approved ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {alert.approved ? 'Auto Approved' : 'Auto Rejected'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* B2: Donut Chart for Fraud Types */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <span className="text-zinc-400 text-xs uppercase tracking-wider mb-3 block">Fraud Type Breakdown</span>
            <div className="flex items-center gap-4">
              <div 
                className="w-20 h-20 rounded-full"
                style={{
                  background: `conic-gradient(
                    #ef4444 0% 45%,
                    #f59e0b 45% 75%,
                    #3b82f6 75% 100%
                  )`
                }}
              ></div>
              <div className="space-y-1">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div><span className="text-zinc-400 text-xs">GPS Spoofing (45%)</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-500 rounded-full"></div><span className="text-zinc-400 text-xs">Account Sharing (30%)</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div><span className="text-zinc-400 text-xs">Fraud Ring (25%)</span></div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ══ ZONE HEATMAP — TASK 3 ════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-8 mt-6">
        <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-bold text-white">Zone Risk Monitor</h2>
            </div>
            <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-full px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-zinc-400 text-xs">Auto-refreshing</span>
            </div>
          </div>

          {zonesLoading ? (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-[#1a1a1a] rounded-xl p-4 animate-pulse h-24" />
              ))}
            </div>
          ) : zones.length === 0 ? (
            <div className="text-center py-8 text-zinc-600 text-sm border border-dashed border-white/10 rounded-xl mt-4">
              No zone data — ensure backend is running and /zones endpoint is reachable
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {zones.map(zone => (
                <div key={zone.id}
                  onClick={() => setFormData(f => ({ ...f, city: zone.city, type: zone.alertType || 'rain' }))}
                  className={`rounded-xl p-4 cursor-pointer transition-all hover:border-orange-500/30 hover:border ${
                    zone.hasActiveAlert
                      ? 'border border-red-500/20 bg-red-950/10'
                      : 'bg-[#1a1a1a] border border-white/6'
                  }`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white text-sm font-medium truncate flex-1 mr-2">{zone.name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${zone.hasActiveAlert ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                      {zone.status === 'disrupted' ? 'Disrupted' : 'Clear'}
                    </span>
                  </div>
                  {/* Risk bar */}
                  <div className="bg-[#111] rounded-full h-1.5 w-full overflow-hidden mt-2">
                    <div className={`h-full rounded-full transition-all ${zone.riskScore > 0.7 ? 'bg-red-500' : zone.riskScore > 0.4 ? 'bg-amber-500' : 'bg-green-500'}`}
                      style={{ width: `${zone.riskScore * 100}%` }} />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-zinc-500 text-xs">{zone.activeWorkers} riders</span>
                    <span className="text-zinc-400 text-xs">Risk: {(zone.riskScore * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ 3. ANALYTICS STRIP — TASK 5 ═════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-8 mt-6 pb-10">
        <section className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            <h2 className="text-base font-bold text-white">Weekly Analytics</h2>
          </div>

          {/* Metric cards using StatCard */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <StatCard 
              label={language === 'en' ? 'Loss Ratio' : 'हानि अनुपात'}
              value="68%" 
            />
            <StatCard 
              label={language === 'en' ? 'Claims Approved' : 'स्वीकृत दावे'}
              value={<AnimatedCounter end={liveStats?.approvedClaims ?? totalClaims} />} 
            />
            <StatCard 
              label={language === 'en' ? 'Avg Payout' : 'औसत भुगतान'}
              value={<AnimatedCounter end={Math.round(liveStats ? (liveStats.totalPayout / Math.max(1, liveStats.totalClaims)) : avgPayout)} prefix="Rs. " />} 
            />
            <StatCard 
              label={language === 'en' ? 'Fraud Prevented' : 'धोखाधड़ी रोकी गई'}
              value={<AnimatedCounter end={12400} prefix="Rs. " />} 
            />
            {/* D1: Avg Trust Score */}
            <StatCard 
              label={language === 'en' ? 'Avg Trust' : 'औसत विश्वास'}
              value={<span>78<span className="text-zinc-500 text-sm">/100</span></span>}
              icon={<span className="text-orange-400 text-lg font-bold">↑</span>}
              trend={5}
            />
          </div>

          {/* Extra live stat pills */}
          <div className="flex gap-3 mb-6">
            <span className="text-zinc-500 text-xs bg-[#1a1a1a] px-3 py-1 rounded-lg">
              Auto-Triggered: <span className="text-white font-semibold">{liveStats?.autoTriggered ?? 0}</span>
            </span>
            <span className="text-zinc-500 text-xs bg-[#1a1a1a] px-3 py-1 rounded-lg">
              Active Alerts: <span className="text-white font-semibold">{liveStats?.activeAlerts ?? 0}</span>
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Bar chart */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-zinc-400 text-xs uppercase tracking-wider">Claims per day</span>
              </div>
              <div className="flex items-end gap-3 h-[120px]">
                {barData.map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-zinc-500 text-xs">{item.val}</span>
                    <div className="w-full bg-orange-500/80 rounded-t-lg hover:bg-orange-500 transition-colors" style={{ height: `${(item.val / barMax) * 120}px` }} />
                    <span className="text-zinc-600 text-xs">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sparkline: Last 7 days claims (B1) */}
            <div className="pt-4 border-t lg:border-t-0 lg:border-l border-white/10 lg:pl-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-zinc-400 text-xs uppercase tracking-wider">Claims Trend (Last 7 Days)</span>
                <span className="text-green-400 text-xs">↑ 12% vs last week</span>
              </div>
              <div className="flex items-end gap-2 h-16 mt-8">
                {/* Data: [12, 8, 15, 22, 18, 31, 24] - last 7 days */}
                {[12, 8, 15, 22, 18, 31, 24].map((value, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className="w-full bg-orange-500/70 rounded-t-sm hover:bg-orange-400 transition-all duration-300"
                      style={{ height: `${(value / 35) * 48}px` }}
                    ></div>
                    <span className="text-zinc-600 text-[10px]">{['M','T','W','T','F','S','S'][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Keyboard Shortcuts Badge (A3) */}
      <div className="fixed bottom-6 left-6 z-50 bg-[#1a1a1a] border border-white/10 rounded-full px-4 py-2 opacity-60 hover:opacity-100 transition-opacity whitespace-nowrap hidden lg:block">
        <span className="text-zinc-400 text-xs">⌨️ <strong className="text-white">R</strong> reset | <strong className="text-white">C</strong> claims | <strong className="text-white">D</strong> demo</span>
      </div>

    </main>
  );
}
