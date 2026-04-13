import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, BookOpen, Download, Zap, UserCheck,
  Banknote, Star, ShieldCheck, Lock, HelpCircle
} from 'lucide-react';

// ─── All searchable doc sections ──────────────────────────────────────────────
const ALL_SECTIONS = [
  { id: 'WhatIsRiderShield', label: 'What is RiderShield?',  category: 'Getting Started',     Icon: BookOpen,    keywords: ['introduction','about','what','parametric','overview','income','protection'] },
  { id: 'DownloadApp',       label: 'Download the App',      category: 'Getting Started',     Icon: Download,    keywords: ['download','install','android','play store','apk','app'] },
  { id: 'HowItWorks',        label: 'How It Works',          category: 'Getting Started',     Icon: Zap,         keywords: ['flow','process','automatic','how','steps','pipeline','works'] },
  { id: 'Registration',      label: 'Registration Guide',    category: 'Setup & Registration',Icon: UserCheck,   keywords: ['register','signup','aadhaar','kyc','onboard','pan','verify'] },
  { id: 'UPISetup',          label: 'UPI & Payments',        category: 'Setup & Registration',Icon: Banknote,    keywords: ['upi','payment','premium','deduction','payout','gpay','phonepe','paytm'] },
  { id: 'ChoosePlan',        label: 'Choose a Plan',         category: 'Setup & Registration',Icon: Star,        keywords: ['plan','basic','standard','premium','price','tier','49','79','119','weekly'] },
  { id: 'WhatsCovered',      label: "What's Covered",        category: 'Coverage & Payouts',  Icon: ShieldCheck, keywords: ['coverage','covered','rain','heat','flood','aqi','smog','curfew','disruption','wind'] },
  { id: 'HowPayoutsWork',    label: 'How Payouts Work',      category: 'Coverage & Payouts',  Icon: Banknote,    keywords: ['payout','calculation','formula','amount','upi','money','credited','rs'] },
  { id: 'SafetyMode',        label: 'Safety Mode',           category: 'Coverage & Payouts',  Icon: Lock,        keywords: ['safety','curfew','strike','activate','manual','trust','score'] },
  { id: 'FAQ',               label: 'FAQs',                  category: 'Help & FAQs',         Icon: HelpCircle,  keywords: ['faq','questions','help','common','answers','query'] },
  { id: 'ContactSupport',    label: 'Contact Support',       category: 'Help & FAQs',         Icon: HelpCircle,  keywords: ['contact','support','help','dispute','whatsapp','email','chat'] },
];

export default function SearchModal({ onClose }) {
  const [query,    setQuery]    = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Auto-focus
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Filter
  const results = query.trim()
    ? ALL_SECTIONS.filter(s =>
        s.label.toLowerCase().includes(query.toLowerCase()) ||
        s.category.toLowerCase().includes(query.toLowerCase()) ||
        s.keywords.some(k => k.includes(query.toLowerCase()))
      )
    : ALL_SECTIONS;

  // Reset selection on new query
  useEffect(() => { setSelected(0); }, [query]);

  const go = (section) => {
    navigate(`/docs?section=${section.id}`);
    onClose();
  };

  // Keyboard nav
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape')    { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
      if (e.key === 'Enter' && results[selected]) go(results[selected]);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [results, selected]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Palette */}
      <div
        className="fixed top-24 left-1/2 -translate-x-1/2 z-[201] w-full max-w-xl mx-4"
        style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}
      >
        <div className="bg-[#111] border border-white/12 rounded-2xl shadow-2xl overflow-hidden">

          {/* Input row */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/8">
            <Search className="w-4 h-4 text-zinc-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search documentation..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder-zinc-600"
            />
            <kbd className="text-[10px] text-zinc-600 bg-white/5 border border-white/8 px-1.5 py-0.5 rounded font-mono">ESC</kbd>
          </div>

          {/* Results list */}
          <div className="max-h-80 overflow-y-auto py-1.5">
            {results.length === 0 ? (
              <p className="text-zinc-600 text-sm text-center py-8">No results for "{query}"</p>
            ) : (
              results.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => go(s)}
                  onMouseEnter={() => setSelected(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    selected === i ? 'bg-orange-500/10' : 'hover:bg-white/4'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    selected === i ? 'bg-orange-500/15 border border-orange-500/25' : 'bg-white/5 border border-white/8'
                  }`}>
                    <s.Icon className={`w-3.5 h-3.5 ${selected === i ? 'text-orange-400' : 'text-zinc-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${selected === i ? 'text-orange-400' : 'text-white'}`}>
                      {s.label}
                    </p>
                    <p className="text-[11px] text-zinc-600 mt-0.5">{s.category}</p>
                  </div>
                  {selected === i && (
                    <kbd className="text-[10px] text-zinc-600 bg-white/5 border border-white/8 px-1.5 py-0.5 rounded font-mono shrink-0">↵</kbd>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer hints */}
          <div className="border-t border-white/6 px-4 py-2 flex items-center gap-5">
            {[['↑↓','navigate'],['↵','select'],['ESC','close']].map(([key, label]) => (
              <span key={key} className="flex items-center gap-1.5 text-[10px] text-zinc-700">
                <kbd className="bg-white/5 border border-white/8 rounded px-1.5 py-0.5 font-mono">{key}</kbd>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
