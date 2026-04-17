import { Check, Star, Zap, ShieldCheck, BarChart3, Mail, ExternalLink } from 'lucide-react';

const TIERS = [
  {
    name: 'Bronze Sponsor',
    price: 'Rs. 5,000',
    period: '/month',
    highlight: false,
    border: 'border-amber-700/30',
    bg: 'bg-amber-900/5',
    badgeColor: 'text-amber-600 bg-amber-600/10 border-amber-600/20',
    Icon: Star,
    perks: [
      'Logo on RiderShield public website',
      'Listed on sponsor page',
      'Mention in release notes',
      'Direct contact with founding team',
    ],
  },
  {
    name: 'Silver Sponsor',
    price: 'Rs. 15,000',
    period: '/month',
    highlight: true,
    border: 'border-orange-500/40',
    bg: 'bg-orange-500/4',
    badgeColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    Icon: Zap,
    perks: [
      'Everything in Bronze',
      'Featured logo on docs page header',
      'Priority feature request channel',
      'Pilot program placement for your fleet',
      'Quarterly impact report',
    ],
    tag: 'Most Popular',
  },
  {
    name: 'Gold Sponsor',
    price: 'Rs. 40,000',
    period: '/month',
    highlight: false,
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/3',
    badgeColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    Icon: ShieldCheck,
    perks: [
      'Everything in Silver',
      'Co-branding on worker app splash screen',
      'Dedicated API access for fleet management',
      'Whitepaper co-authorship',
      'Early access to new features',
      'Founding sponsor badge (permanent)',
    ],
  },
];

const REASONS = [
  {
    Icon: BarChart3,
    title: '10M+ Gig Workers',
    desc: 'India has over 10 million gig delivery workers with zero income protection during disruptions. Your sponsorship directly funds their safety net.',
  },
  {
    Icon: Zap,
    title: 'Zero-Touch Tech',
    desc: 'RiderShield runs fully automatic — no human review, no claims, no waiting. Sponsoring us funds the infrastructure that makes this possible.',
  },
  {
    Icon: ShieldCheck,
    title: 'Social Impact',
    desc: 'Every rupee goes toward protecting the people who keep India\'s food delivery and commerce running during floods, heatwaves, and smog.',
  },
];

export default function SponsorPage() {
  return (
    <div
      className="min-h-screen bg-[#0a0a0a] text-zinc-400"
      style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}
    >
      <div className="max-w-5xl mx-auto px-6 lg:px-8 pt-10 pb-20">

        {/* ── Hero ── */}
        <div className="text-center mb-20">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-orange-500/25 bg-orange-500/8 text-orange-400 text-xs font-bold uppercase tracking-widest mb-6">
            ❤ Support RiderShield
          </span>
          <h1 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight mb-4"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Sponsor<br />
            <span className="text-orange-500">RiderShield</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Help us protect over 10 million gig delivery workers from income loss.
            Your sponsorship funds the infrastructure that puts money in their UPI during floods,
            heatwaves, and city-wide disruptions.
          </p>
        </div>

        {/* ── Why sponsor ── */}
        <div className="grid md:grid-cols-3 gap-5 mb-20">
          {REASONS.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="bg-[#111] border border-white/8 rounded-2xl p-6 hover:border-white/14 transition-colors"
            >
              <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-white font-bold text-base mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* ── Tier heading ── */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Sponsorship Tiers
          </h2>
          <p className="text-zinc-500 text-sm">All tiers include a public acknowledgement and direct contact with the founding team.</p>
        </div>

        {/* ── Tiers ── */}
        <div className="grid md:grid-cols-3 gap-5 mb-20">
          {TIERS.map(({ name, price, period, highlight, border, bg, badgeColor, Icon, perks, tag }) => (
            <div
              key={name}
              className={`relative ${bg} border ${border} rounded-2xl p-7 flex flex-col ${
                highlight ? 'shadow-[0_0_40px_rgba(249,115,22,0.08)]' : ''
              }`}
            >
              {tag && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/25 px-3 py-1 rounded-full whitespace-nowrap">
                  {tag}
                </span>
              )}

              <div className={`inline-flex items-center gap-1.5 self-start text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border mb-4 ${badgeColor}`}>
                <Icon className="w-3 h-3" />{name}
              </div>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-extrabold text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{price}</span>
                <span className="text-zinc-500 text-sm">{period}</span>
              </div>
              <p className="text-zinc-600 text-xs mb-6">Billed monthly. Cancel anytime.</p>

              <ul className="space-y-2 flex-1 mb-7">
                {perks.map(p => (
                  <li key={p} className="flex items-start gap-2 text-xs text-zinc-400">
                    <Check className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />{p}
                  </li>
                ))}
              </ul>

              <a
                href="mailto:sponsor@ridershield.in"
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                  highlight
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-white/6 border border-white/10 hover:bg-white/10 text-white'
                }`}
              >
                <Mail className="w-4 h-4" />
                Apply as Sponsor
              </a>
            </div>
          ))}
        </div>

        {/* ── Custom / enterprise ── */}
        <div className="bg-[#111] border border-white/8 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-white font-bold text-lg mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Enterprise / Custom Partnership
            </h3>
            <p className="text-zinc-500 text-sm max-w-lg">
              Zomato, Swiggy, Blinkit — if you want to enrol your entire fleet under RiderShield
              with custom SLAs, dedicated infrastructure, and co-branding, let's talk directly.
            </p>
          </div>
          <a
            href="mailto:campusdiaries2024@gmail.com"
            className="shrink-0 flex items-center gap-2 px-6 py-3 bg-white/6 border border-white/12 rounded-xl text-sm font-semibold text-white hover:bg-white/10 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Contact Us
          </a>
        </div>

        {/* ── Footer note ── */}
        <p className="text-center text-xs text-zinc-700 mt-12">
          RiderShield is currently in active development. Sponsor funds go directly toward API costs, backend infrastructure, and worker onboarding.
        </p>
      </div>
    </div>
  );
}
