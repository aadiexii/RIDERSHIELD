import React, { useState, useEffect, useRef } from 'react';
import { X, Globe, Minus, AlertCircle, Mic, ArrowUp } from 'lucide-react';
import { BOT_KNOWLEDGE } from '../data/bot-knowledge';
import { getGeminiResponse } from '../services/gemini';
import chatbotImg from '../assets/chatbot.png';

export default function AIBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState('en');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);

  const k = BOT_KNOWLEDGE[lang];

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ 
        role: 'bot', 
        text: "Hi there! Need help with payouts or insurance? Ask me anything!", 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    }
  }, [lang]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const toggleLang = () => {
    const nextLang = lang === 'en' ? 'hi' : 'en';
    setLang(nextLang);
    setMessages([{ 
      role: 'bot', 
      text: BOT_KNOWLEDGE[nextLang].greetings[0] || "Hi there!", 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }]);
  };

  const handleSend = async (e, text = inputText, displayLabel = null) => {
    if (e) e.preventDefault(); 
    const msg = text.trim();
    if (!msg) return;

    setError(null);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [...prev, { role: 'user', text: displayLabel || msg, timestamp: time }]);
    setInputText('');
    setIsTyping(true);

    try {
      const aiResponse = await getGeminiResponse(msg, lang, BOT_KNOWLEDGE);
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: aiResponse, 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } catch (err) {
      try {
        const fallback = findKeywordAnswer(msg);
        setMessages(prev => [...prev, { 
          role: 'bot', 
          text: fallback, 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }]);
      } catch (innerErr) {
        setError("I didn't quite get that. Try asking about payouts, claims, or plans!");
      }
    } finally {
      setIsTyping(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError(lang === 'hi' ? "आपका ब्राउज़र वॉइस टाइपिंग को सपोर्ट नहीं करता है।" : "Your browser does not support voice input.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      setInputText(transcript);
    };

    recognition.onerror = (e) => {
      console.error("Speech error", e.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
      setError(null);
    } catch (err) {
      console.error(err);
    }
  };

  const findKeywordAnswer = (query) => {
    const q = query.toLowerCase();
    for (const faq of k.faqs) {
      if (faq.keywords.some(kw => q.includes(kw.toLowerCase()))) return faq.answer;
    }
    return k.fallback;
  };

  const quickActions = lang === 'hi' ? [
    { label: "भुगतान और दावे", query: "payouts and claims" },
    { label: "बीमा योजनाएं", query: "insurance plans" },
    { label: "बैंक सत्यापन", query: "bank verification" }
  ] : [
    { label: "Payouts & Claims", query: "payouts" },
    { label: "Insurance Plans", query: "insurance plans" },
    { label: "Bank Verification", query: "bank verification" }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none flex flex-col items-end gap-3 pb-safe">
      
      {/* ── Chat Window (Expanded State) ─────────────────────────────── */}
      {isOpen && (
        <div className="w-[320px] max-w-[calc(100vw-3rem)] h-[380px] max-h-[calc(100vh-140px)] bg-[#09090b] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-auto origin-bottom-right">
          
          {/* Header */}
          <div className="bg-[#09090b]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-white/10 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center border border-white/10 overflow-hidden">
                <img src={chatbotImg} alt="Logo" className="w-6 h-6 object-contain" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-zinc-100 font-semibold text-[14px] leading-tight flex items-center gap-1.5">
                  Assistant
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                </h3>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleLang}
                className="px-2 py-0.5 text-[11px] font-bold text-zinc-400 bg-zinc-900 hover:text-orange-400 hover:bg-zinc-800 rounded-md transition-colors uppercase border border-transparent hover:border-orange-500/30"
              >
                {lang === 'en' ? 'HI' : 'EN'}
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-7 h-7 bg-zinc-900 hover:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors border border-white/5"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-5 bg-[#09090b]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
                <div className={`max-w-[85%] flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-3.5 py-2.5 text-[14px] leading-snug shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-orange-500 text-white rounded-[18px] rounded-tr-[4px]' 
                      : 'bg-zinc-900 text-zinc-200 rounded-[18px] rounded-tl-[4px] border border-white/10'
                  }`}>
                    {m.text}
                  </div>
                  {m.timestamp && <span className="text-[10px] text-zinc-500 mt-1 px-1 font-medium">{m.timestamp}</span>}
                </div>
              </div>
            ))}
            
            {/* Quick Actions */}
            {messages.length === 1 && !isTyping && (
                <div className="flex flex-col gap-2 mt-1">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => handleSend(e, action.query, action.label.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '').trim())}
                      className="self-start px-3.5 py-1.5 bg-zinc-900 border border-white/10 rounded-full text-[13px] text-zinc-300 hover:bg-zinc-800 hover:border-orange-500/50 hover:text-orange-400 transition-all font-medium text-left shadow-sm"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-zinc-900 border border-white/10 rounded-[18px] rounded-tl-[4px] px-4 py-3.5 flex gap-1.5 items-center shadow-sm">
                  <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-center p-2">
                <div className="bg-red-500/10 text-red-400 text-[12px] px-3 py-2 rounded-lg border border-red-500/20 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> {error}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Input Area */}
          <form className="p-3 bg-[#09090b] border-t border-white/10 z-10" onSubmit={handleSend}>
            <div className="flex items-center bg-zinc-900 border border-white/10 rounded-[24px] focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500/50 transition-all group px-1 py-1">
              
              <button 
                type="button" 
                onClick={toggleListening}
                className={`p-2 transition-colors ml-1 ${isListening ? 'text-red-500 animate-pulse' : 'text-zinc-500 hover:text-orange-400'}`}
                title={isListening ? "Stop listening" : "Start speaking"}
              >
                 <Mic className="w-4 h-4" />
              </button>

              <input
                type="text"
                placeholder={lang === 'hi' ? "संदेश..." : "Message..."}
                className="flex-1 bg-transparent border-none text-zinc-100 text-[14px] focus:outline-none placeholder:text-zinc-600 px-2 py-1.5"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              
              <button 
                type="submit"
                className="w-8 h-8 bg-orange-500 rounded-full text-white hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:grayscale disabled:active:scale-100 shadow-sm"
                disabled={!inputText.trim() || isTyping}
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Chat Widget Button (Collapsed State) ───────────────────────── */}
      <div className="relative pointer-events-auto group flex items-center gap-3">
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-[64px] h-[64px] flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
        >
          {/* Main Logo */}
          <img src={chatbotImg} alt="RiderShield AI" className="w-[95%] h-[95%] object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.2)]" />
          
          {/* Minimal Online Dot */}
          <span className="absolute top-2 right-2 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-[1.5px] border-white"></span>
          </span>
        </button>
      </div>
      
    </div>
  );
}
