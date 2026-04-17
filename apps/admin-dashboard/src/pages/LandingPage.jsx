import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CloudRain, Thermometer, Waves, Wind, AlertTriangle,
  ShieldCheck, CheckCircle2, AlertCircle, Banknote, UserCheck,
  Check, X, Mail, Lock, User, TrendingUp, Bike, Building2,
  Smartphone, Monitor
} from 'lucide-react';
import heroBg from '../assets/HeroImage.png';

// ─── 6 hero cards — all visible simultaneously ────────────────────────────────
const HERO_CARDS = [
  { pos: 'top-[0%] left-[2%]',    border: 'border-l-orange-500', Icon: CheckCircle2, iconColor: 'text-orange-400', title: 'Claim Approved',      body: 'Rs. 245 credited to UPI',           meta: 'Rahul K. — Noida — 2 min ago' },
  { pos: 'top-[8%] right-[0%]',   border: 'border-l-white/20',   Icon: CloudRain,    iconColor: 'text-zinc-300',   title: 'Rain Alert — Noida',  body: 'Severity 0.8 — 4 hrs affected',     meta: '47 riders in this zone' },
  { pos: 'top-[35%] left-[0%]',   border: 'border-l-orange-500', Icon: ShieldCheck,  iconColor: 'text-orange-400', title: 'Weekly Premium Set',  body: 'Rs. 79/week — Standard Plan',       meta: 'Auto-renewed — Active' },
  { pos: 'top-[42%] right-[2%]',  border: 'border-l-white/20',   Icon: AlertTriangle,iconColor: 'text-zinc-300',   title: 'Fraud Blocked',       body: 'GPS Spoofing Detected',             meta: 'Worker W-4821 — Flagged' },
  { pos: 'top-[70%] left-[4%]',   border: 'border-l-orange-500', Icon: Banknote,     iconColor: 'text-orange-400', title: 'Payout Processing',   body: 'Rs. 1,240 sent to 23 riders',       meta: 'Zone 4A — Noida — now' },
  { pos: 'top-[72%] right-[0%]',  border: 'border-l-white/20',   Icon: UserCheck,    iconColor: 'text-zinc-300',   title: 'New Member',          body: 'Priya D. joined Standard Plan',     meta: 'Onboarded — Delhi — Active' },
];

// ─── Coverage matrix ───────────────────────────────────────────────────────────
const COVERAGE = [
  { Icon: CloudRain,   title: 'Heavy Rainfall',   threshold: '> 50 mm/hr',         payoutRange: 'Rs. 150 – 500', avgTime: '< 90 sec', stat: '2,418 payouts triggered last month', pills: ['Monsoon','Zone-based'] },
  { Icon: Thermometer, title: 'Extreme Heat',     threshold: '> 45°C for 2+ hrs',  payoutRange: 'Rs. 100 – 400', avgTime: '< 60 sec', stat: '1,102 payouts triggered last month', pills: ['Summer','Heatwave'] },
  { Icon: Waves,       title: 'Severe Flood',     threshold: 'Govt. advisory',      payoutRange: 'Rs. 300 – 900', avgTime: '< 2 min',  stat: '340 payouts triggered last month',  pills: ['Flood alert','Official'] },
  { Icon: Wind,        title: 'High AQI',         threshold: '> 400 AQI for 3 hrs', payoutRange: 'Rs. 100 – 350', avgTime: '< 75 sec', stat: '890 payouts triggered last month',  pills: ['Pollution','Delhi NCR'] },
  { Icon: AlertCircle, title: 'Curfew or Strike', threshold: 'Official zone lock',   payoutRange: 'Rs. 200 – 700', avgTime: '< 2 min',  stat: '210 payouts triggered last month',  pills: ['Government','Zone-wide'] },
  { Icon: Wind,        title: 'Strong Winds',     threshold: '> 50 km/h',           payoutRange: 'Rs. 100 – 400', avgTime: '< 90 sec', stat: '560 payouts triggered last month',  pills: ['Cyclone','Coastal'] },
];

// ─── Testimonials ──────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Priya Sharma',  handle: '@priya_delivers', text: 'Finally something that actually helps us. Got Rs. 240 credited after the Noida floods last week. Did not have to do anything.' },
  { name: 'Rohit Kumar',   handle: '@rohitk_swiggy',  text: 'The premium is less than my chai expense per week. And it actually paid out when it rained.' },
  { name: 'Amit Singh',    handle: '@amit_zomato',    text: 'Best thing about this is I completely forgot I had it and money just appeared in my UPI.' },
  { name: 'Neha Verma',    handle: '@neha_delivery',  text: 'Tested it during the Delhi smog week. Rs. 180 credited automatically. Incredible.' },
  { name: 'Rajesh Yadav',  handle: '@rajesh_rider',   text: 'My zone had curfew for 6 hours. Got Rs. 310 without filing anything. This is the future.' },
  { name: 'Sunita Patel',  handle: '@sunita_blinkit', text: 'Weekly Rs. 79 is nothing compared to what I lose on bad weather days. Worth every rupee.' },
];

// ─── Stats ticker ─────────────────────────────────────────────────────────────
const TICKER = ['10M+ Riders Protected','Rs. 4.2L Paid Out Today','98,203 Active Policies','2 Min Average Payout Time','99.2% Claim Approval Rate','Zero Manual Claims Filed'];

