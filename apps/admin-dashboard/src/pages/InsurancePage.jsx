import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CloudRain, Thermometer, Waves, Wind, AlertTriangle,
  AlertCircle, ShieldCheck, Check, ChevronDown, ArrowLeft, Download, Clock, Shield
} from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────
const STEPS = [
  { n:'01', title:'Sign Up',              time:'2 minutes',  desc:'Download the app, verify phone via OTP. No paperwork.' },
  { n:'02', title:'Pay Weekly Premium',   time:'Rs. 49–119', desc:'Choose a plan and enable UPI AutoPay. Cancel anytime.' },
  { n:'03', title:'AI Monitors 24/7',     time:'Every 15 min',desc:'Weather, AQI, curfew APIs checked continuously for your zone.' },
  { n:'04', title:'Get Paid Automatically',time:'< 2 minutes',desc:'Disruption detected, money arrives in your UPI. Zero forms.' },
];

const PLANS = [
  {
    tier:'Basic', price:'49', border:'border-white/10', bg:'bg-[#0f0f0f]', tag:null,
    coverage:'6 hrs', max:'Rs. 500',
    features:['Heavy Rain coverage','UPI instant payout','Zone monitoring','Email support'],
    locked:['Heat + AQI coverage','Flood coverage','Curfew / Strike','Priority support'],
  },
  {
    tier:'Standard', price:'79', border:'border-orange-500/50', bg:'bg-orange-500/3', tag:'Most Popular',
    coverage:'8 hrs', max:'Rs. 900',
    features:['Heavy Rain coverage','Extreme Heat coverage','AQI / Smog coverage','Flood coverage','UPI instant payout','Zone monitoring','Priority support'],
    locked:['Curfew / Strike','Dedicated manager'],
  },
  {
    tier:'Premium', price:'119', border:'border-purple-500/30', bg:'bg-purple-500/3', tag:null,
    coverage:'12 hrs', max:'Rs. 1,500',
    features:['All 6 disruption types','UPI instant payout','Zone monitoring','Priority support','Dedicated account manager'],
    locked:[],
  },
];

const DISRUPTIONS = [
  { Icon:CloudRain,    label:'Heavy Rain',    threshold:'> 50mm in 3 hours',        color:'text-blue-400' },
  { Icon:Thermometer,  label:'Extreme Heat',  threshold:'> 45°C for 4+ hours',      color:'text-orange-400' },
  { Icon:Waves,        label:'Flood',         threshold:'Official alert issued',     color:'text-cyan-400' },
  { Icon:Wind,         label:'Severe AQI',    threshold:'> 400 AQI',                color:'text-zinc-400' },
  { Icon:ShieldCheck,  label:'Curfew',        threshold:'Official order in zone',    color:'text-red-400' },
  { Icon:AlertTriangle,label:'Strike',        threshold:'Zone blocked > 4 hours',   color:'text-amber-400' },
  { Icon:AlertCircle,  label:'Zone Closure',  threshold:'> 70% restaurants closed', color:'text-purple-400' },
];

const FAQS = [
  ['How do I file a claim?',              'You don\'t. Claims are 100% automatic. When a disruption is detected in your zone, payout is triggered instantly with no action needed from you.'],
  ['How fast do I get paid?',             'Within 2 minutes of a disruption being confirmed. Our AI verification and UPI transfer happen in under 120 seconds.'],
  ['What if I don\'t have a bank account?','Any UPI ID works — Google Pay, PhonePe, Paytm, or any bank UPI. No bank account needed separately.'],
  ['Can I cancel anytime?',               'Yes. No lock-in period. Cancel directly from the app and your premium stops from next week.'],
  ['What if I\'m not working that day?',  'Payouts are only issued to riders who were active in the disrupted zone before the event. Inactive riders are not charged and do not receive payouts for that event.'],
  ['Is this real insurance?',             'RiderShield is a parametric income protection product. Coverage is trigger-based on real environmental data. Designed for Guidewire DEVTrails 2026 demo purposes.'],
  ['What documents do I need?',           'Aadhaar number, PAN card, and a UPI ID. The onboarding takes under 3 minutes with AI-assisted KYC.'],
  ['Does this cover accidents or health?','No. RiderShield covers income loss from external environmental disruptions only — weather, air quality, civil events. Not accidents, health, or vehicle damage.'],
];

