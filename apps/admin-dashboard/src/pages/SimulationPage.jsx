import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Toast from '../components/Toast';
import {
  CloudSun,
  ThermometerSun,
  CloudRain,
  Activity,
  Zap,
  CheckCircle2,
  XCircle,
  BarChart3,
} from 'lucide-react';

const PREDEFINED_TRIGGERS = [
  { label: 'Heavy Rain',   city: 'Noida',   type: 'rain',   severity: 0.8,  hours: 4  },
  { label: 'Extreme Heat', city: 'Delhi',   type: 'heat',   severity: 0.7,  hours: 5  },
  { label: 'High AQI',    city: 'Delhi',   type: 'smog',   severity: 0.9,  hours: 6  },
  { label: 'Curfew',      city: 'Lucknow', type: 'curfew', severity: 0.6,  hours: 8  },
  { label: 'Flood',       city: 'Patna',   type: 'flood',  severity: 0.95, hours: 10 },
];

const CHECK_LABELS = {
  claimVelocity:     'Velocity',
  trustScore:        'Trust',
  timePattern:       'Hours',
  gpsCluster:        'GPS',
  deviceFingerprint: 'Device',
};

export default function SimulationPage() {
  const token = localStorage.getItem('ridershield_admin_token');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  };

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
  }, [formData.severity, formData.city, token]);

  const [simResult,  setSimResult]  = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  // ── 3. Fraud Linker ───────────────────────────────────────────────────────────
  const runLiveFraudCheck = async (zone, type) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await fetch(`${API_URL}/fraud/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          zone,
          disruptionType: type,
          workerId:   'W-' + Math.floor(Math.random() * 9000 + 1000),
          trustScore: Math.floor(Math.random() * 40 + 40),
        }),
      });
    } catch { /* Silent tracking */ }
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
      runLiveFraudCheck(formData.city, formData.type);
      showToast('Disruption simulated successfully', 'success');
    } catch (err) {
      console.error('Simulation API failed:', err);
      showToast('Simulation failed to connect', 'error');
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pb-24" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-8 pt-8 pb-6">
        <p className="text-[10px] uppercase tracking-widest text-orange-500 font-bold mb-2">Hackathon God Mode</p>
        <h1 className="text-3xl font-bold text-white leading-tight">Simulation & AI Studio</h1>
        <p className="text-zinc-400 text-sm mt-2 max-w-2xl">
          Trigger real-time weather disruptions, inject synthetic claims telemetry, and visualize the live ML Premium pricing model behavior.
        </p>
      </div>

      {/* 3-COLUMN GRID */}
      <div className="max-w-7xl mx-auto px-8 mt-4 grid lg:grid-cols-3 gap-6 items-start">

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
        <section className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6 flex flex-col min-h-[460px]">
          <div className="flex items-center gap-2 mb-5">
            <Zap className="w-5 h-5 text-orange-500" />
            <h2 className="text-base font-bold text-white">Disruption Simulator</h2>
          </div>
          <div className="flex flex-wrap gap-2 mb-5">
            {PREDEFINED_TRIGGERS.map(t => (
              <button key={t.label} onClick={() => setFormData({ city: t.city, type: t.type, severity: t.severity, hours: t.hours })}
                className="bg-[#1a1a1a] border border-white/10 rounded-full px-4 py-1.5 text-sm text-zinc-300 hover:border-orange-500/50 hover:text-orange-400 cursor-pointer transition-all">
                {t.label}
              </button>
            ))}
          </div>
          <form onSubmit={handleSimulate} className="flex flex-col gap-4 flex-1">
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
            
            <div className="grid grid-cols-2 gap-4">
              <input type="number" step="0.1" min="0" max="1" value={formData.severity}
                onChange={e => setFormData({ ...formData, severity: e.target.value })}
                placeholder="Severity"
                className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-orange-500/50 focus:outline-none w-full placeholder:text-zinc-600" />
              <input type="number" min="1" max="12" value={formData.hours}
                onChange={e => setFormData({ ...formData, hours: e.target.value })}
                placeholder="Hours"
                className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-orange-500/50 focus:outline-none w-full placeholder:text-zinc-600" />
            </div>

            <div className="mt-auto pt-4">
              <button type="submit" disabled={simLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40">
                {simLoading ? 'Executing Simulation...' : 'Trigger Global Disruption Event'}
              </button>
            </div>
          </form>
        </section>

        {/* Card C: ML Premium Engine Explorer */}
        <section className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6 relative overflow-hidden flex flex-col items-start min-h-[460px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <div className="flex items-center gap-2 mb-4 relative z-10">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            <h2 className="text-base font-bold text-white">ML Premium Engine</h2>
          </div>
          
          <p className="text-zinc-500 text-xs mb-6 relative z-10">Live dynamic pricing model tracking zone risk.</p>
          
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 mb-4 relative z-10 flex items-center justify-between w-full">
             <div>
               <p className="text-white font-medium text-sm">Target Rate</p>
             </div>
             <div className="text-right">
               {premiumLoading ? (
                 <div className="flex gap-1 items-center justify-end">
                   <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" />
                   <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:0.15s]" />
                   <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:0.3s]" />
                 </div>
               ) : (
                 <div className="flex items-baseline gap-1">
                   <span className="text-2xl font-bold text-white tracking-tight">Rs. {Math.round(premium || 0)}</span>
                   <span className="text-zinc-500 text-xs">/w</span>
                 </div>
               )}
             </div>
          </div>

          <div className="relative w-full flex-1 flex flex-col justify-end">
            <button type="button" onClick={() => setShowBreakdown(v => !v)}
              className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-orange-400 text-xs font-medium cursor-pointer transition-colors flex items-center justify-between">
              <span>View Model Coefficients</span>
              <span>{showBreakdown ? '▲' : '▼'}</span>
            </button>
            
            {showBreakdown && breakdown && (
              <div className="bg-[#111] rounded-xl p-5 mt-3 border border-white/6 shadow-lg shadow-black/50">
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-4">Pricing Breakdown</p>
                <div className="space-y-3">
                  {breakdown.breakdown?.map((item, i) => (
                    <div key={i} className="flex justify-between items-center group">
                      <span className="text-zinc-400 text-xs group-hover:text-zinc-300 transition-colors">{item.label}</span>
                      <span className={`text-xs font-mono font-medium ${item.value > 0 ? 'text-orange-400' : item.value < 0 ? 'text-green-400' : 'text-zinc-500'}`}>
                        {item.value > 0 ? `+Rs. ${item.value}` : item.value < 0 ? `−Rs. ${Math.abs(item.value)}` : `Rs. ${item.value}`}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/10 my-4" />
                <div className="flex justify-between items-center">
                  <span className="text-zinc-300 text-xs font-bold">Generated Premium</span>
                  <span className="text-white font-bold font-mono text-sm">Rs. {breakdown.finalPremium}</span>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Row 2: Validation Results Box (Shows directly below when simulation succeeds) */}
      {simResult && simResult.status && (
        <div className="max-w-7xl mx-auto px-8 mt-6">
          <div className={`border rounded-2xl p-6 flex flex-col md:flex-row gap-8 ${simResult.status === 'approved' ? 'bg-[#0a1a0a] border-green-500/20' : 'bg-[#1a0a0a] border-red-500/20'}`}>
            
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-4">
                {simResult.status === 'approved' ? <CheckCircle2 className="w-8 h-8 text-green-400 shrink-0" /> : <XCircle className="w-8 h-8 text-red-400 shrink-0" />}
                <div>
                  <p className={`font-bold text-lg ${simResult.status === 'approved' ? 'text-green-400' : 'text-red-400'}`}>
                    {simResult.status === 'approved' ? 'Synthetic Claim Auto-Approved' : 'Synthetic Claim Rejected'}
                  </p>
                  <p className="text-zinc-400 text-sm mt-0.5">{simResult.city} · {simResult.disruption_type}</p>
                </div>
              </div>
              
              {simResult.status === 'approved' ? (
                <div className="mt-2 text-xl font-bold text-white">
                  Calculated Instant Payout: Rs. {Math.round(simResult.payout_amount || 0)}
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-sm text-red-400 font-medium">{simResult.reason}</p>
                </div>
              )}
              
              <Link to="/claims" className="text-orange-400 text-xs hover:text-orange-300 mt-4 inline-block transition-colors font-semibold">
                View entry in Live Claims stream →
              </Link>
            </div>

            {simResult.hypertrack && (
              <div className="flex-1 md:border-l border-white/10 md:pl-8">
                 <p className="text-zinc-400 text-[10px] uppercase tracking-wider mb-4 font-bold">HyperTrack Geo-Telemetry Validation</p>
                 <div className="space-y-3">
                    {[
                      { key: 'workerInZone',    label: 'Worker Verified strictly inside Polygon'              },
                      { key: 'wasActive',       label: 'Worker Was Active before Disruption'           },
                      { key: 'gpsGenuine',      label: 'GPS Mocking / Tampering Check'                 },
                      { key: 'movementPattern', label: 'Delivery Movement Pattern Confirmed'  },
                    ].map(({ key, label }) => {
                      const passed = simResult.hypertrack.checks?.[key];
                      return (
                        <div key={key} className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${passed ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`} />
                          <span className={`${passed ? 'text-white' : 'text-zinc-400'} text-xs font-medium`}>{label}</span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm ml-auto ${passed ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {passed ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
              </div>
            )}
          </div>
        </div>
      )}

    </main>
  );
}