// ─── How it works panels ──────────────────────────────────────────────────────
const PANELS = [
  {
    accent: '#3b82f6',
    title: 'Zone Registered',
    dotClass: 'bg-blue-500',
    borderClass: 'border-blue-500/25',
    barClass: 'bg-blue-500',
    circleActive: 'bg-blue-600 border-blue-500 text-white shadow-[0_0_14px_rgba(59,130,246,0.4)]',
    content: (
      <div className="space-y-2.5 text-sm">
        {[['Zone Name','Noida Sector 18 ✓'],['UPI ID','rahul@upi ✓'],['Plan','Standard — Rs. 79/week']].map(([k,v]) => (
          <div key={k} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/5">
            <span className="text-zinc-500">{k}</span>
            <span className={`font-medium ${k === 'Plan' ? 'text-orange-400' : 'text-white'}`}>{v}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    accent: '#f97316',
    title: 'Live Alert — Noida',
    dotClass: 'bg-orange-500',
    borderClass: 'border-orange-500/25',
    barClass: 'bg-orange-500',
    circleActive: 'bg-orange-600 border-orange-500 text-white shadow-[0_0_14px_rgba(249,115,22,0.4)]',
    content: (
      <div className="space-y-4 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-500">Disruption Type</span>
          <span className="text-white font-semibold">Heavy Rain</span>
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-zinc-500">AI Severity</span>
            <span className="text-orange-400 font-bold">0.8 / 1.0</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2">
            <div className="bg-orange-500 h-full rounded-full w-4/5" />
          </div>
        </div>
        <div className="flex justify-between bg-orange-500/10 rounded-xl px-4 py-3 border border-orange-500/20">
          <span className="text-zinc-400 text-xs font-medium">Riders Affected</span>
          <span className="text-white font-bold text-lg">47</span>
        </div>
      </div>
    ),
  },
  {
    accent: '#22c55e',
    title: 'Payout Complete',
    dotClass: 'bg-green-500',
    borderClass: 'border-green-500/25',
    barClass: 'bg-green-500',
    circleActive: 'bg-green-600 border-green-500 text-white shadow-[0_0_14px_rgba(34,197,94,0.4)]',
    content: (
      <div className="space-y-4 text-sm">
        <div className="text-center py-1">
          <p className="text-4xl font-extrabold text-white font-headline">Rs. 245</p>
          <p className="text-zinc-600 text-xs mt-1">credited to UPI wallet</p>
        </div>
        {[['To','rahul@upi'],['Time taken','47 seconds']].map(([k,v]) => (
          <div key={k} className="flex justify-between bg-white/5 rounded-xl px-4 py-2.5 border border-white/5">
            <span className="text-zinc-500">{k}</span>
            <span className="text-white font-medium">{v}</span>
          </div>
        ))}
        <div className="flex items-center justify-center gap-2 text-green-400 text-sm font-semibold pt-1">
          <Check className="w-4 h-4" /> Transfer Successful
        </div>
      </div>
    ),
  },
];

// ─── Auth Modal — 3-screen flow ───────────────────────────────────────────────
function AuthModal({ onClose }) {
  const navigate = useNavigate();
  // screen: 'select' | 'rider' | 'company'
  const [screen, setScreen] = useState('select');
  const [tab, setTab]           = useState('signin');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');

  const handleCompanySubmit = () => {
    onClose();
    navigate('/admin/login');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl shadow-2xl mx-4 overflow-hidden"
        style={{ maxHeight: '92vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors z-10">
          <X className="w-5 h-5" />
        </button>

        {/* ── SCREEN 1: Who are you? ── */}
        {screen === 'select' && (
          <div className="p-8">
            <div className="mb-7">
              <p className="text-xs uppercase tracking-widest text-orange-500 font-bold mb-2">Welcome</p>
              <h2 className="text-2xl font-extrabold text-white mb-1" style={{ fontFamily:'Plus Jakarta Sans,sans-serif' }}>
                Who are you?
              </h2>
              <p className="text-sm text-zinc-500">Select your role to continue.</p>
            </div>

            <div className="space-y-3">
              {/* Rider option */}
              <button
                onClick={() => setScreen('rider')}
                className="w-full group flex items-start gap-4 p-5 bg-white/4 border border-white/8 rounded-2xl hover:bg-white/7 hover:border-orange-500/30 transition-all text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center shrink-0 mt-0.5">
                  <Bike className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">I'm a Delivery Rider</p>
                  <p className="text-zinc-500 text-xs mt-1">Register for income protection during disruptions.</p>
                </div>
                <span className="ml-auto text-zinc-600 group-hover:text-white transition-colors text-lg self-center">›</span>
              </button>

              {/* Admin/Company option */}
              <button
                onClick={() => setScreen('company')}
                className="w-full group flex items-start gap-4 p-5 bg-white/4 border border-white/8 rounded-2xl hover:bg-white/7 hover:border-orange-500/30 transition-all text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center shrink-0 mt-0.5">
                  <Building2 className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">I'm a Company / RiderShield Admin</p>
                  <p className="text-zinc-500 text-xs mt-1">Manage your fleet, claims, and policies.</p>
                </div>
                <span className="ml-auto text-zinc-600 group-hover:text-white transition-colors text-lg self-center">›</span>
              </button>
            </div>

            <p className="text-center text-xs text-zinc-700 mt-6">
              Confused?{' '}
              <Link to="/docs" onClick={onClose} className="text-zinc-500 hover:text-white underline transition-colors">
                Head to our Docs →
              </Link>
            </p>
          </div>
        )}

        {/* ── SCREEN 2a: Rider — app info ── */}
        {screen === 'rider' && (
          <div className="p-8">
            <button onClick={() => setScreen('select')} className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-white transition-colors mb-6">
              <span>←</span> Back
            </button>
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-orange-500 font-bold mb-2">For Riders</p>
              <h2 className="text-2xl font-extrabold text-white mb-2" style={{ fontFamily:'Plus Jakarta Sans,sans-serif' }}>
                Get the RiderShield App
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Rider registration and onboarding happens through the <strong className="text-white">RiderShield mobile app</strong>.
                Scan the QR below or ask your delivery partner company to enrol you.
              </p>
            </div>

            {/* QR Code placeholder */}
            <div className="flex justify-center mb-6">
              <div className="w-36 h-36 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <p className="text-black text-xs font-bold">QR Code</p>
                  <p className="text-zinc-500 text-[10px]">App Download</p>
                  <div className="mt-2 grid grid-cols-5 gap-0.5">
                    {Array(25).fill(0).map((_, i) => (
                      <div key={i} className={`w-4 h-4 rounded-sm ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* App store badges */}
            <div className="flex gap-3 mb-6">
              <div className="flex-1 flex items-center justify-center gap-2.5 bg-white/5 border border-white/8 rounded-xl py-3 px-4">
                <Smartphone className="w-4 h-4 text-zinc-400" />
                <div>
                  <p className="text-[10px] text-zinc-600 leading-none">GET IT ON</p>
                  <p className="text-white text-sm font-bold">Google Play</p>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center gap-2.5 bg-white/5 border border-white/8 rounded-xl py-3 px-4">
                <Monitor className="w-4 h-4 text-zinc-400" />
                <div>
                  <p className="text-[10px] text-zinc-600 leading-none">DOWNLOAD ON THE</p>
                  <p className="text-white text-sm font-bold">App Store</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-500/8 border border-orange-500/15 rounded-xl px-4 py-3">
              <p className="text-xs text-zinc-400">
                <span className="text-orange-400 font-semibold">Already enrolled?</span>{' '}
                Open the app and sign in with the phone number your company registered.
              </p>
            </div>
          </div>
        )}

        {/* ── SCREEN 2b: Company/Admin ── */}
        {screen === 'company' && (
          <div className="p-8">
            <button onClick={() => setScreen('select')} className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-white transition-colors mb-6">
              <span>←</span> Back
            </button>

            <p className="text-xs uppercase tracking-widest text-orange-500 font-bold mb-2">Admin Portal</p>
            <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily:'Plus Jakarta Sans,sans-serif' }}>
              RiderShield Admin Login
            </h2>
            <p className="text-sm text-zinc-500 mb-8">
              Access the control center, claims, and analytics dashboard.
            </p>

            {/* Info cards */}
            <div className="space-y-3 mb-8">
              {[
                ['Control Center',  'Trigger disruptions, monitor weather, manage zones.'],
                ['Claims & Payouts','Review, approve, and audit all worker claims.'],
                ['Fraud Detection', 'AI-powered GPS spoofing and duplicate claim detection.'],
              ].map(([title, desc]) => (
                <div key={title} className="flex gap-3 bg-white/4 border border-white/8 rounded-xl px-4 py-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-white text-sm font-semibold">{title}</p>
                    <p className="text-zinc-600 text-xs mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleCompanySubmit}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
            >
              Go to Admin Login →
            </button>

            <p className="text-center text-xs text-zinc-700 mt-4">
              Restricted to authorized RiderShield personnel only.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}


// ─── Testimonial card (reusable for scroll columns) ──────────────────────────
function TestiCard({ t }) {
  return (
    <div className="bg-[#111] border border-white/8 rounded-2xl p-5 shrink-0">
      <div className="text-3xl leading-none text-zinc-800 font-serif mb-2 select-none">&ldquo;</div>
      <p className="text-zinc-300 text-sm leading-relaxed mb-4">{t.text}</p>
      <div className="flex items-center gap-3 pt-3 border-t border-white/5">
        <div className="w-8 h-8 rounded-full bg-zinc-800 shrink-0 flex items-center justify-center text-xs font-bold text-zinc-400">
          {t.name.charAt(0)}
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{t.name}</p>
          <p className="text-[11px] text-zinc-600">{t.handle}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for navbar's Get Started event
  useEffect(() => {
    const handler = () => setShowModal(true);
    window.addEventListener('openAuthModal', handler);
    return () => window.removeEventListener('openAuthModal', handler);
  }, []);

  // How it works auto-step
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress]     = useState(0);
  useEffect(() => {
    setProgress(0);
    const DURATION = 3000;
    const start = Date.now();
    let rafId;
    const tick = () => {
      const pct = Math.min(((Date.now() - start) / DURATION) * 100, 100);
      setProgress(pct);
      if (pct < 100) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    const tid = setTimeout(() => setActiveStep(s => (s + 1) % 3), DURATION);
    return () => { cancelAnimationFrame(rafId); clearTimeout(tid); };
  }, [activeStep]);

  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.remove('opacity-0','translate-y-8');
          e.target.classList.add('opacity-100','translate-y-0');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.scroll-animate').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const panel = PANELS[activeStep];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-400 font-sans selection:bg-orange-500 selection:text-white flex flex-col">


      {showModal && <AuthModal onClose={() => setShowModal(false)} />}

      <style>{`
        html { scroll-behavior: smooth; }

        @keyframes float1  { 0%,100%{ transform:translateY(0) }     50%{ transform:translateY(-10px) } }
        @keyframes float2  { 0%,100%{ transform:translateY(0) }     50%{ transform:translateY(-14px) } }
        @keyframes float3  { 0%,100%{ transform:translateY(-6px) }  50%{ transform:translateY(6px) }   }
        @keyframes float4  { 0%,100%{ transform:translateY(-4px) }  50%{ transform:translateY(10px) }  }
        @keyframes float5  { 0%,100%{ transform:translateY(0) }     50%{ transform:translateY(-8px) }   }
        @keyframes float6  { 0%,100%{ transform:translateY(-8px) }  50%{ transform:translateY(4px) }   }
        @keyframes float7  { 0%,100%{ transform:translateY(-5px) }  50%{ transform:translateY(9px) }   }
        @keyframes float8  { 0%,100%{ transform:translateY(3px) }   50%{ transform:translateY(-11px) } }
        @keyframes float9  { 0%,100%{ transform:translateY(-3px) }  50%{ transform:translateY(7px) }   }
        @keyframes float10 { 0%,100%{ transform:translateY(5px) }   50%{ transform:translateY(-9px) }  }
        @keyframes float11 { 0%,100%{ transform:translateY(-7px) }  50%{ transform:translateY(5px) }   }
        @keyframes float12 { 0%,100%{ transform:translateY(0) }     50%{ transform:translateY(-12px) } }

        @keyframes slideIn    { from{ opacity:0; transform:translateX(40px) }  to{ opacity:1;    transform:translateX(0) } }
        @keyframes slideInMid { from{ opacity:0; transform:translateX(28px) }  to{ opacity:1;    transform:translateX(0) } }
        @keyframes slideInBg  { from{ opacity:0; transform:translateX(18px) }  to{ opacity:1;    transform:translateX(0) } }

        /* Foreground — full opacity via parent wrapper */
        .card-f1  { animation: slideIn    .50s ease .00s forwards, float1  3.2s ease-in-out .50s infinite; opacity:0; }
        .card-f2  { animation: slideIn    .50s ease .15s forwards, float2  3.8s ease-in-out .65s infinite; opacity:0; }
        .card-f3  { animation: slideIn    .50s ease .30s forwards, float3  4.1s ease-in-out .80s infinite; opacity:0; }
        .card-f4  { animation: slideIn    .50s ease .45s forwards, float4  3.5s ease-in-out .95s infinite; opacity:0; }
        .card-f5  { animation: slideIn    .50s ease .60s forwards, float5  3.9s ease-in-out 1.10s infinite; opacity:0; }
        .card-f6  { animation: slideIn    .50s ease .75s forwards, float6  4.4s ease-in-out 1.25s infinite; opacity:0; }
        /* Mid layer */
        .card-m1  { animation: slideInMid .55s ease 1.00s forwards, float7  5.0s ease-in-out 1.55s infinite; opacity:0; }
        .card-m2  { animation: slideInMid .55s ease 1.15s forwards, float8  5.6s ease-in-out 1.70s infinite; opacity:0; }
        .card-m3  { animation: slideInMid .55s ease 1.30s forwards, float9  4.8s ease-in-out 1.85s infinite; opacity:0; }
        /* Back layer */
        .card-b1  { animation: slideInBg  .60s ease 1.60s forwards, float10 6.2s ease-in-out 2.20s infinite; opacity:0; }
        .card-b2  { animation: slideInBg  .60s ease 1.80s forwards, float11 5.8s ease-in-out 2.40s infinite; opacity:0; }
        .card-b3  { animation: slideInBg  .60s ease 2.00s forwards, float12 6.6s ease-in-out 2.60s infinite; opacity:0; }

        @keyframes marquee    { from{ transform:translateX(0) }  to{ transform:translateX(-50%) } }
        .marquee-track { display:flex; width:max-content; animation:marquee 22s linear infinite; }

        @keyframes colUp   { from{ transform:translateY(0) }    to{ transform:translateY(-50%) } }
        @keyframes colDown { from{ transform:translateY(-50%) } to{ transform:translateY(0) }    }
        .col-up-1  { animation: colUp   26s linear infinite; }
        .col-up-2  { animation: colUp   22s linear infinite; }
        .col-down  { animation: colDown 29s linear infinite; }

        @keyframes drawLine { from{ height:0 } to{ height:100% } }
        .line-draw { animation: drawLine 1.2s ease forwards .4s; }
      `}</style>

      {/* ══════════════════════════ HERO ════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{ backgroundImage:`url(${heroBg})`, backgroundSize:'cover', backgroundPosition:'center top' }}
      >
        <div className="absolute inset-0 bg-black/72" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage:'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize:'28px 28px' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-20 w-full grid lg:grid-cols-2 gap-12 items-center">

          {/* Left */}
          <div className="space-y-7">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/12 bg-white/5 text-sm font-medium">
              <span className="text-zinc-400">Backed by</span>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-orange-500 text-white font-black text-xs">U</span>
              <span className="text-zinc-400">sers</span>
            </div>

            <h1 className="text-5xl lg:text-[68px] leading-[1.08] font-headline font-extrabold text-white tracking-tight">
              When The City Stops You,<br />
              We Make Sure Your<br />
              <span className="text-orange-500">Income Doesn&apos;t</span>
            </h1>

            <p className="text-base max-w-md leading-relaxed text-zinc-300">
              Zero-touch parametric insurance for delivery partners. Disruption detected. Threshold crossed. Money in UPI. All automatic. No forms. No waiting.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-1 border-t border-white/8 pt-5">
              {[['10M+','Gig Workers'],['Rs. 0','Manual Claims'],['2 Min','Avg Payout']].map(([v,l]) => (
                <div key={l}>
                  <p className="text-3xl font-headline font-bold text-white">{v}</p>
                  <p className="text-xs uppercase tracking-wider mt-1 font-medium text-zinc-500">{l}</p>
                </div>
              ))}
            </div>

            {/* Single CTA */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setShowModal(true)}
                className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors shadow-[0_0_24px_rgba(249,115,22,0.3)]"
              >
                Get Started
              </button>
              <Link
                to="/docs"
                className="border border-white/20 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/8 transition-colors text-sm"
              >
                Read the Docs
              </Link>
            </div>
          </div>

          {/* Right: 3-layer 3D floating cards */}
          <div className="hidden lg:block relative" style={{ height: '600px' }}>

            {/* ── BACK LAYER: scale 0.82, opacity 0.16, blur 1px (z-5) ── */}
            {[
              { Icon: CloudRain,    iconCls:'text-zinc-700', title:'AI Processing',   body:'Checking rainfall — 42mm/hr', meta:'Below threshold',           pos:{ top:'3%',  left:'28%' }, cls:'card-b1' },
              { Icon: ShieldCheck,  iconCls:'text-zinc-700', title:'Zone Status',      body:'Delhi NCR — nominal',          meta:'All sensors active',        pos:{ top:'36%', right:'22%'}, cls:'card-b2' },
              { Icon: UserCheck,    iconCls:'text-zinc-700', title:'Policy Sync',      body:'1,247 records synced',         meta:'Last sync: 2 min ago',      pos:{ top:'70%', left:'20%' }, cls:'card-b3' },
            ].map(({ Icon, iconCls, title, body, meta, pos, cls }, i) => (
              <div key={`b${i}`} className="absolute z-[5]" style={{ ...pos, opacity: 0.16, transform: 'scale(0.82)', transformOrigin: 'center', filter: 'blur(0.8px)' }}>
                <div className={`w-[210px] bg-black/60 rounded-2xl border border-white/5 p-4 ${cls}`}>
                  <div className="flex items-start gap-3">
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconCls}`} />
                    <div>
                      <h4 className="text-zinc-600 font-semibold text-sm leading-tight">{title}</h4>
                      <p className="text-xs mt-1 text-zinc-800">{body}</p>
                      <p className="text-[11px] text-zinc-800 mt-1.5">{meta}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* ── MID LAYER: scale 0.91, opacity 0.35, no blur (z-10) ── */}
            {[
              { Icon: AlertTriangle, iconCls:'text-zinc-500', title:'Threshold Watch',  body:'Rain at 42mm — below limit',   meta:'Monitoring active',          pos:{ top:'16%', left:'12%' }, cls:'card-m1' },
              { Icon: Banknote,      iconCls:'text-zinc-500', title:'Queue Processing', body:'3 payouts pending',             meta:'Est. dispatch in 40 sec',    pos:{ top:'48%', right:'14%'}, cls:'card-m2' },
              { Icon: TrendingUp,    iconCls:'text-zinc-500', title:'Rider Activity',   body:'892 active riders online',      meta:'Noida + Delhi NCR',          pos:{ top:'76%', right:'6%' }, cls:'card-m3' },
            ].map(({ Icon, iconCls, title, body, meta, pos, cls }, i) => (
              <div key={`m${i}`} className="absolute z-[10]" style={{ ...pos, opacity: 0.35, transform: 'scale(0.91)', transformOrigin: 'center' }}>
                <div className={`w-[215px] bg-black/65 rounded-2xl border border-white/7 p-4 ${cls}`}>
                  <div className="flex items-start gap-3">
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconCls}`} />
                    <div>
                      <h4 className="text-zinc-400 font-semibold text-sm leading-tight">{title}</h4>
                      <p className="text-xs mt-1 text-zinc-600">{body}</p>
                      <p className="text-[11px] text-zinc-700 mt-1.5">{meta}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* ── FRONT LAYER: full opacity, z-20 ── */}
            {[
              { card: HERO_CARDS[0], pos: { top: '0%',  left:  '0%'  }, cls: 'card-f1' },
              { card: HERO_CARDS[1], pos: { top: '8%',  right: '0%'  }, cls: 'card-f2' },
              { card: HERO_CARDS[2], pos: { top: '30%', left:  '6%'  }, cls: 'card-f3' },
              { card: HERO_CARDS[3], pos: { top: '38%', right: '4%'  }, cls: 'card-f4' },
              { card: HERO_CARDS[4], pos: { top: '64%', left:  '2%'  }, cls: 'card-f5' },
              { card: HERO_CARDS[5], pos: { top: '73%', right: '2%'  }, cls: 'card-f6' },
            ].map(({ card, pos, cls }, i) => (
              <div key={`f${i}`} className="absolute z-20" style={pos}>
                <div className={`w-[220px] bg-black/80 backdrop-blur rounded-2xl border border-white/10 border-l-4 ${card.border} p-4 shadow-2xl ${cls}`}>
                  <div className="flex items-start gap-3">
                    <card.Icon className={`w-4 h-4 mt-0.5 shrink-0 ${card.iconColor}`} />
                    <div>
                      <h4 className="text-white font-semibold text-sm leading-tight">{card.title}</h4>
                      <p className="text-xs mt-1 text-zinc-400">{card.body}</p>
                      <p className="text-[11px] text-zinc-600 mt-1.5">{card.meta}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* ══════════════════════ STATS TICKER ════════════════════════════════ */}
      <div className="w-full bg-white/4 border-y border-white/6 py-4 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
        <div className="marquee-track gap-14">
          {[0,1].map(r => (
            <div key={r} className="flex items-center gap-14 shrink-0 mr-14">
              {TICKER.map(item => (
                <span key={item} className="flex items-center gap-2.5 text-sm text-white/50 font-medium shrink-0">
                  <span className="w-1 h-1 rounded-full bg-orange-500 shrink-0" />
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════ HOW IT WORKS ════════════════════════════════ */}
      <section id="how-it-works" className="py-28 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-20 items-start">

          <div className="scroll-animate opacity-0 translate-y-8 transition-all duration-700">
            <h2 className="text-3xl lg:text-5xl font-extrabold font-headline text-white mb-14">How It Works</h2>
            <div className="relative">
              <div className="absolute left-[21px] top-11 h-[calc(100%-3rem)] w-px bg-white/5 overflow-hidden rounded-full">
                <div
                  className="w-full bg-gradient-to-b from-orange-500 to-orange-400 rounded-full"
                  style={{
                    height: `${Math.min(activeStep * 50 + progress * 0.5, 100)}%`,
                    transition: 'height 0.1s linear',
                    boxShadow: '0 0 6px rgba(249,115,22,0.5)',
                  }}
                />
              </div>
              <div className="space-y-12">
                {[
                  { n:1, t:'Register Your Zone',             d:'Sign up once. Enter your delivery zone and UPI ID. No app linking needed. No tracking.' },
                  { n:2, t:'AI Monitors Your Zone 24/7',     d:'Our AI watches weather, AQI, floods and curfews across your zone. No check-ins required.' },
                  { n:3, t:'Disruption Hits. Money Arrives.',d:'Zone threshold crossed. Every registered rider in that zone gets paid instantly. Zero claims.' },
                ].map((step, i) => {
                  const isActive = activeStep === i;
                  const isDone   = activeStep > i;
                  return (
                    <div key={step.n} className="relative flex gap-7">
                      <div className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center font-bold font-headline z-10 border-2 transition-all duration-500
                        ${isActive ? PANELS[i].circleActive : isDone ? 'bg-zinc-900 border-zinc-700 text-zinc-500' : 'bg-[#111] border-zinc-800 text-zinc-700'}`}>
                        {isDone ? <Check className="w-4 h-4" /> : step.n}
                      </div>
                      <div className="pt-2">
                        <h3 className={`text-lg font-bold font-headline mb-1.5 transition-colors duration-500 ${isActive ? 'text-white' : 'text-zinc-600'}`}>{step.t}</h3>
                        <p className={`text-sm leading-relaxed transition-colors duration-500 ${isActive ? 'text-zinc-400' : 'text-zinc-700'}`}>{step.d}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Staircase rolodex panel — all 3 visible, active in center */}
          <div className="scroll-animate opacity-0 translate-y-8 transition-all duration-700 delay-200 lg:pt-20">
            <div className="relative h-[420px] overflow-hidden">
              {/* Top fade mask — softer so adjacent card is more visible */}
              <div className="absolute top-0 inset-x-0 h-14 bg-gradient-to-b from-[#0a0a0a] to-transparent z-30 pointer-events-none" />
              {/* Bottom fade mask */}
              <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-[#0a0a0a] to-transparent z-30 pointer-events-none" />

              {PANELS.map((p, i) => {
                // signed offset: -1 = prev, 0 = active, +1 = next
                let off = i - activeStep;
                if (off > 1)  off -= 3;
                if (off < -1) off += 3;
                const cfg = {
                  '-1': { top:'18%', scale:0.92, opacity:0.58, z:10 },
                   '0': { top:'50%', scale:1.00, opacity:1.00,  z:20 },
                   '1': { top:'82%', scale:0.92, opacity:0.58,  z:10 },
                }[String(off)];
                if (!cfg) return null;
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute', left:0, right:0,
                      top: cfg.top,
                      transform: `translateY(-50%) scale(${cfg.scale})`,
                      opacity: cfg.opacity,
                      zIndex: cfg.z,
                      transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
                    }}
                  >
                    <div className={`rounded-2xl border ${p.borderClass} bg-[#0f0f0f] px-7 py-5 shadow-2xl relative overflow-hidden`}>
                      <div className={`absolute top-0 left-0 w-full h-0.5 ${p.barClass}`} />
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                        <h4 className="text-white font-bold text-sm flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${p.dotClass} ${off === 0 ? 'animate-pulse' : ''}`} />
                          {p.title}
                        </h4>
                        <span className="text-[10px] uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full text-zinc-600">Step {i+1}/3</span>
                      </div>
                      {p.content}
                      {off === 0 && (
                        <div className="mt-4 w-full bg-white/5 rounded-full h-0.5 overflow-hidden">
                          <div className={`h-full ${p.barClass} rounded-full`} style={{ width:`${progress}%`, transition:'width 0.1s linear' }} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════ COVERAGE MATRIX ═════════════════════════════ */}
      <section id="features" className="py-24 bg-[#080808] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14 scroll-animate opacity-0 translate-y-8 transition-all duration-700">
            <h2 className="text-3xl lg:text-5xl font-extrabold font-headline text-white mb-3">Coverage Matrix</h2>
            <p className="max-w-xl mx-auto text-sm">Six disruption types. Each with a hard AI threshold. Payouts execute in under 2 minutes.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COVERAGE.map((cov, i) => (
              <div
                key={i}
                className="group bg-[#0f0f0f] border border-white/8 rounded-2xl p-6 hover:bg-[#141414] hover:border-white/12 transition-all duration-300 scroll-animate opacity-0 translate-y-8"
                style={{ transitionDelay:`${i*70}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <cov.Icon className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                  <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/15 px-2.5 py-0.5 rounded-full">
                    {cov.threshold}
                  </span>
                </div>

                <h3 className="text-white text-base font-bold font-headline mb-4">{cov.title}</h3>

                {/* Data rows */}
                <div className="space-y-2 border-t border-white/5 pt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-600">Payout range</span>
                    <span className="text-zinc-200 font-medium">{cov.payoutRange}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-600">Transfer time</span>
                    <span className="text-zinc-200 font-medium">{cov.avgTime}</span>
                  </div>
                </div>

                {/* Pill tags */}
                <div className="flex gap-2 mt-4 flex-wrap">
                  {cov.pills.map(p => (
                    <span key={p} className="text-[10px] font-medium text-zinc-400 bg-white/5 border border-white/8 px-2.5 py-1 rounded-full">{p}</span>
                  ))}
                </div>

                {/* Footer stat */}
                <p className="mt-4 pt-3 border-t border-white/5 text-[11px] text-zinc-700">{cov.stat}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ PLANS ════════════════════════════════════════ */}
      <section id="plans" className="py-32 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-20 scroll-animate opacity-0 translate-y-8 transition-all duration-700">
          <h2 className="text-3xl lg:text-5xl font-extrabold font-headline text-white mb-3">Shield Plans</h2>
          <p className="max-w-xl mx-auto text-sm">Flat weekly rates. Zero deductibles. No paperwork. Cancel anytime.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {[
            {
              tier: 'Basic',
              label: 'Starter',
              price: 'Rs. 49',
              highlighted: false,
              features: ['Rain coverage','6 hrs coverage per day','Rs. 500 max weekly payout','UPI instant payout'],
              locked: ['Priority processing','Flood + Curfew coverage'],
              pills: ['Rain'],
            },
            {
              tier: 'Standard',
              label: 'Most Popular',
              price: 'Rs. 79',
              highlighted: true,
              features: ['Rain + Heat + AQI coverage','8 hrs coverage per day','Rs. 900 max weekly payout','UPI instant payout','Priority processing'],
              locked: ['Flood + Curfew coverage'],
              pills: ['Rain','Heat','AQI'],
            },
            {
              tier: 'Premium',
              label: 'Full Coverage',
              price: 'Rs. 119',
              highlighted: false,
              features: ['Full coverage matrix','12 hrs coverage per day','Rs. 1500 max weekly payout','UPI instant payout','Priority processing','Flood + Curfew + Wind'],
              locked: [],
              pills: ['All 6 types'],
            },
          ].map((plan, i) => (
            <div
              key={plan.tier}
              className={`flex flex-col rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1.5 scroll-animate opacity-0 translate-y-8
                ${plan.highlighted
                  ? 'bg-[#160e00] border-2 border-orange-500/50 shadow-[0_0_40px_rgba(249,115,22,0.1)]'
                  : 'bg-[#111] border border-white/8'}`}
              style={{ transitionDelay:`${i*100}ms` }}
            >
              {/* Tier label */}
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${plan.highlighted ? 'text-orange-500/70' : 'text-zinc-600'}`}>
                  {plan.label}
                </span>
                {/* Coverage pills like TUF reference */}
                <div className="flex gap-1">
                  {plan.pills.map(p => (
                    <span key={p} className={`text-[10px] font-medium px-2 py-0.5 rounded-full border
                      ${plan.highlighted ? 'bg-orange-500/15 border-orange-500/25 text-orange-400' : 'bg-white/5 border-white/8 text-zinc-400'}`}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <h3 className={`text-xl font-bold font-headline mt-2 ${plan.highlighted ? 'text-orange-400' : 'text-white'}`}>{plan.tier}</h3>

              <div className="flex items-baseline gap-1 mt-4 mb-1">
                <span className="text-4xl font-extrabold text-white font-headline">{plan.price}</span>
                <span className="text-zinc-500 text-sm">/week</span>
              </div>
              <p className="text-xs text-zinc-600 mb-5">Billed weekly. Cancel anytime.</p>

              <hr className={`mb-5 ${plan.highlighted ? 'border-orange-500/15' : 'border-white/6'}`} />

              {/* Features */}
              <ul className="space-y-3 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <Check className={`w-4 h-4 shrink-0 ${plan.highlighted ? 'text-orange-400' : 'text-zinc-400'}`} />
                    <span className="text-zinc-200">{f}</span>
                  </li>
                ))}
                {plan.locked.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm opacity-35">
                    <Check className="w-4 h-4 shrink-0 text-zinc-700" />
                    <span className="text-zinc-600 line-through">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA — matches TUF "Start Roadmap" style */}
              <button
                onClick={() => setShowModal(true)}
                className={`mt-7 w-full py-3 rounded-xl font-bold text-sm transition-colors
                  ${plan.highlighted
                    ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-[0_4px_16px_rgba(249,115,22,0.25)]'
                    : 'bg-white text-black hover:bg-zinc-100'}`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════ TESTIMONIALS — 3-col infinite scroll ══════════════ */}
      <section className="py-24 bg-[#080808] border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14 scroll-animate opacity-0 translate-y-8 transition-all duration-700">
            <h2 className="text-3xl lg:text-5xl font-extrabold font-headline text-white mb-3">What Riders Are Saying</h2>
          </div>

          {/* 3 columns: left scrolls up, middle scrolls down, right scrolls up */}
          <div className="relative h-[520px] overflow-hidden">
            {/* Top + bottom fade masks */}
            <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-[#080808] to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[#080808] to-transparent z-10 pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">

              {/* Left col — scrolls UP */}
              <div className="overflow-hidden">
                <div className="col-up-1 flex flex-col gap-4">
                  {[...TESTIMONIALS.slice(0,2), ...TESTIMONIALS.slice(0,2)].map((t, i) => (
                    <TestiCard key={`l${i}`} t={t} />
                  ))}
                </div>
              </div>

              {/* Middle col — scrolls DOWN */}
              <div className="overflow-hidden">
                <div className="col-down flex flex-col gap-4">
                  {[...TESTIMONIALS.slice(2,4), ...TESTIMONIALS.slice(2,4)].map((t, i) => (
                    <TestiCard key={`m${i}`} t={t} />
                  ))}
                </div>
              </div>

              {/* Right col — scrolls UP (different speed) */}
              <div className="overflow-hidden">
                <div className="col-up-2 flex flex-col gap-4">
                  {[...TESTIMONIALS.slice(4,6), ...TESTIMONIALS.slice(4,6)].map((t, i) => (
                    <TestiCard key={`r${i}`} t={t} />
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ FOOTER ══════════════════════════════════════ */}
      <footer className="bg-black pt-12 pb-10 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          {/* Have questions strip — integrated top of footer */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-10 mb-10 border-b border-white/6">
            <div>
              <h3 className="text-white font-bold text-lg mb-1" style={{ fontFamily:'Plus Jakarta Sans,sans-serif' }}>
                Have questions?
              </h3>
              <p className="text-zinc-500 text-sm">
                Everything about plans, payouts, zones, and APIs — all in one place.
              </p>
            </div>
            <Link
              to="/docs"
              className="shrink-0 flex items-center gap-2 bg-white/5 border border-white/10 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              <span className="text-orange-500 font-mono text-xs">{'>'}_</span>
              Head to our Docs
            </Link>
          </div>

          {/* Main footer grid */}
          <div className="grid md:grid-cols-4 gap-12 mb-10">
            <div className="space-y-3">
              <Link to="/" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }} className="inline-block">
                <span className="text-white font-bold text-2xl">RIDER</span>
                <span className="text-orange-500 font-bold text-2xl">SHIELD</span>
              </Link>
              <p className="text-sm leading-relaxed text-zinc-600">Zero-touch income protection for India's delivery workforce.</p>
            </div>
            {[
              { title:'Platform', links:[['How It Works','#how-it-works'],['Features','#features'],['Pricing','#plans'],['Docs','/docs']] },
              { title:'Legal',    links:[['Privacy Policy','/docs'],['Terms of Service','/docs'],['Contact','mailto:campusdiaries2024@gmail.com']] },
              { title:'Connect',  links:[['GitHub','#'],['Twitter','#'],['LinkedIn','#']] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-white font-semibold mb-4 text-sm">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      {href.startsWith('/') ? (
                        <Link to={href} className="text-sm text-zinc-600 hover:text-white transition-colors">{label}</Link>
                      ) : (
                        <a href={href} className="text-sm text-zinc-600 hover:text-white transition-colors">{label}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-white/6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-700">
            <p>&copy; 2026 RiderShield. All rights reserved.</p>
            <p>Built for Guidewire DEVTrails.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