// ─── FAQ Accordion item ───────────────────────────────────────────────────────
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/8 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/3 transition-colors"
      >
        <span className="text-white text-sm font-medium">{q}</span>
        <ChevronDown className={`w-4 h-4 text-zinc-500 shrink-0 ml-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-6 pb-5 text-zinc-400 text-sm leading-relaxed border-t border-white/6 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InsurancePage() {
  return (
    <div
      className="min-h-screen bg-[#0a0a0a] text-zinc-400"
      style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}
    >
      {/* SEO */}
      <title>RiderShield Insurance — Zero-Touch Income Protection for Delivery Workers</title>

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-white text-xs transition-colors mb-8"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Home
        </Link>

        <span className="block text-[10px] uppercase tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1 mb-6 w-fit mx-auto">
          Parametric Income Insurance
        </span>
        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-5">
          Insurance That Works<br />
          <span className="text-orange-500">When You Can't</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-10">
          Zero-touch income protection for Zomato and Swiggy delivery workers.
          Disruption detected. Money in UPI. No claim forms ever.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/worker"
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-2xl transition-all text-sm"
          >
            <Download className="w-4 h-4" />
            Download App
          </Link>
          <a
            href="#how-it-works"
            className="border border-white/15 text-zinc-300 hover:text-white hover:border-white/30 px-8 py-3.5 rounded-2xl transition-all text-sm"
          >
            Learn How It Works
          </a>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 mb-24">
        <div className="grid grid-cols-3 gap-6">
          {[
            ['10M+',   'Gig Workers in India'],
            ['Rs. 0',  'Manual Claims Filed'],
            ['2 Min',  'Average Payout Time'],
          ].map(([val, label]) => (
            <div key={label} className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-8 text-center">
              <p className="text-4xl font-bold text-white mb-2">{val}</p>
              <p className="text-zinc-500 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 mb-24">
        <p className="text-[10px] uppercase tracking-widest text-zinc-600 text-center mb-3">Process</p>
        <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-5">
          {STEPS.map(({ n, title, time, desc }) => (
            <div key={n} className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6 flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm mb-4">
                {n}
              </div>
              <p className="text-white font-semibold text-sm mb-1">{title}</p>
              <p className="text-orange-400 font-mono text-xs mb-3">{time}</p>
              <p className="text-zinc-500 text-xs leading-relaxed flex-1">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── COVERAGE PLANS ────────────────────────────────────────────────────── */}
      <section id="plans" className="max-w-5xl mx-auto px-6 mb-24">
        <p className="text-[10px] uppercase tracking-widest text-zinc-600 text-center mb-3">Pricing</p>
        <h2 className="text-3xl font-bold text-white text-center mb-12">Coverage Plans</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map(p => (
            <div
              key={p.tier}
              className={`${p.bg} border ${p.border} rounded-2xl p-6 flex flex-col hover:-translate-y-1 transition-transform duration-200`}
            >
              {p.tag && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full mb-3 self-start">
                  {p.tag}
                </span>
              )}
              <h3 className="text-white font-bold text-lg mb-1">{p.tier}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-white">Rs. {p.price}</span>
                <span className="text-zinc-500 text-sm">/week</span>
              </div>
              <div className="flex gap-4 mb-5 text-xs text-zinc-500">
                <span><Clock className="w-3 h-3 inline mr-1" />{p.coverage} coverage</span>
                <span><Shield className="w-3 h-3 inline mr-1" />{p.max} max</span>
              </div>
              <ul className="space-y-2 flex-1 mb-6">
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
              <Link
                to="/worker"
                className="block text-center bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 font-semibold text-sm py-2.5 rounded-xl transition-colors"
              >
                Get {p.tier}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── DISRUPTIONS COVERED ───────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 mb-24">
        <p className="text-[10px] uppercase tracking-widest text-zinc-600 text-center mb-3">Coverage</p>
        <h2 className="text-3xl font-bold text-white text-center mb-12">Disruptions Covered</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {DISRUPTIONS.map(({ Icon, label, threshold, color }) => (
            <div key={label} className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5 flex flex-col items-center text-center hover:border-orange-500/30 transition-colors">
              <Icon className={`w-8 h-8 ${color} mb-3`} />
              <p className="text-white font-semibold text-sm mb-1">{label}</p>
              <p className="text-zinc-600 text-xs">{threshold}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 mb-24">
        <p className="text-[10px] uppercase tracking-widest text-zinc-600 text-center mb-3">FAQ</p>
        <h2 className="text-3xl font-bold text-white text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQS.map(([q, a]) => <FAQItem key={q} q={q} a={a} />)}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-6 mb-24 text-center">
        <div className="bg-[#0f0f0f] border border-orange-500/20 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-white mb-3">Start Protecting Your Income Today</h2>
          <p className="text-zinc-500 text-sm mb-8">Join 10,000+ delivery partners already covered</p>
          <Link
            to="/worker"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-10 py-4 rounded-2xl text-base transition-all"
          >
            <Download className="w-5 h-5" />
            Download from Play Store
          </Link>
          <p className="text-zinc-700 text-xs mt-4">Available on Android. iOS coming soon.</p>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/6 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-bold text-sm">
            <span className="text-white">RIDER</span>
            <span className="text-orange-500">SHIELD</span>
          </span>
          <div className="flex items-center gap-6 text-xs text-zinc-600">
            <Link to="/docs" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/docs" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/docs" className="hover:text-white transition-colors">Contact</Link>
            <a href="https://github.com" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
