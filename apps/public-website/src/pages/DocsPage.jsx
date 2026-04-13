import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Smartphone, ShieldCheck, Zap, Banknote,
  Check, X, HelpCircle, Download, UserCheck, CloudRain,
  Thermometer, Wind, Waves, AlertCircle, Lock, Star,
  PanelLeftClose, PanelLeftOpen, FileText
} from 'lucide-react';

// ─── Sidebar navigation (user-only) ──────────────────────────────────────────
const NAV = [
  {
    section: 'Getting Started',
    items: [
      { id: 'WhatIsRiderShield', label: 'What is RiderShield?', Icon: BookOpen    },
      { id: 'DownloadApp',       label: 'Download the App',     Icon: Download    },
      { id: 'HowItWorks',        label: 'How It Works',         Icon: Zap         },
    ],
  },
  {
    section: 'Setup & Registration',
    items: [
      { id: 'Registration',      label: 'Registration Guide',   Icon: UserCheck   },
      { id: 'UPISetup',          label: 'UPI & Payments',       Icon: Banknote    },
      { id: 'ChoosePlan',        label: 'Choose a Plan',        Icon: Star        },
    ],
  },
  {
    section: 'Coverage & Payouts',
    items: [
      { id: 'WhatsCovered',      label: "What's Covered",       Icon: ShieldCheck },
      { id: 'HowPayoutsWork',    label: 'How Payouts Work',     Icon: Banknote    },
      { id: 'SafetyMode',        label: 'Safety Mode',          Icon: Lock        },
    ],
  },
  {
    section: 'Help & FAQs',
    items: [
      { id: 'FAQ',               label: 'FAQs',                 Icon: HelpCircle  },
      { id: 'ContactSupport',    label: 'Contact Support',      Icon: ShieldCheck },
    ],
  },
];

// ─── Shared components ────────────────────────────────────────────────────────
const card = 'bg-[#111] border border-white/8 rounded-2xl p-5';

