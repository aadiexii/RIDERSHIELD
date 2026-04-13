import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Check, X, BookOpen, Bike, Building2, FileText,
  ShieldCheck, Zap, BarChart3, Code2, Layers, Lock,
  ChevronLeft, ChevronRight, PanelRightClose, PanelRightOpen
} from 'lucide-react';


// ─── Sidebar navigation ───────────────────────────────────────────────────────
const NAV = [
  {
    section: 'Getting Started',
    items: [
      { id: 'Introduction',  label: 'Introduction',  Icon: BookOpen },
      { id: 'HowItWorks',    label: 'How It Works',  Icon: Zap      },
      { id: 'QuickSetup',    label: 'Quick Setup',   Icon: Code2    },
    ],
  },
  {
    section: 'For Delivery Riders',
    items: [
      { id: 'Registration',  label: 'Registration',    Icon: Bike       },
      { id: 'CoveragePlans', label: 'Coverage Plans',  Icon: ShieldCheck},
      { id: 'SafetyMode',    label: 'Safety Mode',     Icon: Lock       },
      { id: 'Payouts',       label: 'Payouts',         Icon: Layers     },
    ],
  },
  {
    section: 'For Companies',
    items: [
      { id: 'AdminDashboard', label: 'Admin Dashboard', Icon: Building2 },
      { id: 'ZoneManagement', label: 'Zone Management', Icon: Layers    },
      { id: 'FraudDetection', label: 'Fraud Detection', Icon: ShieldCheck},
      { id: 'Analytics',      label: 'Analytics',       Icon: BarChart3  },

    ],
  },
  {
    section: 'Coverage Reference',
    items: [
      { id: 'DisruptionTypes', label: 'Disruption Types', Icon: Zap      },
      { id: 'Thresholds',      label: 'Thresholds',       Icon: BarChart3},
      { id: 'MLPayoutModel',   label: 'ML Payout Model',  Icon: Code2    },
    ],
  },
  {
    section: 'API Reference',
    items: [
      { id: 'Endpoints',       label: 'Endpoints',      Icon: Code2    },
      { id: 'Authentication',  label: 'Authentication', Icon: Lock     },
      { id: 'Webhooks',        label: 'Webhooks',       Icon: Zap      },
    ],
  },
];

// ─── TOC per section ──────────────────────────────────────────────────────────
const TOC = {
  Introduction:  ['What is RiderShield?', 'How Parametric Insurance Works', 'The 10-Step Flow'],
  HowItWorks:    ['Zone Detection Pipeline', 'ML Model Output Example', 'Severity Scoring'],
  CoveragePlans: ['Basic Plan', 'Standard Plan', 'Premium Plan', 'Plan Comparison'],
  DisruptionTypes: ['Weather Disruptions', 'Civil Disruptions', 'Environmental', 'Threshold Reference'],
  MLPayoutModel: ['Payout Formula', 'Worked Example', 'ML Input Features', 'Model Confidence'],
  AdminDashboard: ['Weather Monitor', 'Trigger Events', 'Claims History', 'Fraud Detection', 'Analytics'],
};

// ─── Content sections ─────────────────────────────────────────────────────────
const card = 'bg-[#111] border border-white/8 rounded-2xl p-6';

function SectionHeading({ id, children }) {
  return (
    <h2 id={id} className="text-2xl font-bold text-white mt-10 mb-3 scroll-mt-24">
      {children}
    </h2>
  );
}
function H3({ children }) {
  return <h3 className="text-base font-semibold text-white mt-6 mb-2">{children}</h3>;
}
function Body({ children }) {
  return <p className="text-zinc-400 text-sm leading-relaxed">{children}</p>;
}

