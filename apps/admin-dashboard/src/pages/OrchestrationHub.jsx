import React, { useState } from 'react';
import {
  Terminal,
  RefreshCcw,
  Cpu,
  ShieldCheck,
  Zap,
  Globe,
  Settings2,
  ChevronRight,
  Copy,
  CheckCircle2,
  Smartphone,
  Lock,
  BarChart3,
  AlertTriangle,
  Gift,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function CopyBadge({ value }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 font-mono text-xs bg-white/5 border border-white/10 rounded-md px-2.5 py-1 text-zinc-300 hover:text-white hover:border-white/20 transition-all"
    >
      {value}
      {copied ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-zinc-600" />}
    </button>
  );
}

export default function OrchestrationHub() {
  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), msg: 'System Kernel initialized.', type: 'info' },
    { time: new Date().toLocaleTimeString(), msg: 'Parametric Engine standing by...', type: 'info' },
  ]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const token = localStorage.getItem('ridershield_admin_token');

  const addLog = (msg, type = 'info') => {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg, type }, ...prev].slice(0, 12));
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    addLog('Manual Pulse Triggered — initiating global disruption scan...', 'warn');
    try {
      const res = await fetch(`${API_URL}/cron/run`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        addLog('Detection cycle complete. Checking all 4 zones...', 'info');
        addLog('OpenWeatherMap polled. WAQI AQI checked. NewsAPI queried.', 'success');
        addLog('Results will appear in Claims Engine within 10 seconds.', 'success');
      } else {
        addLog('Pulse failed — check backend connection.', 'error');
      }
    } catch (err) {
      addLog(`Network error: ${err.message}`, 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('This will clear ALL claims and active alerts. Proceed?')) return;
    setIsResetting(true);
    addLog('INITIATING SYSTEM RESET — clearing all simulation data...', 'error');
    try {
      const res = await fetch(`${API_URL}/dev/system-reset`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        addLog('Database sanitized. All claims cleared. Ready for fresh demo.', 'success');
      } else {
        addLog('Reset failed.', 'error');
      }
    } catch (err) {
      addLog('Reset failed — check backend.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black rounded-md uppercase tracking-widest">
              Hackathon Mode
            </span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            System Orchestrator
            <Cpu className="w-8 h-8 text-orange-500" />
          </h1>
          <p className="text-zinc-500 text-sm mt-3 leading-relaxed max-w-2xl">
            Hackathon Evaluator Hub. Use this page to understand the full system, run live demonstrations,
            and access all credentials you need to evaluate RiderShield.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl font-bold hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${isExecuting ? 'animate-spin' : ''}`} />
            Execute Pulse
          </button>
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-3 rounded-2xl font-bold hover:bg-red-500/20 transition-all active:scale-95"
          >
            <Zap className="w-4 h-4" />
            Reset Env
          </button>
        </div>
      </div>

      {/* Judge Credentials Panel */}
      <div className="bg-orange-500/5 border border-orange-500/20 rounded-3xl p-8">
        <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <Lock className="w-5 h-5 text-orange-500" />
          Evaluator Credentials
        </h2>
        <p className="text-zinc-500 text-xs mb-6">All login details for every component of the RiderShield platform.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin Dashboard */}
          <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5 space-y-3">
            <p className="text-[10px] uppercase tracking-widest font-bold text-orange-400">Admin Dashboard</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-zinc-600 text-xs">Email</span>
                <CopyBadge value="admin@ridershield.in" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600 text-xs">Password</span>
                <CopyBadge value="RiderShield@2026" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600 text-xs">Role</span>
                <span className="text-xs text-orange-400 font-mono">superadmin</span>
              </div>
            </div>
          </div>

          {/* Worker Mobile App */}
          <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5 space-y-3">
            <p className="text-[10px] uppercase tracking-widest font-bold text-blue-400 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" /> Worker Mobile App
            </p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-zinc-600 text-xs">Phone</span>
                <CopyBadge value="9999999999" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600 text-xs">OTP Code</span>
                <CopyBadge value="123456" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600 text-xs">Mode</span>
                <span className="text-xs text-green-400 font-mono">Hackathon Demo</span>
              </div>
            </div>
          </div>

          {/* Alt Admin Roles */}
          <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5 space-y-3">
            <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Alternative Roles</p>
            <div className="space-y-2">
              {[
                ['Zone Manager', 'zone@ridershield.in', 'ZoneManager@2026'],
                ['Analyst', 'analyst@ridershield.in', 'Analyst@2026'],
              ].map(([role, email, pass]) => (
                <div key={role} className="border-b border-white/5 pb-2 last:border-0 last:pb-0">
                  <p className="text-zinc-400 text-xs font-semibold">{role}</p>
                  <p className="text-zinc-600 text-[10px] font-mono mt-0.5">{email}</p>
                  <p className="text-zinc-600 text-[10px] font-mono">{pass}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* The Parametric Loop */}
      <div className="bg-[#0f0f0f] border border-white/8 rounded-3xl p-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          The Parametric Loop
          <div className="h-px w-20 bg-white/10" />
        </h2>
        <p className="text-zinc-500 text-xs mb-8">How RiderShield goes from real-world event to UPI credit in under 4 seconds.</p>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          {[
            { icon: Globe,      label: 'Detection',   desc: 'OpenWeatherMap + WAQI + NewsAPI polled every 15 min',  color: 'text-blue-400'   },
            { icon: Cpu,        label: 'ML Engine',   desc: 'Random Forest payout + Gradient Boost premium models', color: 'text-orange-400' },
            { icon: ShieldCheck,label: 'Fraud Guard', desc: '5-check parallel: GPS, velocity, trust, device, time', color: 'text-green-400'  },
            { icon: Zap,        label: 'UPI Credit',  desc: 'Razorpay payout dispatched. Push notification sent.',  color: 'text-purple-400' },
          ].map((step, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center text-center gap-4 group">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all group-hover:scale-110 group-hover:border-orange-500/40">
                  <step.icon className={`w-8 h-8 ${step.color}`} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{step.label}</p>
                  <p className="text-zinc-600 text-[10px] mt-1 max-w-[140px] leading-relaxed">{step.desc}</p>
                </div>
              </div>
              {i < 3 && <ChevronRight className="w-6 h-6 text-zinc-800 hidden lg:block shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Judge Walkthrough + Terminal side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Step-by-Step Walkthrough */}
        <div className="bg-[#0f0f0f] border border-white/8 rounded-3xl p-8">
          <h3 className="text-white font-bold mb-1 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-orange-500" />
            Evaluator Walkthrough — Full Demo in 4 Steps
          </h3>
          <p className="text-zinc-600 text-xs mb-6">Follow these steps exactly to see the complete end-to-end system.</p>

          <div className="space-y-5">
            {[
              {
                icon: Globe,
                color: 'text-blue-400',
                border: 'border-blue-500/20',
                title: 'Step 1 — Trigger a Disruption',
                desc: 'Go to Simulation Studio in the sidebar. Click any preset (e.g. "Extreme Heat" for Delhi). Press Simulate Disruption. Watch the confidence score and payout calculate in real time.',
              },
              {
                icon: BarChart3,
                color: 'text-orange-400',
                border: 'border-orange-500/20',
                title: 'Step 2 — View the Claim',
                desc: 'Open the Claims Engine. The new claim will appear with status "paid". You will see the HyperTrack session ID, fraud confidence score, and exact Rs. payout amount.',
              },
              {
                icon: Smartphone,
                color: 'text-green-400',
                border: 'border-green-500/20',
                title: 'Step 3 — Open the Worker App',
                desc: 'In the mobile app, enter phone 9999999999 and OTP 123456. The home screen will show an alert banner for the disruption you just triggered. Navigate to Earnings to see Claims Filed: 0 and a positive ROI.',
              },
              {
                icon: Gift,
                color: 'text-purple-400',
                border: 'border-purple-500/20',
                title: 'Step 4 — Explore the Platform',
                desc: 'Check Analytics for live charts. Check Workers for trust score profiles. Check Rewards & Rebacks to see the 15% no-claim cashback system. Click Execute Pulse above to run one full detection cycle manually.',
              },
            ].map((step, i) => (
              <div key={i} className={`flex gap-4 p-4 bg-[#0a0a0a] border ${step.border} rounded-2xl`}>
                <div className="shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center">
                    <step.icon className={`w-4 h-4 ${step.color}`} />
                  </div>
                </div>
                <div>
                  <p className="text-white text-sm font-bold mb-1">{step.title}</p>
                  <p className="text-zinc-500 text-xs leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Terminal Logs */}
        <div className="space-y-6">
          <div className="bg-[#050505] border border-white/5 rounded-3xl p-6 font-mono">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-zinc-500" />
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">System Pulse Terminal</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
              </div>
            </div>
            <div className="space-y-2.5 h-56 overflow-y-auto pr-1">
              {logs.map((log, i) => (
                <div key={i} className="text-[11px]">
                  <span className="text-zinc-700 mr-3">[{log.time}]</span>
                  <span className={
                    log.type === 'info'    ? 'text-zinc-400' :
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'warn'    ? 'text-orange-400' :
                    'text-red-400'
                  }>
                    {log.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick-reference architecture card */}
          <div className="bg-[#0f0f0f] border border-white/8 rounded-3xl p-6">
            <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              What is Running Right Now
            </h4>
            <div className="space-y-2.5">
              {[
                ['Worker App',       'Expo React Native — port 8081',      'text-blue-400'  ],
                ['Admin Dashboard',  'React + Vite — port 5173',           'text-orange-400'],
                ['Backend API',      'Node.js + Express — port 5000',      'text-green-400' ],
                ['ML Service',       'Python FastAPI — port 8000',         'text-purple-400'],
                ['Database',         'MongoDB Atlas (cloud)',               'text-cyan-400'  ],
                ['CRON Cycle',       'Multi-signal detection — every 15min','text-zinc-400'  ],
              ].map(([label, desc, color]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${color}`}>{label}</span>
                  <span className="text-zinc-600 text-[11px] font-mono">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