function SectionHeading({ id, children }) {
  return (
    <h2 id={id} className="text-2xl font-bold font-headline text-white mt-10 mb-3 scroll-mt-24">
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
function Note({ children }) {
  return (
    <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl px-4 py-3 mt-4 text-sm text-zinc-300">
      <span className="text-orange-400 font-semibold">Note: </span>{children}
    </div>
  );
}
function Breadcrumb({ path }) {
  return <p className="text-xs uppercase tracking-widest text-zinc-600 mb-6">RiderShield / Docs / {path}</p>;
}

// ─── SECTION: What is RiderShield? ───────────────────────────────────────────
function WhatIsRiderShield() {
  return (
    <article className="space-y-2">
      <Breadcrumb path="Introduction" />
      <h1 className="text-4xl font-bold font-headline text-white leading-tight">What is RiderShield?</h1>
      <p className="text-zinc-400 text-lg leading-relaxed pt-1">
        India's first zero-touch income protection for gig delivery workers.
      </p>

      <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl px-5 py-4 mt-6">
        <p className="text-white font-semibold mb-2 text-sm">The simple idea</p>
        <p className="text-zinc-400 text-sm leading-relaxed">
          When bad weather, floods, curfews, or smog prevent you from delivering,
          <strong className="text-white"> RiderShield automatically pays you</strong> — no filing, no waiting, no phone calls.
          The money appears in your UPI within 2 minutes of the disruption threshold being crossed.
        </p>
      </div>

      <SectionHeading id="why-it-exists">Why RiderShield Exists</SectionHeading>
      <Body>
        Gig delivery workers lose income every time Noida gets flooded, Delhi hits 48°C, or a curfew locks
        the roads. Traditional insurance requires claims, paperwork, and weeks of waiting. RiderShield uses
        AI and live weather data to detect these events and pay you instantly — the way it should always have worked.
      </Body>

      <div className="grid grid-cols-[1fr_28px_1fr] gap-4 items-start mt-6">
        <div className={`${card} border-red-500/10`}>
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full mb-4 inline-block">Old Way</span>
          <p className="text-white font-semibold text-sm mb-3">Traditional Insurance</p>
          <ul className="space-y-2">
            {['Manual claim filing','Days or weeks to get paid','Proof documents required','Often rejected on technicalities','Agent calls required'].map(i => (
              <li key={i} className="flex items-center gap-2 text-xs text-zinc-400">
                <X className="w-3 h-3 text-red-400 shrink-0" />{i}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-center pt-14 text-zinc-600 text-lg">→</div>
        <div className={`${card} border-green-500/15`}>
          <span className="text-[10px] font-bold uppercase tracking-widest text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full mb-4 inline-block">RiderShield Way</span>
          <p className="text-white font-semibold text-sm mb-3">Parametric Insurance</p>
          <ul className="space-y-2">
            {['Zero claims to file','Money in UPI in 2 minutes','Automatic detection','AI-verified, no disputes','Works even if you\'re asleep'].map(i => (
              <li key={i} className="flex items-center gap-2 text-xs text-zinc-400">
                <Check className="w-3 h-3 text-green-400 shrink-0" />{i}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <SectionHeading id="who-is-it-for">Who Is It For?</SectionHeading>
      <div className="grid grid-cols-2 gap-3 mt-2">
        {[
          ['Swiggy Delivery Partners',  'Get paid when rain stops your deliveries'],
          ['Zomato Delivery Workers',   'Protection against extreme heat and smog'],
          ['Blinkit & Zepto Partners',  'Flood and curfew coverage across NCR'],
          ['Any Gig Delivery Rider',    'If you deliver, you deserve income protection'],
        ].map(([title, desc]) => (
          <div key={title} className={card}>
            <p className="text-white font-semibold text-sm mb-1">{title}</p>
            <p className="text-zinc-500 text-xs">{desc}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

// ─── SECTION: Download the App ────────────────────────────────────────────────
function DownloadApp() {
  return (
    <article className="space-y-2">
      <Breadcrumb path="Download the App" />
      <h1 className="text-4xl font-bold font-headline text-white">Download the App</h1>
      <p className="text-zinc-400 text-lg pt-1">Everything happens through the RiderShield mobile app.</p>

      <Note>RiderShield is available for Android. iOS version coming Q3 2026.</Note>

      <SectionHeading id="download-steps">How to Download</SectionHeading>
      <div className="space-y-2.5">
        {[
          ['Open Google Play Store',        'On your Android phone, tap the Play Store icon.'],
          ['Search "RiderShield"',          'Search for RiderShield — look for the orange shield logo.'],
          ['Tap Install',                   'The app is free to download. No subscription needed just to install.'],
          ['Open and Register',             'Follow the registration steps — takes under 3 minutes.'],
        ].map(([title, desc], i) => (
          <div key={i} className="flex gap-3 items-start bg-[#111] border border-white/6 rounded-xl px-4 py-3">
            <div className="w-6 h-6 rounded-full bg-orange-500/15 border border-orange-500/25 flex items-center justify-center shrink-0 text-orange-400 text-xs font-bold mt-0.5">{i + 1}</div>
            <div>
              <p className="text-white text-sm font-semibold leading-snug">{title}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <SectionHeading id="system-requirements">App Requirements</SectionHeading>
      <div className="grid grid-cols-2 gap-3">
        {[
          ['Android Version', 'Android 8.0 or higher'],
          ['Storage',         '45 MB free space'],
          ['Internet',        'Required for registration and payouts'],
          ['Phone Number',    'Active Indian mobile number'],
        ].map(([k, v]) => (
          <div key={k} className={card}>
            <p className="text-zinc-500 text-xs mb-1">{k}</p>
            <p className="text-white font-medium text-sm">{v}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#141414] border border-white/6 rounded-2xl p-5 mt-4 flex items-center gap-4">
        <Smartphone className="w-8 h-8 text-orange-500 shrink-0" />
        <div>
          <p className="text-white font-semibold text-sm">Already installed?</p>
          <p className="text-zinc-500 text-xs mt-0.5">Open the app and tap "Get Started" to register. Your company may have already enrolled you — check with your delivery coordinator.</p>
        </div>
      </div>
    </article>
  );
}

// ─── SECTION: How It Works ────────────────────────────────────────────────────
function HowItWorks() {
  return (
    <article className="space-y-2">
      <Breadcrumb path="How It Works" />
      <h1 className="text-4xl font-bold font-headline text-white">How RiderShield Works</h1>
      <p className="text-zinc-400 text-lg pt-1">From disruption to UPI payout in under 2 minutes.</p>

      <SectionHeading id="the-flow">The Full Flow — Step by Step</SectionHeading>
      <div className="space-y-2.5">
        {[
          ['You Register Once',              'Download the app, verify your phone and Aadhaar, enter your UPI ID, and pick a coverage plan. That\'s it — forever.'],
          ['We Watch Your Zone 24/7',        'RiderShield\'s AI monitors weather, AQI, flood alerts, and government advisories across your delivery zone, every 15 minutes.'],
          ['A Disruption Threshold Is Hit',  'When rainfall crosses 50mm/hr, heat goes above 45°C, or a flood advisory is issued — the system detects it instantly.'],
          ['Every Rider in That Zone Gets Paid', 'All registered riders in the disrupted zone are identified. Payouts are calculated automatically based on severity and your plan.'],
          ['Money Lands in Your UPI',        'Funds are transferred to your UPI ID — the same one you linked during registration. Usually within 60–90 seconds of detection.'],
          ['You Get Notified',               'A push notification confirms the payout. You can see the breakdown in the app: disruption type, hours affected, payout amount.'],
        ].map(([title, desc], i) => (
          <div key={i} className="flex gap-3 items-start bg-[#111] border border-white/6 rounded-xl px-4 py-4">
            <div className="w-7 h-7 rounded-full bg-orange-500/15 border border-orange-500/25 flex items-center justify-center shrink-0 text-orange-400 text-xs font-bold mt-0.5">{i + 1}</div>
            <div>
              <p className="text-white text-sm font-semibold leading-snug">{title}</p>
              <p className="text-zinc-500 text-xs mt-1 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <SectionHeading id="what-you-dont-need-to-do">What You Don't Need to Do</SectionHeading>
      <div className="grid grid-cols-2 gap-3">
        {[
          'File any claim',
          'Call anyone',
          'Take photos as proof',
          'Visit any office',
          'Wait more than 2 minutes',
          'Check the app manually',
        ].map(i => (
          <div key={i} className="flex items-center gap-2 bg-[#111] border border-white/6 rounded-xl px-4 py-3">
            <X className="w-3 h-3 text-red-400 shrink-0" />
            <span className="text-zinc-400 text-sm">{i}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

// ─── SECTION: Registration Guide ─────────────────────────────────────────────
function Registration() {
  return (
    <article className="space-y-2">
      <Breadcrumb path="Registration Guide" />
      <h1 className="text-4xl font-bold font-headline text-white">Registration Guide</h1>
      <p className="text-zinc-400 text-lg pt-1">Under 3 minutes. You only do this once.</p>

      <Note>You need: your Aadhaar number, PAN card, and a UPI ID (PhonePe, GPay, Paytm etc.).</Note>

      <SectionHeading id="steps">Registration Steps</SectionHeading>
      <div className="space-y-2.5">
        {[
          ['Download & Open App',    'Install RiderShield from Play Store. Open and tap "Get Started".'],
          ['Enter Phone Number',     'Type your active Indian mobile number. An OTP will be sent — enter it to verify.'],
          ['Aadhaar Verification',   'Enter your Aadhaar number. Take a live selfie — our AI matches it to your Aadhaar photo instantly.'],
          ['PAN Card',               'Take a photo of your PAN card. This helps verify your identity as a gig worker.'],
          ['Link UPI ID',            'Enter the UPI ID where payouts should be sent. This is where money goes automatically — make sure it\'s active.'],
          ['Select Your Zone',       'Pick your primary delivery zone (e.g. Noida Sector 18, Delhi Rohini). All riders in this zone share the same disruption detection.'],
          ['Choose a Plan',          'Select Basic (Rs. 49/week), Standard (Rs. 79/week), or Premium (Rs. 119/week). You can upgrade at any time.'],
          ['Weekly Premium Auto-Deducted', 'Your plan premium is deducted weekly from your linked bank account. You\'re covered immediately after registration.'],
        ].map(([title, desc], i) => (
          <div key={i} className="flex gap-3 items-start bg-[#111] border border-white/6 rounded-xl px-4 py-3">
            <div className="w-6 h-6 rounded-full bg-orange-500/15 border border-orange-500/25 flex items-center justify-center shrink-0 text-orange-400 text-xs font-bold mt-0.5">{i + 1}</div>
            <div>
              <p className="text-white text-sm font-semibold leading-snug">{title}</p>
              <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <SectionHeading id="security">Your Security</SectionHeading>
      <div className="bg-[#1a1a1a] rounded-xl p-4">
        <p className="text-white text-sm font-semibold mb-3">Bank-Level Protection</p>
        <ul className="space-y-2">
          {[
            'Biometric lock — fingerprint or face ID required each login',
            'One account per device — prevents account sharing',
            'OTP verification on every critical action',
            'App blocks on rooted or developer-mode phones',
          ].map(s => (
            <li key={s} className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />{s}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

// ─── SECTION: UPI & Payments ──────────────────────────────────────────────────
function UPISetup() {
  return (
    <article className="space-y-2">
      <Breadcrumb path="UPI & Payments" />
      <h1 className="text-4xl font-bold font-headline text-white">UPI & Payments</h1>
      <p className="text-zinc-400 text-lg pt-1">How payouts reach you, and how premiums are collected.</p>

      <SectionHeading id="payout-upi">How Payouts Work</SectionHeading>
      <Body>
        When a qualifying disruption is detected in your zone, funds are sent directly to the UPI ID
        you registered. You do not need the app open. You do not need to do anything. The money arrives
        automatically, just like a UPI transfer from a friend.
      </Body>

      <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 mt-4">
        <p className="text-green-400 font-semibold text-sm mb-2">Supported UPI Apps</p>
        <div className="grid grid-cols-3 gap-2">
          {['PhonePe', 'Google Pay', 'Paytm', 'BHIM', 'Amazon Pay', 'Any UPI App'].map(app => (
            <div key={app} className="flex items-center gap-2 text-xs text-zinc-400">
              <Check className="w-3 h-3 text-green-400 shrink-0" />{app}
            </div>
          ))}
        </div>
      </div>

      <SectionHeading id="premium-deduction">Weekly Premium Deduction</SectionHeading>
      <div className="space-y-2.5">
        {[
          ['When?',    'Every 7 days from your registration date.'],
          ['How?',     'Automatically deducted via UPI mandate — you give one-time consent during registration.'],
          ['Amount?',  'Basic: Rs. 49 | Standard: Rs. 79 | Premium: Rs. 119 per week.'],
          ['Cancel?',  'You can cancel anytime from the app. Coverage ends at end of current week.'],
        ].map(([k, v]) => (
          <div key={k} className="flex gap-4 bg-[#111] border border-white/6 rounded-xl px-4 py-3">
            <span className="text-orange-400 font-semibold text-sm shrink-0 w-16">{k}</span>
            <span className="text-zinc-400 text-sm">{v}</span>
          </div>
        ))}
      </div>

      <SectionHeading id="update-upi">Changing Your UPI ID</SectionHeading>
      <Body>Go to Profile → Payment Settings → Update UPI in the app. Changes take effect from the next payout cycle. You may need to verify via OTP.</Body>
    </article>
  );
}

// ─── SECTION: Choose a Plan ───────────────────────────────────────────────────
function ChoosePlan() {
  const plans = [
    {
      tier: 'Basic', price: '49', tag: null, border: 'border-white/8', highlight: '',
      features: ['Heavy Rain coverage', 'Extreme Heat coverage', 'UPI auto-payout', 'Zone monitoring', '6 hrs coverage/day'],
      locked:   ['AQI / Smog', 'Flood coverage', 'Curfew / Strike', 'Priority support'],
      best: 'Casual riders who only work in good weather.',
    },
    {
      tier: 'Standard', price: '79', tag: 'Most Popular', border: 'border-orange-500/30', highlight: 'bg-orange-500/3',
      features: ['Everything in Basic', 'AQI / Smog coverage', 'Flood coverage', '8 hrs coverage/day', 'Rs. 900 max weekly payout'],
      locked:   ['Curfew / Strike', 'Priority support'],
      best: 'Most delivery riders in Delhi NCR and metro cities.',
    },
    {
      tier: 'Premium', price: '119', tag: null, border: 'border-purple-500/25', highlight: 'bg-purple-500/3',
      features: ['All 6 disruption types', '12 hrs coverage/day', 'Rs. 1,500 max weekly payout', 'Priority support', 'Curfew / Strike coverage'],
      locked:   [],
      best: 'Full-time riders in high-risk zones who depend entirely on delivery income.',
    },
  ];

  return (
    <article className="space-y-2">
      <Breadcrumb path="Choose a Plan" />
      <h1 className="text-4xl font-bold font-headline text-white">Choose a Plan</h1>
      <p className="text-zinc-400 text-lg pt-1">Flat weekly rates. Cancel anytime. No hidden fees.</p>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        {plans.map(p => (
          <div key={p.tier} className={`${p.highlight || 'bg-[#0f0f0f]'} border ${p.border} rounded-2xl p-5 flex flex-col`}>
            {p.tag && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full mb-3 self-start">{p.tag}</span>
            )}
            <h3 className="text-white font-bold text-lg font-headline mb-1">{p.tier}</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-bold text-white font-headline">Rs. {p.price}</span>
              <span className="text-zinc-500 text-xs">/week</span>
            </div>
            <p className="text-zinc-600 text-xs mb-4">Billed weekly. Cancel anytime.</p>
            <ul className="space-y-1.5 flex-1 mb-3">
              {p.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-zinc-300">
                  <Check className="w-3 h-3 text-orange-400 shrink-0" />{f}
                </li>
              ))}
              {p.locked.map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-zinc-700">
                  <Check className="w-3 h-3 shrink-0" /><span className="line-through">{f}</span>
                </li>
              ))}
            </ul>
            <div className="bg-white/3 border border-white/6 rounded-xl px-3 py-2 mt-auto">
              <p className="text-zinc-600 text-[10px] font-semibold uppercase tracking-widest mb-1">Best For</p>
              <p className="text-zinc-400 text-xs">{p.best}</p>
            </div>
          </div>
        ))}
      </div>

      <SectionHeading id="comparison">Plan Comparison</SectionHeading>
      <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1a1a1a] border-b border-white/6">
              <th className="text-left text-xs uppercase tracking-widest text-zinc-500 font-bold px-4 py-3">Coverage</th>
              {['Basic','Standard','Premium'].map(t => (
                <th key={t} className="text-center text-xs uppercase tracking-widest text-zinc-500 font-bold px-4 py-3">{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Heavy Rain',      true,  true,  true ],
              ['Extreme Heat',    true,  true,  true ],
              ['AQI / Smog',      false, true,  true ],
              ['Flood',           false, true,  true ],
              ['Curfew / Strike', false, false, true ],
              ['Priority Support',false, false, true ],
            ].map(([f, ...vals]) => (
              <tr key={f} className="border-b border-white/4">
                <td className="px-4 py-2.5 text-zinc-400">{f}</td>
                {vals.map((v, i) => (
                  <td key={i} className="px-4 py-2.5 text-center">
                    {v ? <Check className="w-4 h-4 text-green-400 mx-auto" /> : <X className="w-4 h-4 text-zinc-700 mx-auto" />}
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

// ─── SECTION: What's Covered ──────────────────────────────────────────────────
function WhatsCovered() {
  const types = [
    { Icon: CloudRain,   title: 'Heavy Rainfall',   threshold: 'Above 50 mm/hr',        why: 'Deliveries become dangerous and impossible. Roads flood, visibility drops.' },
    { Icon: Thermometer, title: 'Extreme Heat',     threshold: 'Above 45°C for 2+ hours', why: 'Prolonged heat exposure risks your health. Many riders stop working.' },
    { Icon: Waves,       title: 'Severe Flood',     threshold: 'Government advisory issued', why: 'Routes become impassable. Official advisory confirms severity.' },
    { Icon: AlertCircle, title: 'High AQI / Smog',  threshold: 'AQI above 400 for 3+ hours', why: 'Many riders avoid outdoor work. Health guidelines advise staying indoors.' },
    { Icon: AlertCircle, title: 'Curfew or Strike', threshold: 'Official zone lockdown', why: 'Orders dry up and you cannot operate even if you want to. Premium plan only.' },
    { Icon: Wind,        title: 'Strong Winds',     threshold: 'Above 50 km/h',          why: 'Two-wheelers become dangerous to operate in high wind conditions.' },
  ];

  return (
    <article className="space-y-2">
      <Breadcrumb path="What's Covered" />
      <h1 className="text-4xl font-bold font-headline text-white">What's Covered</h1>
      <p className="text-zinc-400 text-lg pt-1">Six types of disruptions. All detected automatically.</p>

      <Note>
        Coverage depends on your plan tier. Basic covers Rain and Heat. Standard adds AQI and Flood. Premium covers all 6 types.
      </Note>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {types.map(({ Icon, title, threshold, why }) => (
          <div key={title} className={card}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{title}</p>
                <p className="text-orange-400 font-mono text-xs mt-0.5">{threshold}</p>
              </div>
            </div>
            <p className="text-zinc-500 text-xs leading-relaxed">{why}</p>
          </div>
        ))}
      </div>

      <SectionHeading id="what-is-not-covered">What's Not Covered</SectionHeading>
      <div className="space-y-1.5">
        {[
          'Personal accidents or injuries — use your company\'s accident cover for that',
          'Vehicle damage or theft',
          'Disruptions below the threshold (light drizzle, mild heat)',
          'Disruptions outside your registered zone',
          'Periods when your plan is inactive or cancelled',
        ].map(i => (
          <div key={i} className="flex items-center gap-2 bg-[#111] border border-white/6 rounded-xl px-4 py-3">
            <X className="w-3 h-3 text-red-400 shrink-0" />
            <span className="text-zinc-400 text-sm">{i}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

// ─── SECTION: How Payouts Work ────────────────────────────────────────────────
function HowPayoutsWork() {
  return (
    <article className="space-y-2">
      <Breadcrumb path="How Payouts Work" />
      <h1 className="text-4xl font-bold font-headline text-white">How Payouts Work</h1>
      <p className="text-zinc-400 text-lg pt-1">Automatic, instant, and transparent.</p>

      <SectionHeading id="payout-formula">How Your Payout Is Calculated</SectionHeading>
      <Body>
        Your payout is based on how many hours the disruption lasted, how severe it was, and your
        average hourly earnings. You don't need to provide any of this — we calculate it automatically.
      </Body>

      <div className="bg-[#1a1a1a] rounded-xl px-5 py-4 font-mono text-sm text-green-400 mt-4">
        Payout = Hourly Earnings × Hours Affected × Severity Score
      </div>

      <SectionHeading id="example">Example Calculation</SectionHeading>
      <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-5 space-y-2.5">
        <p className="text-orange-400 font-semibold text-sm">Rahul's Payout — Noida Rain Event</p>
        {[
          ['Rahul earns',        'Rs. 5,400/week → Rs. 96/hour'],
          ['Rain lasted',        '4 hours above threshold'],
          ['Severity Score',     '0.87 (heavy rain, not just drizzle)'],
          ['Calculation',        '96 × 4 × 0.87'],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm">
            <span className="text-zinc-500">{k}</span>
            <span className="text-white font-medium font-mono">{v}</span>
          </div>
        ))}
        <div className="border-t border-orange-500/20 pt-3 flex justify-between items-center">
          <span className="text-zinc-400 font-semibold text-sm">Rahul receives</span>
          <span className="text-green-400 font-bold text-2xl font-mono">Rs. 334</span>
        </div>
        <p className="text-zinc-600 text-xs">Credited to rahul@upi in 47 seconds. Before he even knew it rained enough.</p>
      </div>

      <SectionHeading id="payout-limits">Payout Limits by Plan</SectionHeading>
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
            {[
              ['Basic',    'Rs. 500',   'Rs. 200'],
              ['Standard', 'Rs. 900',   'Rs. 400'],
              ['Premium',  'Rs. 1,500', 'Rs. 800'],
            ].map(([plan, weekly, perEvent]) => (
              <tr key={plan} className="border-b border-white/4">
                <td className="px-4 py-2.5 text-white font-semibold text-sm">{plan}</td>
                <td className="px-4 py-2.5 text-orange-400 font-mono text-sm">{weekly}</td>
                <td className="px-4 py-2.5 text-zinc-400 font-mono text-sm">{perEvent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionHeading id="timeline">Payout Timeline</SectionHeading>
      <div className="grid grid-cols-4 gap-3">
        {[
          ['Disruption Detected', '0 sec'],
          ['You Are Verified',    '< 15 sec'],
          ['Fraud Check',         '< 30 sec'],
          ['UPI Credit',          '< 2 min'],
        ].map(([label, time], i) => (
          <div key={i} className="bg-[#111] border border-white/6 rounded-xl p-4 text-center">
            <div className="w-7 h-7 rounded-full bg-orange-500/15 border border-orange-500/25 flex items-center justify-center mx-auto text-orange-400 text-xs font-bold mb-2">{i + 1}</div>
            <p className="text-white text-xs font-semibold mb-1">{label}</p>
            <p className="text-orange-400 font-mono text-xs">{time}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

// ─── SECTION: Safety Mode ─────────────────────────────────────────────────────
function SafetyMode() {
  return (
    <article className="space-y-2">
      <Breadcrumb path="Safety Mode" />
      <h1 className="text-4xl font-bold font-headline text-white">Safety Mode</h1>
      <p className="text-zinc-400 text-lg pt-1">For disruptions our sensors can't detect — like sudden curfews or local strikes.</p>

      <Note>
        Safety Mode is for events that happen without warning — like a sudden curfew, road blockage, or local bandh.
        You activate it manually; we verify it automatically.
      </Note>

      <SectionHeading id="how-to-activate">How to Activate Safety Mode</SectionHeading>
      <div className="space-y-2.5">
        {[
          ['Open the RiderShield app',          'Tap the orange "Safety Mode" button on your home screen.'],
          ['Select disruption type',             'Choose: Curfew, Strike, Road Blockage, or Market Closure.'],
          ['Confirm your current location',      'The app checks your GPS to confirm you\'re inside your registered delivery zone.'],
          ['Wait for verification',              'Our system cross-checks news sources and checks if other riders in your zone also activated. Usually 2–3 minutes.'],
          ['Receive confirmation or rejection',  'If verified, your payout is triggered. If not enough signals, the request is reviewed by our team within 1 hour.'],
        ].map(([title, desc], i) => (
          <div key={i} className="flex gap-3 items-start bg-[#111] border border-white/6 rounded-xl px-4 py-3">
            <div className="w-6 h-6 rounded-full bg-orange-500/15 border border-orange-500/25 flex items-center justify-center shrink-0 text-orange-400 text-xs font-bold mt-0.5">{i + 1}</div>
            <div>
              <p className="text-white text-sm font-semibold leading-snug">{title}</p>
              <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <SectionHeading id="limits">Activation Limits</SectionHeading>
      <Body>To prevent misuse, Safety Mode activations per week depend on your trust score (built up over time):</Body>
      <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden mt-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1a1a1a] border-b border-white/6">
              <th className="text-left text-xs uppercase tracking-widest text-zinc-500 font-bold px-4 py-3">Your Trust Score</th>
              <th className="text-left text-xs uppercase tracking-widest text-zinc-500 font-bold px-4 py-3">Weekly Limit</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['High (90–100)',   '3 activations/week'],
              ['Good (70–89)',    '2 activations/week'],
              ['Fair (50–69)',    '1 activation/week'],
              ['Low (below 50)', 'Manual review only'],
            ].map(([score, limit]) => (
              <tr key={score} className="border-b border-white/4">
                <td className="px-4 py-2.5 text-zinc-300 text-sm">{score}</td>
                <td className="px-4 py-2.5 text-orange-400 font-mono text-sm">{limit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

// ─── SECTION: FAQs ────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState(null);
  const faqs = [
    ['Do I need to do anything to receive my payout?',
     'No. Once you register, everything is automatic. You will receive a notification and the money directly in your UPI.'],
    ['What if I\'m not working during the disruption?',
     'You still get paid as long as you are registered in the affected zone. RiderShield compensates you for the income opportunity lost — not just hours worked.'],
    ['Can I change my zone after registration?',
     'Yes. Go to Profile → My Zone → Update Zone in the app. This takes effect from the next coverage week.'],
    ['What if my UPI transfer fails?',
     'RiderShield retries automatically 3 times. If it still fails, our team contacts you within 24 hours and resends via alternate method.'],
    ['Can I have more than one plan?',
     'No, one active plan per registered phone number. But you can upgrade or downgrade at any time.'],
    ['How do I cancel my plan?',
     'Go to Profile → My Plan → Cancel Subscription. Coverage continues till end of the current week. No refunds for the active week.'],
    ['What is a "trust score"?',
     'It\'s a number from 0–100 that reflects how reliable your history with RiderShield is. New riders start at 70. Successfully verified events increase it; rejected Safety Mode activations lower it.'],
    ['Is my Aadhaar data stored?',
     'Only a verification hash is stored — not your full Aadhaar number. Your data is processed per DPDP Act 2023 guidelines.'],
    ['What happens if multiple disruptions happen at once?',
     'You are paid for each separate qualifying disruption. If rain and a curfew happen simultaneously, you receive payouts for both (if your plan covers both).'],
    ['I\'m new to delivery. Can I still sign up?',
     'Yes, you can sign up from day one of delivery work. Your earnings baseline is estimated for the first 4 weeks, then updated based on actual data.'],
  ];

  return (
    <article className="space-y-2">
      <Breadcrumb path="FAQs" />
      <h1 className="text-4xl font-bold font-headline text-white">Frequently Asked Questions</h1>
      <p className="text-zinc-400 text-lg pt-1">Everything riders ask us most often.</p>

      <div className="space-y-2 mt-6">
        {faqs.map(([q, a], i) => (
          <div key={i} className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-left"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="text-white font-semibold text-sm pr-4">{q}</span>
              <span className={`shrink-0 text-zinc-500 text-lg transition-transform ${open === i ? 'rotate-45' : ''}`}>+</span>
            </button>
            {open === i && (
              <div className="px-5 pb-4 border-t border-white/6 pt-3">
                <p className="text-zinc-400 text-sm leading-relaxed">{a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </article>
  );
}

// ─── SECTION: Contact Support ─────────────────────────────────────────────────
function ContactSupport() {
  return (
    <article className="space-y-2">
      <Breadcrumb path="Contact Support" />
      <h1 className="text-4xl font-bold font-headline text-white">Contact Support</h1>
      <p className="text-zinc-400 text-lg pt-1">We're here to help — quickly.</p>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {[
          {
            title: 'In-App Support',
            desc:  'Fastest way. Open the RiderShield app → Help → Chat with us. Average response: under 10 minutes.',
            badge: 'Recommended',
            color: 'orange',
          },
          {
            title: 'WhatsApp Support',
            desc:  'Message us on WhatsApp at +91-XXXX-XXXXXX. Available 6 AM – 11 PM IST, 7 days a week.',
            badge: 'Fast',
            color: 'green',
          },
          {
            title: 'Email Support',
            desc:  'support@ridershield.in — for account issues, payout disputes, or detailed questions. Response within 4 hours.',
            badge: '4hr Response',
            color: 'blue',
          },
          {
            title: 'Your Delivery Company',
            desc:  'If your company enrolled you in RiderShield, your delivery coordinator can also raise issues on your behalf.',
            badge: 'Available',
            color: 'zinc',
          },
        ].map(({ title, desc, badge, color }) => (
          <div key={title} className={card}>
            <span className={`text-[10px] font-bold uppercase tracking-widest text-${color}-400 bg-${color}-500/10 border border-${color}-500/20 px-2.5 py-0.5 rounded-full mb-3 inline-block`}>{badge}</span>
            <p className="text-white font-semibold text-sm mb-2">{title}</p>
            <p className="text-zinc-500 text-xs leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <SectionHeading id="payout-disputes">Disputing a Payout</SectionHeading>
      <div className="space-y-2.5">
        {[
          ['I didn\'t receive my payout',  'Check your UPI app first — sometimes it takes 5 minutes. If nothing after 10 mins, contact via in-app support.'],
          ['My payout amount seems wrong', 'Go to Earnings → tap the payout → "Dispute This Amount". We review within 2 hours.'],
          ['I was in the zone but didn\'t get paid', 'Ensure your zone matches where the event occurred. Contact support with your registered zone and event date.'],
        ].map(([issue, action]) => (
          <div key={issue} className="bg-[#111] border border-white/6 rounded-xl px-4 py-4">
            <p className="text-white text-sm font-semibold mb-1">{issue}</p>
            <p className="text-zinc-500 text-xs leading-relaxed">{action}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

// ─── Section renderer ─────────────────────────────────────────────────────────
const SECTIONS = {
  WhatIsRiderShield, DownloadApp, HowItWorks,
  Registration, UPISetup, ChoosePlan,
  WhatsCovered, HowPayoutsWork, SafetyMode,
  FAQ, ContactSupport,
};

// ─── Main DocsPage ────────────────────────────────────────────────────────────
export default function DocsPage() {
  const [active, setActive] = useState('WhatIsRiderShield');
  const [navOpen, setNavOpen] = useState(true);
  const contentRef = useRef(null);

  // Scroll to top on section change
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [active]);

  const SectionContent = SECTIONS[active] || WhatIsRiderShield;

  return (
    <div
      className="bg-[#0a0a0a] text-zinc-400 font-sans"
      style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}
    >
      <div className="w-full flex gap-0" style={{ height: 'calc(100vh - 4rem)' }}>

        {/* ── Sidebar ── */}
        <aside className={`hidden lg:flex flex-col shrink-0 border-r border-white/6 pt-6 pb-10 sticky top-0 overflow-y-auto transition-all duration-300 overflow-x-hidden ${
          navOpen ? 'w-64 px-4' : 'w-20 px-3'
        }`} style={{ height: 'calc(100vh - 4rem)' }}>

          {/* Collapsed state toggle button */}
          {!navOpen && (
            <div className="flex justify-center mb-8 w-full">
              <button
                onClick={() => setNavOpen(true)}
                className="group/docs w-10 h-10 flex items-center justify-center hover:bg-white/5 transition-colors cursor-pointer rounded-xl relative shrink-0"
                title="Expand documentation menu"
              >
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-zinc-800/20 border border-white/5 group-hover/docs:opacity-0 transition-opacity duration-200">
                  <FileText className="w-5 h-5 text-zinc-400" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#1a1a1a] border border-[#333] opacity-0 group-hover/docs:opacity-100 transition-opacity duration-200">
                  <PanelLeftOpen className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
              </button>
            </div>
          )}

          {/* Navigation Items */}
          <div className="w-full flex-1">
            {NAV.map(({ section, items }, idx) => (
              <div key={section} className={`mb-8 ${!navOpen && 'flex flex-col items-center'}`}>
                {navOpen && (
                  idx === 0 ? (
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold px-2 whitespace-nowrap overflow-hidden">{section}</p>
                      <button
                        onClick={() => setNavOpen(false)}
                        title="Collapse sidebar"
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-all mr-1"
                      >
                        <PanelLeftClose className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-3 px-2 whitespace-nowrap overflow-hidden">{section}</p>
                  )
                )}
                <ul className={`space-y-1 ${!navOpen && 'flex flex-col items-center w-full space-y-3'}`}>
                  {items.map(({ id, label, Icon }) => (
                    <li key={id} className="w-full">
                      <button
                        onClick={() => setActive(id)}
                        title={!navOpen ? label : ''}
                        className={`flex items-center transition-all ${
                          navOpen 
                            ? `w-full gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-left ${active === id ? 'bg-orange-500/10 text-orange-400' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`
                            : `w-12 h-12 justify-center rounded-xl mx-auto ${active === id ? 'bg-orange-500/10 text-orange-400' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`
                        }`}
                      >
                        <Icon className={`shrink-0 ${navOpen ? 'w-4 h-4' : 'w-5 h-5'}`} />
                        {navOpen && <span className="whitespace-nowrap overflow-hidden">{label}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Mobile nav ── */}
        <div className="lg:hidden w-full border-b border-white/6 py-3 overflow-x-auto flex gap-2 sticky top-16 bg-[#0a0a0a] z-40 mb-6">
          {NAV.flatMap(g => g.items).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full transition-all ${
                active === id
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/25 font-semibold'
                  : 'bg-white/4 text-zinc-500 border border-white/6'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Main content ── */}
        <main
          ref={contentRef}
          className="flex-1 min-w-0 py-10 px-6 lg:px-10 overflow-y-auto"
          style={{ height: 'calc(100vh - 4rem)' }}
        >
          <SectionContent />

          {/* Next / Prev navigation */}
          <div className="flex justify-between mt-16 pt-8 border-t border-white/6">
            {(() => {
              const all = NAV.flatMap(g => g.items);
              const idx = all.findIndex(i => i.id === active);
              const prev = all[idx - 1];
              const next = all[idx + 1];
              return (
                <>
                  {prev
                    ? <button onClick={() => setActive(prev.id)} className="text-sm text-zinc-500 hover:text-white transition-colors">← {prev.label}</button>
                    : <div />}
                  {next
                    ? <button onClick={() => setActive(next.id)} className="text-sm text-zinc-500 hover:text-white transition-colors">{next.label} →</button>
                    : <div />}
                </>
              );
            })()}
          </div>
        </main>
      </div>
    </div>
  );
}