function Introduction() {
  return (
    <article className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-zinc-600 mb-6">RiderShield / Docs / Introduction</p>
      <h1 className="text-4xl font-bold text-white leading-tight">RiderShield Documentation</h1>
      <p className="text-zinc-400 text-lg leading-relaxed pt-1">
        Everything you need to understand and use RiderShield's parametric insurance platform.
      </p>

      <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl px-4 py-3 mt-6 text-sm text-zinc-300">
        <span className="text-orange-400 font-semibold">Note: </span>
        RiderShield is currently in Phase 2 development. Built for Guidewire DEVTrails 2026.
      </div>

      <SectionHeading id="what-is">What is RiderShield?</SectionHeading>
      <Body>
        RiderShield is India's first zero-touch parametric insurance platform for gig delivery workers.
        When external disruptions like rain, floods, or curfews hit a delivery zone, every registered
        rider in that zone automatically receives a UPI payout. No claims. No forms. No waiting.
      </Body>

      <SectionHeading id="parametric">How Parametric Insurance Works</SectionHeading>
      <div className="grid grid-cols-[1fr_32px_1fr] gap-4 items-start mt-4">
        <div className={`${card} border-red-500/10`}>
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full mb-4 inline-block">Old Way</span>
          <p className="text-white font-semibold text-sm mb-3">Traditional Insurance</p>
          <ul className="space-y-2">
            {['Manual claim filing','Human review','Days to weeks payout','Proof required','Disputes common'].map(i => (
              <li key={i} className="flex items-center gap-2 text-xs text-zinc-400">
                <X className="w-3 h-3 text-red-400 shrink-0" />{i}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-center pt-16 text-zinc-600 text-lg">→</div>
        <div className={`${card} border-green-500/15`}>
          <span className="text-[10px] font-bold uppercase tracking-widest text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full mb-4 inline-block">Our Way</span>
          <p className="text-white font-semibold text-sm mb-3">RiderShield Parametric</p>
          <ul className="space-y-2">
            {['Zero-touch automatic','AI verification','Minutes to payout','Data-driven','Zero disputes'].map(i => (
              <li key={i} className="flex items-center gap-2 text-xs text-zinc-400">
                <Check className="w-3 h-3 text-green-400 shrink-0" />{i}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <SectionHeading id="flow">The 10-Step Flow</SectionHeading>
      <div className="space-y-2.5 mt-2">
        {[
          ['Weather Sensor Fires',      'OpenWeatherMap detects rain, heat, AQI, or flood in a delivery zone.'],
          ['Zone Threshold Check',      'AI compares sensor data against hard thresholds (e.g. >50mm/hr rain).'],
          ['Severity Score Computed',   'ML model calculates 0–1 severity based on intensity and duration.'],
          ['Worker Lookup',             'Backend fetches all registered riders in the affected zone.'],
          ['Payout Calculation',        'Dynamic payout = hourly earnings × hours affected × severity score.'],
          ['Fraud Detection',           'AI cross-checks GPS, activity, and behavioral patterns per rider.'],
          ['Approval Gate',             'Claims above confidence threshold (>85%) are auto-approved.'],
          ['UPI Transfer Triggered',    'Payout dispatcher sends funds to each rider\'s registered UPI ID.'],
          ['Rider Notification',        'Push notification and in-app confirmation sent.'],
          ['Audit Log Written',         'All events logged immutably for regulators and company dashboards.'],
        ].map(([title, desc], i) => (
          <div key={i} className="flex gap-3 items-start bg-[#111] border border-white/6 rounded-xl px-4 py-3">
            <div className="w-6 h-6 rounded-full bg-orange-500/15 border border-orange-500/25 flex items-center justify-center shrink-0 text-orange-400 text-xs font-bold mt-0.5">
              {i + 1}
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-snug">{title}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function HowItWorks() {
  return (
    <article className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-zinc-600 mb-6">RiderShield / Docs / How It Works</p>
      <h1 className="text-4xl font-bold text-white">How RiderShield Works</h1>
      <p className="text-zinc-400 text-lg pt-1">Zone-based detection, ML scoring, and automatic UPI payouts.</p>

      <SectionHeading id="detection">Zone Detection Pipeline</SectionHeading>
      <Body>
        Every 15 minutes, the backend polls OpenWeatherMap for all registered delivery zones.
        When a configured threshold is crossed, the disruption pipeline fires immediately:
        severity is computed, eligible riders are fetched, fraud checks run in parallel,
        and approved payouts dispatch within 2 minutes. No human review required.
      </Body>

      <SectionHeading id="ml-output">ML Model Output Example</SectionHeading>
      <div className="bg-[#141414] rounded-xl p-4 font-mono text-sm text-green-400 overflow-x-auto border border-white/6">
{`{
  "workerId":         "W-4821",
  "zone":             "Noida Sector 18",
  "disruptionType":   "rain",
  "severityScore":    0.87,
  "hoursAffected":    4,
  "earningsBaseline": 5400,
  "payoutAmount":     334.08,
  "confidence":       0.94
}`}
      </div>

      <SectionHeading id="severity">Severity Scoring</SectionHeading>
      <Body>
        Severity is a 0–1 float computed by the gradient-boosted ML model. A score of 0.87 means
        the disruption is severe enough to trigger full payout. Scores below 0.5 may result in partial
        payouts depending on plan tier. The model is re-calibrated monthly on actual claim outcomes.
      </Body>
    </article>
  );
}

function CoveragePlans() {
  const plans = [
    {
      tier:'Basic', price:'49', border:'border-white/8', highlight:'',
      tag: null,
      features:['Heavy Rain coverage','Extreme Heat coverage','UPI auto-payout','Zone monitoring'],
      locked:['AQI / Smog', 'Flood', 'Curfew / Strike', 'Priority support'],
    },
    {
      tier:'Standard', price:'79', border:'border-orange-500/30', highlight:'bg-orange-500/3',
      tag: 'Most Popular',
      features:['Heavy Rain coverage','Extreme Heat coverage','AQI / Smog coverage','Flood coverage','UPI auto-payout','Zone monitoring'],
      locked:['Curfew / Strike', 'Priority support'],
    },
    {
      tier:'Premium', price:'119', border:'border-purple-500/25', highlight:'bg-purple-500/3',
      tag: null,
      features:['All 6 disruption types','UPI auto-payout','Zone monitoring','Priority support','Dedicated account manager'],
      locked:[],
    },
  ];
  return (
    <article className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-zinc-600 mb-6">RiderShield / Docs / Coverage Plans</p>
      <h1 className="text-4xl font-bold text-white">Coverage Plans</h1>
      <p className="text-zinc-400 text-lg pt-1">Three tiers of protection. All zero-touch.</p>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        {plans.map(p => (
          <div key={p.tier} className={`${p.highlight || 'bg-[#0f0f0f]'} border ${p.border} rounded-2xl p-5 flex flex-col`}>
            {p.tag && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full mb-3 self-start">
                {p.tag}
              </span>
            )}
            <h3 className="text-white font-bold text-base mb-1">{p.tier}</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-2xl font-bold text-white">Rs. {p.price}</span>
              <span className="text-zinc-500 text-xs">/week</span>
            </div>
            <ul className="space-y-1.5 flex-1">
              {p.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-zinc-300">
                  <Check className="w-3 h-3 text-orange-400 shrink-0"/>{f}
                </li>
              ))}
              {p.locked.map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-zinc-700">
                  <Check className="w-3 h-3 shrink-0"/><span className="line-through">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <SectionHeading id="comparison">Plan Comparison</SectionHeading>
      <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1a1a1a] border-b border-white/6">
              <th className="text-left text-xs uppercase tracking-widest text-zinc-500 font-bold px-4 py-3">Feature</th>
              {['Basic','Standard','Premium'].map(t => (
                <th key={t} className="text-center text-xs uppercase tracking-widest text-zinc-500 font-bold px-4 py-3">{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Rain', true, true, true],
              ['Heat', true, true, true],
              ['AQI / Smog', false, true, true],
              ['Flood', false, true, true],
              ['Curfew / Strike', false, false, true],
              ['Priority Support', false, false, true],
            ].map(([f, ...vals]) => (
              <tr key={f} className="border-b border-white/4">
                <td className="px-4 py-2.5 text-zinc-400">{f}</td>
                {vals.map((v, i) => (
                  <td key={i} className="px-4 py-2.5 text-center">
                    {v
                      ? <Check className="w-4 h-4 text-green-400 mx-auto"/>
                      : <X     className="w-4 h-4 text-zinc-700 mx-auto"/>
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function DisruptionTypes() {
  const rows = [
    ['Heavy Rain',      'Weather',       '> 50 mm/hr',            'OpenWeatherMap'],
    ['Extreme Heat',    'Weather',       '> 45°C for 2+ hrs',     'OpenWeatherMap'],
    ['Severe Flood',    'Environmental', 'Govt. advisory issued', 'NDMA API'],
    ['High AQI',        'Air Quality',   '> 400 AQI for 3 hrs',   'CPCB API'],
    ['Curfew / Strike', 'Civil',         'Official zone lockdown','Govt. API'],
    ['Strong Winds',    'Weather',       '> 50 km/h',             'OpenWeatherMap'],
    ['Cyclone',         'Weather',       'IMD cyclone advisory',  'IMD API'],
  ];
  return (
    <article className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-zinc-600 mb-6">RiderShield / Coverage Reference</p>
      <h1 className="text-4xl font-bold text-white">Disruption Types & Thresholds</h1>
      <p className="text-zinc-400 text-lg pt-1">Hard thresholds that trigger automatic payouts when breached.</p>

      <SectionHeading id="weather">Weather Disruptions</SectionHeading>
      <Body>Rain, heat, and wind disruptions use real-time data from OpenWeatherMap polled every 15 minutes across all registered zones.</Body>

      <SectionHeading id="threshold-table">Threshold Reference</SectionHeading>
      <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden mt-2">
        <table className="w-full">
          <thead>
            <tr className="bg-[#1a1a1a] border-b border-white/6">
              {['Disruption Type','Category','Threshold','Data Source'].map(h => (
                <th key={h} className="text-left text-xs uppercase tracking-widest text-zinc-500 font-bold px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 text-white font-medium text-sm">{r[0]}</td>
                <td className="px-4 py-3 text-zinc-400 text-sm">{r[1]}</td>
                <td className="px-4 py-3 text-orange-400 font-mono text-sm">{r[2]}</td>
                <td className="px-4 py-3 text-zinc-500 text-sm">{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function MLPayoutModel() {
  return (
    <article className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-zinc-600 mb-6">RiderShield / Coverage Reference</p>
      <h1 className="text-4xl font-bold text-white">Dynamic ML Payout Model</h1>
      <p className="text-zinc-400 text-lg pt-1">Gradient-boosted regression trained on historical weather and gig earnings data.</p>

      <SectionHeading id="formula">Payout Formula</SectionHeading>
      <div className="bg-[#141414] border border-white/6 rounded-xl px-5 py-4 font-mono text-sm text-green-400">
        Payout = Earnings per hour × Hours Affected × Severity Score
      </div>

      <SectionHeading id="example">Worked Example</SectionHeading>
      <div className="bg-[#111] border border-white/6 rounded-xl px-5 py-4 space-y-1">
        <p className="text-zinc-400 text-sm">Worker earns <span className="text-white font-medium">Rs. 5,400/week</span> = <span className="text-orange-400 font-mono">Rs. 96/hour</span></p>
        <p className="text-zinc-400 text-sm">Disruption: <span className="text-white font-medium">4 hours</span>, Severity: <span className="text-white font-medium">0.87</span></p>
        <div className="border-t border-white/6 mt-3 pt-3">
          <p className="text-zinc-500 text-xs">Payout = 96 × 4 × 0.87 = <span className="text-green-400 font-bold text-lg">Rs. 334</span></p>
        </div>
      </div>

      <SectionHeading id="features">ML Input Features</SectionHeading>
      <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#1a1a1a] border-b border-white/6">
              {['Feature','Type','Description'].map(h => (
                <th key={h} className="text-left text-xs uppercase tracking-widest text-zinc-500 font-bold px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['zone_risk_score',       'Float 0–1',  'Historical disruption frequency'],
              ['earnings_baseline',     'Integer Rs.','Worker weekly earnings'],
              ['rain_forecast_7d',      'Float mm',   '7-day rain forecast'],
              ['heat_forecast_7d',      'Float °C',   '7-day heat forecast'],
              ['aqi_forecast_7d',       'Integer',    '7-day AQI forecast'],
              ['trust_score',           'Float 0–100','Worker behavioral trust score'],
              ['historical_claim_rate', 'Float 0–1',  'Past claim frequency'],
              ['plan_type',             'Enum',       'basic / standard / premium'],
              ['worker_tenure_weeks',   'Integer',    'Weeks since registration'],
            ].map(([f, t, d]) => (
              <tr key={f} className="border-b border-white/4">
                <td className="px-4 py-2.5 text-orange-400 font-mono text-xs">{f}</td>
                <td className="px-4 py-2.5 text-zinc-500 text-xs">{t}</td>
                <td className="px-4 py-2.5 text-zinc-400 text-xs">{d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionHeading id="confidence">Model Confidence</SectionHeading>
      <Body>Claims with AI confidence &gt; 85% are auto-approved without human review. Below 85%, the claim enters a manual review queue in the admin dashboard. The model re-calibrates monthly on actual outcomes.</Body>
    </article>
  );
}

function AdminDashboardDoc() {
  const features = [
    ['Live Weather Monitor',     'Check real-time weather for any Indian city. See temperature, rainfall, AQI and severity score computed by ML.'],
    ['Trigger Disruption Event', 'Manually simulate a disruption. Choose city, type, severity (0–1), and hours. Fires the full payout pipeline.'],
    ['ML Premium Calculator',    'Real-time weekly premium updates as you adjust severity. Uses the FastAPI ML service on port 8000.'],
    ['Claims History',           'Live feed of all triggered claims. Status auto-cycles: triggered → approved → paid.'],
    ['AI Fraud Detection',       'Pre-loaded fraud alerts: GPS spoofing, duplicate claim, zone mismatch. Flag or dismiss each alert.'],
    ['Weekly Analytics',         'Bar chart of daily claim volume + 4 KPI cards: loss ratio, claims, avg payout, fraud prevented.'],
    ['Zone Monitoring',          'Per-zone risk scores and predicted claim volumes for next 7 days.'],
    ['Worker Trust Scores',      'Distribution of trust scores across your fleet. Determines fraud sensitivity and Safety Mode limits.'],
  ];
  return (
    <article className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-zinc-600 mb-6">RiderShield / For Companies</p>
      <h1 className="text-4xl font-bold text-white">Admin Dashboard Guide</h1>
      <p className="text-zinc-400 text-lg pt-1">All features of the RiderShield admin control center documented.</p>
      <div className="space-y-2.5 mt-6">
        {features.map(([title, desc], i) => (
          <div key={i} className="flex gap-3 items-start bg-[#111] border border-white/6 rounded-xl px-4 py-4">
            <div className="w-6 h-6 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 text-orange-400 text-xs font-bold mt-0.5">
              {i + 1}
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-0.5">{title}</p>
              <p className="text-zinc-500 text-xs leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}


// ─── Registration ─────────────────────────────────────────────────────────────
function Registration() {
  const steps = [
    ['Download the App',           'Search RiderShield on Google Play Store. Available for Android. iOS coming soon.'],
    ['Phone Verification',          'Enter your mobile number. OTP is sent to your registered number. Bank-level security — app blocks on rooted or developer mode phones.'],
    ['KYC Verification',            'Submit Aadhaar and PAN. Live selfie is matched against Aadhaar photo using AI face matching. Verification completes in under 60 seconds.'],
    ['Account Aggregator Consent',  'Give one-time consent to share bank transaction data via Setu Account Aggregator. This verifies you are an active gig worker by checking Zomato or Swiggy credits in your bank account. No manual proof needed.'],
  ];
  const security = [
    'Developer mode detection — app blocks if enabled',
    'Root detection — blocked on rooted devices',
    'Device binding — one account per device',
    'Biometric lock — fingerprint or face ID required',
    'SSL pinning — prevents network interception',
  ];
  return (
    <article className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-zinc-600 mb-6">RiderShield / For Delivery Riders</p>
      <h1 className="text-4xl font-bold text-white">Worker Registration</h1>
      <p className="text-zinc-400 text-lg pt-1">How delivery partners onboard onto RiderShield.</p>

      <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl px-4 py-3 mt-6 text-sm text-zinc-300">
        <span className="text-orange-400 font-semibold">Note: </span>
        Registration takes under 3 minutes. Workers need only their Aadhaar number, PAN card, and UPI ID.
      </div>

      <SectionHeading id="steps">Onboarding Steps</SectionHeading>
      <div className="space-y-2.5">
        {steps.map(([title, desc], i) => (
          <div key={i} className="flex gap-3 items-start bg-[#111] border border-white/6 rounded-xl px-4 py-3">
            <div className="w-6 h-6 rounded-full bg-orange-500/15 border border-orange-500/25 flex items-center justify-center shrink-0 text-orange-400 text-xs font-bold mt-0.5">{i + 1}</div>
            <div>
              <p className="text-white text-sm font-semibold leading-snug">{title}</p>
              <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <SectionHeading id="security">Bank-Level Security</SectionHeading>
      <div className="bg-[#1a1a1a] rounded-xl p-4">
        <p className="text-white text-sm font-semibold mb-3">Bank-Level Security</p>
        <ul className="space-y-2">
          {security.map(s => (
            <li key={s} className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />{s}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

// ─── Safety Mode ──────────────────────────────────────────────────────────────
function SafetyMode() {
  const checks = [
    'Worker taps "Activate Safety Mode" in the app.',
    'System checks NewsAPI for curfew/strike keywords in the zone.',
    'Traffic API checked for unusual road blockage patterns.',
    'Group validation — if 3+ workers in same zone also activated, strong signal of genuine event.',
    'GPS confirms worker is inside the affected zone boundary.',
  ];
  const trustTable = [
    ['90–100', '3 activations / week'],
    ['70–89',  '2 activations / week'],
    ['50–69',  '1 activation / week'],
    ['Below 50', 'Manual review only'],
  ];
  return (
    <article className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-zinc-600 mb-6">RiderShield / For Delivery Riders</p>
      <h1 className="text-4xl font-bold text-white">Safety Mode</h1>
      <p className="text-zinc-400 text-lg pt-1">Worker-initiated protection for unpredictable disruptions.</p>

      <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl px-4 py-3 mt-6 text-sm text-zinc-300">
        <span className="text-orange-400 font-semibold">Note: </span>
        Safety Mode covers disruptions that automated APIs cannot detect — like sudden curfews, local strikes, or road blockages.
      </div>

      <SectionHeading id="types">Detection Types</SectionHeading>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
          <p className="text-blue-400 font-semibold text-sm mb-2">System Triggered</p>
          <ul className="space-y-1.5 text-xs text-zinc-400 mb-3">
            {['Heavy Rain', 'Extreme Heat', 'Severe AQI', 'Flood Alerts'].map(i => (
              <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />{i}</li>
            ))}
          </ul>
          <p className="text-zinc-600 text-xs">These trigger automatically when API threshold is crossed. No action needed from worker.</p>
        </div>
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4">
          <p className="text-orange-400 font-semibold text-sm mb-2">Worker Triggered</p>
          <ul className="space-y-1.5 text-xs text-zinc-400 mb-3">
            {['Sudden Curfew', 'Local Strike', 'Road Blockage', 'Market Closure'].map(i => (
              <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />{i}</li>
            ))}
          </ul>
          <p className="text-zinc-600 text-xs">Worker activates manually. System verifies using multiple signals.</p>
        </div>
      </div>

      <SectionHeading id="how">How Safety Mode Works</SectionHeading>
      <div className="space-y-2.5">
        {checks.map((c, i) => (
          <div key={i} className="flex gap-3 items-start bg-[#111] border border-white/6 rounded-xl px-4 py-3">
            <div className="w-6 h-6 rounded-full bg-orange-500/15 border border-orange-500/25 flex items-center justify-center shrink-0 text-orange-400 text-xs font-bold mt-0.5">{i + 1}</div>
            <p className="text-zinc-400 text-sm leading-relaxed">{c}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1a1a1a] rounded-xl p-4 mt-2 font-mono text-xs space-y-1">
        <p className="text-green-400">All 5 checks pass → Auto approved</p>
        <p className="text-amber-400">3–4 checks pass → Flagged for admin review</p>
        <p className="text-red-400">Less than 3 → Rejected</p>
      </div>

      <SectionHeading id="limits">Activation Limits by Trust Score</SectionHeading>
      <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1a1a1a] border-b border-white/6">
              <th className="text-left text-xs uppercase tracking-widest text-zinc-500 font-bold px-4 py-3">Trust Score</th>
              <th className="text-left text-xs uppercase tracking-widest text-zinc-500 font-bold px-4 py-3">Weekly Limit</th>
            </tr>
          </thead>
          <tbody>
            {trustTable.map(([score, limit]) => (
              <tr key={score} className="border-b border-white/4">
                <td className="px-4 py-2.5 text-orange-400 font-mono text-sm">{score}</td>
                <td className="px-4 py-2.5 text-zinc-300 text-sm">{limit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

// ─── Payouts ──────────────────────────────────────────────────────────────────
function Payouts() {
  const timeline = [
    ['Disruption Detected', '0 sec'],
    ['Worker Verified',     '15 sec'],
    ['Fraud Check',         '30 sec'],
    ['UPI Credit',          '< 2 min'],
  ];
  const limits = [
    ['Basic',    'Rs. 500',   'Rs. 200'],
    ['Standard', 'Rs. 900',   'Rs. 400'],
    ['Premium',  'Rs. 1,500', 'Rs. 800'],
  ];
  return (
    <article className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-zinc-600 mb-6">RiderShield / For Delivery Riders</p>
      <h1 className="text-4xl font-bold text-white">Payout System</h1>
      <p className="text-zinc-400 text-lg pt-1">How compensation is calculated and delivered.</p>

      <SectionHeading id="formula">Payout Formula</SectionHeading>
      <div className="bg-[#1a1a1a] rounded-xl px-5 py-4 font-mono text-sm text-green-400">
        Payout = Earnings per Hour × Hours Affected × Severity Score
      </div>

      <SectionHeading id="example">Example Calculation</SectionHeading>
      <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-5 space-y-2">
        <p className="text-orange-400 font-semibold text-sm mb-2">Example Calculation</p>
        {[
          ['Worker earns', 'Rs. 5,400/week = Rs. 96/hour'],
          ['Disruption',   'Heavy Rain, 4 hours affected'],
          ['Severity Score', '0.87 (from ML model)'],
          ['Formula',      '96 × 4 × 0.87 = Rs. 334'],
          ['Plan max payout', 'Rs. 900 (Standard)'],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm">
            <span className="text-zinc-500">{k}</span>
            <span className="text-white font-medium font-mono">{v}</span>
          </div>
        ))}
        <div className="border-t border-orange-500/20 mt-3 pt-3 flex justify-between items-center">
          <span className="text-zinc-400 text-sm font-semibold">Final Payout</span>
          <span className="text-green-400 font-bold text-xl font-mono">Rs. 334</span>
        </div>
      </div>

      <SectionHeading id="timeline">Payout Timeline</SectionHeading>
      <div className="grid grid-cols-4 gap-3">
        {timeline.map(([label, time], i) => (
          <div key={i} className="bg-[#111] border border-white/6 rounded-xl p-4 text-center">
            <div className="w-7 h-7 rounded-full bg-orange-500/15 border border-orange-500/25 flex items-center justify-center mx-auto text-orange-400 text-xs font-bold mb-2">{i + 1}</div>
            <p className="text-white text-xs font-semibold mb-1">{label}</p>
            <p className="text-orange-400 font-mono text-xs">{time}</p>
          </div>
        ))}
      </div>

      <SectionHeading id="limits">Payout Limits by Plan</SectionHeading>
      <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1a1a1a] border-b border-white/6">
              {['Plan', 'Max Weekly Payout', 'Max Per Event'].map(h => (
                <th key={h} className="text-left text-xs uppercase tracking-widest text-zinc-500 font-bold px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {limits.map(([plan, weekly, perEvent]) => (
              <tr key={plan} className="border-b border-white/4">
                <td className="px-4 py-2.5 text-white font-semibold text-sm">{plan}</td>
                <td className="px-4 py-2.5 text-orange-400 font-mono text-sm">{weekly}</td>
                <td className="px-4 py-2.5 text-zinc-400 font-mono text-sm">{perEvent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

// ─── Zone Management ──────────────────────────────────────────────────────────
function ZoneManagement() {
  const zones = ['Noida Sector 18', 'Delhi Rohini', 'Gurugram Sector 45', 'Patna Boring Road'];
  const actions = [
    ['Mark Zone as Disrupted',  'SuperAdmin, ZoneManager', 'Admin dashboard manual override'],
    ['View Zone Risk Score',    'All admins',              'Analytics page zone heatmap'],
    ['Add New Zone',            'SuperAdmin only',         'API endpoint (Phase 3)'],
    ['View Active Workers',     'SuperAdmin, ZoneManager', 'Admin dashboard'],
  ];
  return (
    <article className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-zinc-600 mb-6">RiderShield / For Companies</p>
      <h1 className="text-4xl font-bold text-white">Zone Management</h1>
      <p className="text-zinc-400 text-lg pt-1">How delivery zones are defined and monitored.</p>

      <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl px-4 py-3 mt-6 text-sm text-zinc-300">
        Each delivery zone is a defined geographic boundary within which all registered workers receive the same disruption alerts and payouts.
      </div>

      <SectionHeading id="zones">Example Zones</SectionHeading>
      <div className="grid grid-cols-2 gap-3">
        {zones.map(z => (
          <div key={z} className="bg-[#111] border border-white/6 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
            <span className="text-zinc-300 text-sm font-medium">{z}</span>
          </div>
        ))}
      </div>

      <SectionHeading id="admin-actions">Admin Actions</SectionHeading>
      <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1a1a1a] border-b border-white/6">
              {['Action', 'Who Can Do It', 'How'].map(h => (
                <th key={h} className="text-left text-xs uppercase tracking-widest text-zinc-500 font-bold px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {actions.map(([action, who, how]) => (
              <tr key={action} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 text-white font-medium text-sm">{action}</td>
                <td className="px-4 py-3 text-orange-400 text-sm">{who}</td>
                <td className="px-4 py-3 text-zinc-500 text-sm">{how}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

// ─── Fraud Detection ──────────────────────────────────────────────────────────
function FraudDetection() {
  const fraudTypes = [
    {
      color: 'red',
      title: 'GPS Spoofing',
      desc: 'HyperTrack detects fake GPS coordinates generated by spoofing apps. Movement pattern analysis checks if speed and route match real delivery behavior.',
      detection: 'Confidence drops below 60% → auto rejected',
    },
    {
      color: 'amber',
      title: 'Account Sharing',
      desc: 'Device fingerprinting detects login from new device. Biometric verification required — fingerprint or face cannot be shared. One account per device enforced.',
      detection: 'New device login triggers full re-verification',
    },
    {
      color: 'red',
      title: 'Fraud Ring Detection',
      desc: 'Claim velocity analysis detects abnormal surge. Workers in unaffected zones claiming disruption are cross-checked against real weather data. Behavioral pattern AI flags outliers.',
      detection: '500 simultaneous claims → auto quarantine',
    },
  ];
  const confidence = [
    ['90–100%', 'Auto Approved',   'Instant payout',             'text-green-400'],
    ['70–89%',  'Approved + flag', 'Payout + monitoring',        'text-blue-400'],
    ['50–69%',  'Manual Review',   'Admin reviews within 1 hr',  'text-amber-400'],
    ['< 50%',   'Auto Rejected',   'Worker notified',            'text-red-400'],
  ];
  const borderColor = { red: 'border-red-500', amber: 'border-amber-500' };
  return (
    <article className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-zinc-600 mb-6">RiderShield / For Companies</p>
      <h1 className="text-4xl font-bold text-white">Fraud Detection</h1>
      <p className="text-zinc-400 text-lg pt-1">Multi-layer AI system to prevent false claims.</p>

      <SectionHeading id="types">Fraud Types</SectionHeading>
      <div className="grid grid-cols-1 gap-4">
        {fraudTypes.map(({ color, title, desc, detection }) => (
          <div key={title} className={`bg-[#1a1a1a] border-l-4 ${borderColor[color]} rounded-xl p-4`}>
            <p className="text-white font-semibold text-sm mb-1">{title}</p>
            <p className="text-zinc-400 text-xs leading-relaxed mb-2">{desc}</p>
            <div className="bg-black/20 rounded-lg px-3 py-2">
              <p className="text-zinc-500 text-xs font-mono">{detection}</p>
            </div>
          </div>
        ))}
      </div>

      <SectionHeading id="confidence">Confidence Scoring</SectionHeading>
      <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1a1a1a] border-b border-white/6">
              {['Score Range', 'Decision', 'Action'].map(h => (
                <th key={h} className="text-left text-xs uppercase tracking-widest text-zinc-500 font-bold px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {confidence.map(([score, decision, action, cls]) => (
              <tr key={score} className="border-b border-white/4">
                <td className={`px-4 py-2.5 font-mono text-sm font-bold ${cls}`}>{score}</td>
                <td className="px-4 py-2.5 text-white text-sm">{decision}</td>
                <td className="px-4 py-2.5 text-zinc-500 text-sm">{action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

// ─── Endpoint card helper ─────────────────────────────────────────────────────
function MethodBadge({ method }) {
  const styles = {
    POST:   'bg-green-500/10 text-green-400 border border-green-500/20',
    GET:    'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    DELETE: 'bg-red-500/10 text-red-400 border border-red-500/20',
  };
  return (
    <span className={`rounded-full text-xs font-mono px-3 py-1 ${styles[method] || styles.GET}`}>{method}</span>
  );
}

function EndpointCard({ method, route, description, auth, request, response }) {
  return (
    <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5 mb-4">
      <div className="flex items-center gap-3 mb-2">
        <MethodBadge method={method} />
        <span className="font-mono text-white text-sm">{route}</span>
        {auth && <span className="ml-auto text-[10px] text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-full px-2 py-0.5">Auth Required</span>}
      </div>
      <p className="text-zinc-500 text-xs mb-3">{description}</p>
      {request && (
        <>
          <p className="text-zinc-600 text-[10px] uppercase tracking-widest mb-1">Request Body</p>
          <div className="bg-[#1a1a1a] rounded-xl p-4 font-mono text-xs text-green-400 whitespace-pre">{request}</div>
        </>
      )}
      {response && (
        <>
          <p className="text-zinc-600 text-[10px] uppercase tracking-widest mb-1 mt-3">Response</p>
          <div className="bg-[#1a1a1a] rounded-xl p-4 font-mono text-xs text-green-400 whitespace-pre">{response}</div>
        </>
      )}
    </div>
  );
}

// ─── Endpoints page ───────────────────────────────────────────────────────────
function Endpoints() {
  return (
    <article className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-zinc-600 mb-6">RiderShield / API Reference</p>
      <h1 className="text-4xl font-bold text-white">API Reference</h1>
      <p className="text-zinc-400 text-lg pt-1">Backend endpoints for the RiderShield platform.</p>

      <div className="bg-[#1a1a1a] rounded-xl px-4 py-3 mt-6 font-mono text-xs text-zinc-400 space-y-1">
        <p><span className="text-zinc-600">Base URL (dev): </span><span className="text-orange-400">{import.meta.env.VITE_API_URL || 'http://localhost:5000'}</span></p>
        <p><span className="text-zinc-600">Auth header: </span><span className="text-green-400">Authorization: Bearer &lt;token&gt;</span></p>
      </div>

      <SectionHeading id="auth-endpoints">Authentication Endpoints</SectionHeading>

      <EndpointCard
        method="POST"
        route="/auth/admin/login"
        description="Authenticate admin and receive a JWT token (8 hour expiry)."
        request={`{\n  "email": "admin@ridershield.in",\n  "password": "RiderShield@2026"\n}`}
        response={`{\n  "token": "eyJhbGciOiJIUzI1...",\n  "admin": {\n    "id": "A001",\n    "name": "Super Admin",\n    "email": "admin@ridershield.in",\n    "role": "superadmin"\n  },\n  "expiresIn": "8h"\n}`}
      />

      <EndpointCard
        method="GET"
        route="/auth/admin/me"
        description="Get current admin details from the Bearer token."
        auth
        response={`{ "admin": { "id", "name", "email", "role" } }`}
      />

      <EndpointCard
        method="GET"
        route="/auth/admin/verify"
        description="Verify if a token is still valid."
        auth
        response={`{ "valid": true, "admin": { ... } }`}
      />

      <SectionHeading id="disruption-endpoints">Disruption Endpoints</SectionHeading>

      <EndpointCard
        method="POST"
        route="/weather/check"
        description="Check real-time weather and severity for any Indian city."
        request={`{ "city": "Noida" }`}
        response={`{ "city", "temp", "rain_mm", "severity_score", "disruption_detected" }`}
      />

      <EndpointCard
        method="POST"
        route="/simulate-disruption"
        description="Trigger a disruption event and get ML-calculated payout amount."
        auth
        request={`{\n  "city": "Noida",\n  "disruption_type": "rain",\n  "severity_score": 0.87,\n  "hours_affected": 4\n}`}
        response={`{ "status": "approved", "city", "disruption_type", "payout_amount", "timestamp" }`}
      />

      <EndpointCard
        method="POST"
        route="/premium/calculate"
        description="Calculate weekly insurance premium using the ML model."
        auth
        request={`{\n  "zone_risk_score": 0.7,\n  "earnings_baseline": 5400,\n  "rain_forecast_7d": 12.5,\n  "plan_type": "standard"\n}`}
        response={`{ "plan_type": "standard", "weekly_premium": 79.0, "currency": "INR" }`}
      />

      <EndpointCard
        method="GET"
        route="/claims"
        description="Retrieve all claims. Returns 20 mock claims (real DB in Phase 3)."
        auth
        response={`{ "claims": [ { id, workerId, zone, type, severity, payoutAmount, status } ], "total": 20 }`}
      />

      <EndpointCard
        method="POST"
        route="/admin/zone/mark-disruption"
        description="Manually mark a zone as disrupted. Restricted to superadmin and zonemanager roles."
        auth
        request={`{\n  "zone": "Noida Sector 18",\n  "disruptionType": "rain",\n  "manualOverride": true\n}`}
        response={`{ "success": true, "zone", "message": "Zone marked as disrupted" }`}
      />
    </article>
  );
}

// ─── Authentication doc page ──────────────────────────────────────────────────
function Authentication() {
  const roles = [
    ['superadmin',  'Full access — all endpoints, zone management, fraud actions'],
    ['zonemanager', 'Can view + trigger disruptions, mark zones, view claims'],
    ['analyst',     'Read-only — claims, analytics, weather check'],
  ];
  return (
    <article className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-zinc-600 mb-6">RiderShield / API Reference</p>
      <h1 className="text-4xl font-bold text-white">Authentication</h1>
      <p className="text-zinc-400 text-lg pt-1">How JWT-based admin authentication works.</p>

      <SectionHeading id="flow">Auth Flow</SectionHeading>
      {[
        ['POST /auth/admin/login',   'Send email + password → receive JWT token'],
        ['Store token client-side',  'localStorage.setItem("ridershield_admin_token", token)'],
        ['Send with every request',  'Header: Authorization: Bearer <token>'],
        ['Token expires in 8 hours', 'Redirect to login on 401 response'],
      ].map(([step, desc], i) => (
        <div key={i} className="flex gap-3 items-start bg-[#111] border border-white/6 rounded-xl px-4 py-3">
          <div className="w-6 h-6 rounded-full bg-orange-500/15 border border-orange-500/25 flex items-center justify-center shrink-0 text-orange-400 text-xs font-bold mt-0.5">{i + 1}</div>
          <div>
            <p className="text-white text-sm font-semibold font-mono">{step}</p>
            <p className="text-zinc-500 text-xs mt-0.5">{desc}</p>
          </div>
        </div>
      ))}

      <SectionHeading id="roles">Admin Roles</SectionHeading>
      <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1a1a1a] border-b border-white/6">
              {['Role', 'Access Level'].map(h => (
                <th key={h} className="text-left text-xs uppercase tracking-widest text-zinc-500 font-bold px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roles.map(([role, access]) => (
              <tr key={role} className="border-b border-white/4">
                <td className="px-4 py-2.5 text-orange-400 font-mono text-sm">{role}</td>
                <td className="px-4 py-2.5 text-zinc-400 text-sm">{access}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionHeading id="test-creds">Test Credentials</SectionHeading>
      <div className="space-y-2">
        {[
          ['Super Admin',  'admin@ridershield.in',   'RiderShield@2026'],
          ['Zone Manager', 'zone@ridershield.in',    'ZoneManager@2026'],
          ['Analyst',      'analyst@ridershield.in', 'Analyst@2026'],
        ].map(([name, email, pass]) => (
          <div key={name} className="bg-[#1a1a1a] rounded-xl p-3">
            <p className="text-zinc-400 text-xs font-semibold mb-0.5">{name}</p>
            <p className="text-zinc-600 text-xs font-mono">{email} / {pass}</p>
          </div>
        ))}
      </div>

      <SectionHeading id="errors">Error Responses</SectionHeading>
      <div className="space-y-2">
        {[
          ['401', 'Access denied. No token provided.', 'Token missing from header'],
          ['401', 'Invalid or expired token.',         'Token malformed or past 8h expiry'],
          ['403', 'Access forbidden. Insufficient permissions.', 'Role does not have access'],
        ].map(([code, msg, note]) => (
          <div key={code+msg} className="bg-[#1a1a1a] rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-red-400 font-mono text-sm font-bold shrink-0">{code}</span>
            <div>
              <p className="text-zinc-300 text-xs font-mono">{msg}</p>
              <p className="text-zinc-600 text-xs mt-0.5">{note}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

// ─── Quick Setup ────────────────────────────────────────────────────────────
function QuickSetup() {
  return (
    <article className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-zinc-600 mb-6">RiderShield / Getting Started</p>
      <h1 className="text-4xl font-bold text-white">Quick Setup</h1>
      <p className="text-zinc-400 text-lg pt-1">Get RiderShield running locally in under 5 minutes.</p>

      <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl px-4 py-3 mt-6 text-sm text-zinc-300">
        <span className="text-orange-400 font-semibold">Prerequisites: </span>
        Node.js 18+, Python 3.9+, MongoDB Atlas account, OpenWeatherMap API key.
      </div>

      <SectionHeading id="clone">1. Clone the Repository</SectionHeading>
      <div className="bg-[#141414] rounded-xl p-4 font-mono text-xs text-green-400 border border-white/6">
        git clone https://github.com/your-org/ridershield.git{'\n'}cd ridershield
      </div>

      <SectionHeading id="install">2. Install Dependencies</SectionHeading>
      <div className="space-y-3">
        {[
          ['Backend (Node.js)',     'cd services/backend && npm install'],
          ['ML Service (Python)',   'cd services/ml-service && pip install -r requirements.txt'],
          ['Admin Dashboard',      'cd apps/admin-dashboard && npm install'],
          ['Worker App (Expo)',     'cd apps/worker-app && npm install'],
        ].map(([label, cmd]) => (
          <div key={label} className="bg-[#111] border border-white/6 rounded-xl p-4">
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-2">{label}</p>
            <code className="text-green-400 font-mono text-xs">{cmd}</code>
          </div>
        ))}
      </div>

      <SectionHeading id="env">3. Configure Environment Variables</SectionHeading>
      <p className="text-zinc-400 text-sm mb-2">Create <code className="text-orange-400 font-mono">services/backend/.env</code> with:</p>
      <div className="bg-[#141414] rounded-xl p-4 font-mono text-xs text-green-400 border border-white/6 whitespace-pre">{`PORT=5000
ML_SERVICE_URL=http://localhost:8000
JWT_SECRET=ridershield_your_secret_here
OPENWEATHER_API_KEY=your_openweather_key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ridershield
NEWS_API_KEY=your_newsapi_key
WAQI_API_KEY=your_waqi_key`}</div>

      <SectionHeading id="ml">4. Train ML Models</SectionHeading>
      <div className="bg-[#141414] rounded-xl p-4 font-mono text-xs text-green-400 border border-white/6">
        cd services/ml-service{'\n'}python train.py{'\n'}{'# '}Output: payout_model.pkl and premium_model.pkl
      </div>

      <SectionHeading id="start">5. Start All Services</SectionHeading>
      <div className="space-y-3">
        {[
          ['Backend API',       'cd services/backend && node index.js',           'Port 5000'],
          ['ML Service',        'cd services/ml-service && uvicorn app:app --reload','Port 8000'],
          ['Admin Dashboard',   'cd apps/admin-dashboard && npm run dev',          'Port 5173'],
          ['Worker App',        'cd apps/worker-app && npx expo start',            'Expo Go'],
        ].map(([label, cmd, port]) => (
          <div key={label} className="bg-[#111] border border-white/6 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-[10px] uppercase tracking-widest mb-1">{label}</p>
              <code className="text-green-400 font-mono text-xs">{cmd}</code>
            </div>
            <span className="text-orange-400 text-xs font-mono shrink-0 ml-4">{port}</span>
          </div>
        ))}
      </div>

      <SectionHeading id="login">6. Login to Admin Dashboard</SectionHeading>
      <div className="bg-[#1a1a1a] rounded-xl p-4 space-y-2">
        <p className="text-zinc-400 text-xs mb-3">Navigate to <code className="text-orange-400">http://localhost:5173/admin/login</code></p>
        {[['Super Admin','admin@ridershield.in','RiderShield@2026'],['Zone Manager','zone@ridershield.in','ZoneManager@2026']].map(([name,email,pass]) => (
          <div key={name} className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">{name}</span>
            <span className="text-zinc-400 font-mono">{email} / {pass}</span>
          </div>
        ))}
      </div>

      <SectionHeading id="troubleshoot">Troubleshooting</SectionHeading>
      <div className="space-y-2">
        {[
          ['ML service not reachable', 'Ensure uvicorn is running on port 8000. Check: curl http://localhost:8000/health'],
          ['Weather API returns 401',  'OpenWeatherMap keys activate within 10 minutes of signup. Backend returns safe mock data in the meantime.'],
          ['MongoDB connection error', 'Verify MONGODB_URI in .env. Whitelist your IP in MongoDB Atlas Network Access settings.'],
          ['Claims not appearing',     'Trigger a disruption simulation from the dashboard. Seed data loads automatically on first backend start.'],
        ].map(([err, fix]) => (
          <div key={err} className="bg-[#111] border border-red-500/10 rounded-xl px-4 py-3">
            <p className="text-red-400 text-xs font-semibold mb-1">{err}</p>
            <p className="text-zinc-500 text-xs leading-relaxed">{fix}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

// ─── Analytics ───────────────────────────────────────────────────────────────
function Analytics() {
  return (
    <article className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-zinc-600 mb-6">RiderShield / For Companies</p>
      <h1 className="text-4xl font-bold text-white">Analytics Dashboard</h1>
      <p className="text-zinc-400 text-lg pt-1">Real-time business intelligence for your gig workforce insurance.</p>

      <SectionHeading id="kpis">KPI Cards</SectionHeading>
      <div className="grid grid-cols-2 gap-3">
        {[
          ['Total Payouts',    'Sum of all approved claim payoutAmount fields in MongoDB.', 'Rs. 12,691', 'text-orange-400'],
          ['Loss Ratio',       'Total Payouts ÷ Total Premiums Collected × 100. Healthy range: 40–70%.', '68.2%', 'text-blue-400'],
          ['Active Policies',  'Count of workers with active (paid) weekly premium status.', '247', 'text-green-400'],
          ['Fraud Prevented',  'Claims where AI confidence < 50% and status = rejected. Represents saved payout leakage.', 'Rs. 4,200', 'text-red-400'],
        ].map(([title, desc, val, cls]) => (
          <div key={title} className="bg-[#111] border border-white/6 rounded-xl p-4">
            <p className="text-zinc-600 text-[10px] uppercase tracking-widest mb-1">{title}</p>
            <p className={`text-2xl font-bold ${cls} mb-2`}>{val}</p>
            <p className="text-zinc-500 text-xs leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <SectionHeading id="charts">Weekly Payout Trend</SectionHeading>
      <div className="bg-[#111] border border-white/6 rounded-xl p-4">
        <p className="text-zinc-400 text-sm mb-2">7-day bar chart showing daily claim payout totals.</p>
        <ul className="space-y-1.5">
          {['Each bar = sum of payoutAmount for claims on that day','Orange bars indicate disruption days','Height proportional to daily payout total','Hover tooltip shows claim count + total amount'].map(i => (
            <li key={i} className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />{i}
            </li>
          ))}
        </ul>
      </div>

      <SectionHeading id="breakdown">Claims by Disruption Type</SectionHeading>
      <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-[#1a1a1a] border-b border-white/6">
            {['Type','Count','% of Total','Avg Payout'].map(h => <th key={h} className="text-left text-xs uppercase tracking-widest text-zinc-500 font-bold px-4 py-3">{h}</th>)}
          </tr></thead>
          <tbody>
            {[['Rain','38','42%','Rs. 312'],['Heat','21','23%','Rs. 278'],['Smog','16','18%','Rs. 195'],['Flood','9','10%','Rs. 445'],['Curfew','6','7%','Rs. 380']].map(([type,...rest]) => (
              <tr key={type} className="border-b border-white/4">
                <td className="px-4 py-2.5 text-orange-400 font-mono text-sm">{type}</td>
                {rest.map((v,i) => <td key={i} className="px-4 py-2.5 text-zinc-400 text-sm">{v}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionHeading id="heatmap">Zone Risk Heatmap</SectionHeading>
      <div className="space-y-2">
        {[['🟢 Green (0–40%)','Low risk','Normal monitoring, standard premiums.'],['🟡 Amber (40–70%)','Medium risk','Elevated monitoring, premiums +15%.'],['🔴 Red (70–100%)','High risk','Active alerts, auto-approval for verified claims, premiums +30%.']].map(([code,level,desc]) => (
          <div key={code} className="bg-[#111] border border-white/6 rounded-xl px-4 py-3">
            <p className="text-white text-xs font-semibold mb-0.5">{code} — {level}</p>
            <p className="text-zinc-500 text-xs">{desc}</p>
          </div>
        ))}
      </div>

      <SectionHeading id="trust">Worker Trust Score Distribution</SectionHeading>
      <div className="bg-[#111] border border-white/6 rounded-xl p-4">
        <p className="text-zinc-400 text-sm">Histogram of trust scores across all registered workers. Trust score is computed from: claim history accuracy, GPS verification pass rate, device binding compliance, and activation frequency. Exported as CSV from the Analytics page download button.</p>
      </div>

      <SectionHeading id="export">Exporting Data</SectionHeading>
      <div className="bg-[#1a1a1a] rounded-xl p-4 font-mono text-xs text-green-400">
        GET /analytics/summary  → JSON export of all KPIs{'\n'}GET /claims             → Full claims list (filterable by date, type, zone)
      </div>
    </article>
  );
}

// ─── Thresholds ───────────────────────────────────────────────────────────────
function Thresholds() {
  return (
    <article className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-zinc-600 mb-6">RiderShield / Coverage Reference</p>
      <h1 className="text-4xl font-bold text-white">Threshold Reference</h1>
      <p className="text-zinc-400 text-lg pt-1">Exact thresholds that trigger automatic payouts when crossed.</p>

      <SectionHeading id="env-thresholds">Environmental Thresholds</SectionHeading>
      <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-[#1a1a1a] border-b border-white/6">
            {['Disruption','Threshold','Data Source','Severity Formula'].map(h => <th key={h} className="text-left text-xs uppercase tracking-widest text-zinc-500 font-bold px-4 py-3">{h}</th>)}
          </tr></thead>
          <tbody>
            {[
              ['Heavy Rain',   '> 50 mm in 3 hrs',       'OpenWeatherMap',  'min(1, rain_mm / 100)'],
              ['Extreme Heat', '> 45°C for 4+ hrs',      'OpenWeatherMap',  'min(1, (temp - 45) / 10)'],
              ['Severe Flood', 'Official govt advisory',  'NDMA API',        '0.9 (fixed on advisory)'],
              ['High AQI',     '> 400 AQI',              'WAQI API',        'min(1, aqi / 600)'],
              ['Strong Winds', '> 50 km/h',              'OpenWeatherMap',  'min(1, wind_kph / 80)'],
              ['Cyclone',      'IMD cyclone advisory',   'IMD API',         '1.0 (max severity)'],
            ].map(([type, thresh, src, formula]) => (
              <tr key={type} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 text-white font-medium text-sm">{type}</td>
                <td className="px-4 py-3 text-orange-400 font-mono text-xs">{thresh}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{src}</td>
                <td className="px-4 py-3 text-green-400 font-mono text-xs">{formula}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionHeading id="social-thresholds">Social Disruption Thresholds</SectionHeading>
      <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl px-4 py-3 mb-4 text-sm text-zinc-300">
        <span className="text-orange-400 font-semibold">Multi-Signal Rule: </span>
        Social disruptions require 2 of 3 independent signals to trigger auto-payout.
      </div>
      <div className="space-y-3">
        {[
          ['Curfew',            'NewsAPI curfew/section 144 keywords in last 3 hrs + Group Safety Mode (3+ workers)'],
          ['Local Strike',      'NewsAPI bandh/strike keywords + Traffic API blockage pattern detected in zone'],
          ['Zone Closure',      'NewsAPI restaurant closure + Group Safety Mode + Admin manual confirmation'],
        ].map(([type, rule]) => (
          <div key={type} className="bg-[#111] border border-white/6 rounded-xl px-4 py-4">
            <p className="text-white font-semibold text-sm mb-2">{type}</p>
            <div className="flex items-start gap-2">
              <span className="text-orange-400 text-xs mt-0.5 shrink-0">Signals:</span>
              <p className="text-zinc-500 text-xs leading-relaxed">{rule}</p>
            </div>
          </div>
        ))}
      </div>

      <SectionHeading id="ml-adjust">ML Zone-Specific Threshold Adjustment</SectionHeading>
      <div className="bg-[#111] border border-white/6 rounded-xl p-4">
        <p className="text-zinc-400 text-sm leading-relaxed mb-3">The ML model automatically adjusts base thresholds per zone based on historical data. Zones with frequent disruptions have their thresholds calibrated tighter (lower mm/hr activates payout) to reflect actual income loss patterns.</p>
        <div className="bg-[#141414] rounded-xl p-3 font-mono text-xs text-green-400">
          effective_threshold = base_threshold × (1 - zone_risk_score × 0.2)
        </div>
      </div>

      <SectionHeading id="override">SuperAdmin Override</SectionHeading>
      <div className="bg-[#111] border border-white/6 rounded-xl p-4">
        <p className="text-zinc-400 text-sm">SuperAdmins can manually override thresholds or mark a zone as disrupted via the Admin Dashboard or the API endpoint:</p>
        <div className="bg-[#1a1a1a] rounded-xl px-4 py-3 font-mono text-xs text-green-400 mt-3">
          POST /admin/zone/mark-disruption{'\n'}{'{'} zone, disruptionType, manualOverride: true {'}'}
        </div>
      </div>
    </article>
  );
}

// ─── Webhooks ─────────────────────────────────────────────────────────────────
function Webhooks() {
  return (
    <article className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-zinc-600 mb-6">RiderShield / API Reference</p>
      <h1 className="text-4xl font-bold text-white">Webhooks</h1>
      <p className="text-zinc-400 text-lg pt-1">Real-time event notifications for your platform integrations.</p>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 mt-6 text-sm text-zinc-300">
        <span className="text-amber-400 font-semibold">Beta: </span>
        Webhooks are currently in Beta. Production-ready in Phase 3. Use for demo and integration testing.
      </div>

      <SectionHeading id="events">Available Events</SectionHeading>
      <div className="space-y-2">
        {[
          ['claim.created',          'Fired when a new claim is saved to the database (auto or manual trigger).'],
          ['claim.approved',         'Fired when AI confidence > 85% and claim transitions to approved.'],
          ['claim.paid',             'Fired when UPI payout is dispatched to the worker.'],
          ['disruption.detected',    'Fired when cron job detects a threshold breach in any zone.'],
          ['safety_mode.activated',  'Fired when a worker activates Safety Mode via the mobile app.'],
          ['fraud.alert',            'Fired when AI confidence < 50% and claim is auto-rejected.'],
        ].map(([event, desc]) => (
          <div key={event} className="bg-[#111] border border-white/6 rounded-xl px-4 py-3 flex items-start gap-3">
            <code className="text-orange-400 font-mono text-xs shrink-0 mt-0.5">{event}</code>
            <p className="text-zinc-500 text-xs">{desc}</p>
          </div>
        ))}
      </div>

      <SectionHeading id="register">Register a Webhook</SectionHeading>
      <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-mono px-3 py-1">POST</span>
          <span className="font-mono text-white text-sm">/api/webhooks/register</span>
          <span className="ml-auto text-[10px] text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-full px-2 py-0.5">Auth Required</span>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 font-mono text-xs text-green-400 whitespace-pre">{`{
  "url": "https://your-platform.com/webhook",
  "events": ["claim.approved", "claim.paid", "fraud.alert"],
  "secret": "your_hmac_secret"
}`}</div>
      </div>

      <SectionHeading id="payload">Webhook Payload Format</SectionHeading>
      <div className="bg-[#111] border border-white/6 rounded-xl p-4">
        <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-2">Headers sent with every webhook</p>
        <div className="space-y-1.5">
          {[['X-Webhook-Signature','HMAC-SHA256(payload, secret)'],['X-Event-Type','e.g. claim.approved'],['X-Timestamp','Unix timestamp of event'],['X-Idempotency-Key','Unique UUID per event for deduplication']].map(([h,v]) => (
            <div key={h} className="flex items-center gap-3 text-xs">
              <code className="text-orange-400 font-mono shrink-0">{h}</code>
              <span className="text-zinc-500">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <SectionHeading id="security">HMAC Signature Verification</SectionHeading>
      <div className="bg-[#141414] rounded-xl p-4 font-mono text-xs text-green-400 border border-white/6 whitespace-pre">{`// Node.js verification example
const crypto = require('crypto');
const signature = crypto
  .createHmac('sha256', process.env.WEBHOOK_SECRET)
  .update(rawBody)
  .digest('hex');
if (signature !== req.headers['x-webhook-signature']) {
  return res.status(401).send('Invalid signature');
}`}</div>

      <SectionHeading id="retry">Retry Policy</SectionHeading>
      <div className="space-y-2">
        {[['Attempt 1','Immediate on event fire'],['Retry 1','5 minutes after first failure'],['Retry 2','15 minutes after first failure'],['Retry 3','60 minutes after first failure — final attempt']].map(([attempt, desc]) => (
          <div key={attempt} className="flex items-center gap-3 bg-[#111] border border-white/6 rounded-xl px-4 py-2.5">
            <span className="text-orange-400 font-mono text-xs shrink-0 w-20">{attempt}</span>
            <span className="text-zinc-500 text-xs">{desc}</span>
          </div>
        ))}
      </div>

      <SectionHeading id="manage">Manage Webhooks</SectionHeading>
      <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-3">
          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-mono px-3 py-1">GET</span>
          <span className="font-mono text-white text-sm">/api/webhooks</span>
          <span className="text-zinc-500 text-xs ml-2">List all registered webhooks</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-mono px-3 py-1">DELETE</span>
          <span className="font-mono text-white text-sm">/api/webhooks/:id</span>
          <span className="text-zinc-500 text-xs ml-2">Remove a registered webhook</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-mono px-3 py-1">POST</span>
          <span className="font-mono text-white text-sm">/api/webhooks/:id/test</span>
          <span className="text-zinc-500 text-xs ml-2">Send a test payload to verify endpoint</span>
        </div>
      </div>
    </article>
  );
}

// ─── Webhooks placeholder (genuinely not built yet) ───────────────────────────
function Placeholder({ id }) {
  return (
    <article>
      <h1 className="text-4xl font-bold text-white mb-3">{id.replace(/([A-Z])/g,' $1').trim()}</h1>
      <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl px-4 py-3 text-sm text-zinc-400">
        <span className="text-orange-400 font-semibold">Coming Soon: </span>
        This section is being documented and will be available shortly.
      </div>
    </article>
  );
}

const CONTENT = {
  Introduction, HowItWorks, CoveragePlans,
  DisruptionTypes, MLPayoutModel, AdminDashboard: AdminDashboardDoc,
  Registration, SafetyMode, Payouts,
  ZoneManagement, FraudDetection,
  Endpoints, Authentication,
  QuickSetup, Analytics, Thresholds, Webhooks,
};


// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const [active,  setActive]  = useState('Introduction');
  const [navOpen, setNavOpen] = useState(true);
  const contentRef = useRef(null);

  const handleNav = (id) => {
    setActive(id);
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const Content = CONTENT[active] || (() => <Placeholder id={active} />);

  return (
    <div
      className="flex h-full bg-[#0a0a0a] overflow-hidden"
      style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}
    >
      {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <main
        ref={contentRef}
        className="flex-1 min-w-0 overflow-y-auto"
      >
        <div className="max-w-3xl mx-auto px-10 py-10">
          <Content />
          {/* Bottom nav */}
          <div className="flex justify-between mt-16 pt-8 border-t border-white/8">
            <button onClick={() => handleNav('Introduction')} className="text-zinc-500 hover:text-white text-sm transition-colors">
              ← Introduction
            </button>
            <button onClick={() => handleNav('HowItWorks')} className="text-zinc-500 hover:text-white text-sm transition-colors">
              How It Works →
            </button>
          </div>
        </div>
      </main>

      {/* ── DOC SECTION NAV (collapsible, on right) ───────────────────────── */}
      <aside className={`shrink-0 border-l border-white/8 overflow-y-auto hidden lg:flex flex-col transition-all duration-300 ${
        navOpen ? 'w-52' : 'w-12'
      }`}>
        {/* Collapsed state toggle button */}
        {!navOpen && (
          <div className="flex justify-center pt-5 pb-2">
            <button
              onClick={() => setNavOpen(true)}
              className="group/docs w-10 h-10 flex items-center justify-center hover:bg-white/5 transition-colors cursor-pointer rounded-xl relative"
              title="Expand documentation menu"
            >
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-zinc-800/20 border border-white/5 group-hover/docs:opacity-0 transition-opacity duration-200">
                <FileText className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#1a1a1a] border border-[#333] opacity-0 group-hover/docs:opacity-100 transition-opacity duration-200">
                <PanelRightOpen className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
            </button>
          </div>
        )}

        {/* Nav items — hidden when collapsed */}
        {navOpen && (
          <nav className="px-3 pt-5 pb-6 space-y-5">
            {NAV.map(({ section, items }, idx) => (
              <div key={section}>
                {idx === 0 ? (
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold px-2">{section}</p>
                    <button
                      onClick={() => setNavOpen(false)}
                      title="Collapse sidebar"
                      className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-white/8 transition-all mr-1"
                    >
                      <PanelRightClose className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold px-2 mb-2">{section}</p>
                )}
                {items.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => handleNav(id)}
                    className={`relative w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 text-left group ${
                      active === id
                        ? 'bg-orange-500/15 text-orange-400 font-bold'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {active === id && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-orange-500 rounded-r-md" />
                    )}
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${active === id ? 'text-orange-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>
        )}

        {/* When collapsed: show icon-only nav */}
        {!navOpen && (
          <nav className="px-1 pb-6 space-y-1">
            {NAV.flatMap(({ items }) => items).map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => { handleNav(id); setNavOpen(true); }}
                title={label}
                className={`w-full flex items-center justify-center p-2 rounded-lg transition-colors ${
                  active === id ? 'text-orange-400 bg-orange-500/15' : 'text-zinc-600 hover:text-zinc-300 hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </nav>
        )}
      </aside>
    </div>
  );
}
