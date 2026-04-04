import React, { createContext, useState, useContext, useEffect } from 'react';

const translations = {
  en: {
    nav_home: "Home",
    nav_dashboard: "Admin Dashboard",
    nav_claims: "Claims",
    nav_analytics: "Analytics",
    nav_login: "Log in",
    nav_signup: "Sign up",
    hero_title: "AI-Powered Insurance for Gig Workers",
    hero_sub: "Immediate income protection during floods, heatwaves, and riots. When disruptions hit, RiderShield calculates and deploys automatic safety payouts to workers on the ground.",
    btn_worker: "I am a Worker",
    btn_admin: "I am Admin →",
    prob_solution: "The Problem & Solution",
    prob_title: "Protecting the world's most vulnerable workforce",
    prob_header: "The Problem",
    prob_desc: "When extreme weather or political unrest paralyzes a city, gig delivery workers lose their ability to earn immediately. They have zero income protection, yet shoulder all the financial risk.",
    sol_header: "The Solution",
    sol_desc: "RiderShield constantly analyzes zone risks. The absolute microsecond a disruption crosses severity thresholds, our AI triggers instant, algorithmic payouts to impacted workers, bridging the safety net gap.",
    for_workers: "For Workers",
    worker_flow_1: "Disruption Hits",
    worker_flow_2: "AI Detects Severity",
    worker_flow_3: "Instant Payout",
    for_admins: "For Admins & Insurers",
    admin_mon: "Monitor Global Disruptions",
    admin_claim: "Automated Claim Settlement",
    admin_risk: "Real-time Risk Insights",
    worker_welcome: "Welcome back,",
    worker_trust: "Trust Score",
    worker_zone: "Current Zone",
    worker_alert: "RiderShield Alert",
    worker_detected: "detected.",
    worker_credited: "credited automatically to your wallet.",
    worker_bal: "Wallet Balance",
    worker_jobs: "Pending Jobs",
    zone_disrupted: "Disrupted",
    zone_clear: "Clear"
  },
  hi: {
    nav_home: "होम",
    nav_dashboard: "एडमिन डैशबोर्ड",
    nav_claims: "दावे (Claims)",
    nav_analytics: "एनालिटिक्स",
    nav_login: "लॉग इन",
    nav_signup: "साइन अप",
    hero_title: "गिग वर्कर्स के लिए AI-संचालित बीमा",
    hero_sub: "बाढ़, हीटवेव और दंगों के दौरान तत्काल आय सुरक्षा। जब बाधाएं आती हैं, तो KavachAI स्वचालित रूप से जमीन पर काम करने वाले श्रमिकों को सुरक्षा भुगतान की गणना और तैनाती करता है।",
    btn_worker: "मैं एक वर्कर हूँ",
    btn_admin: "मैं एडमिन हूँ →",
    prob_solution: "समस्या और समाधान",
    prob_title: "दुनिया के सबसे असुरक्षित कार्यबल की रक्षा करना",
    prob_header: "समस्या",
    prob_desc: "जब अत्यधिक मौसम या राजनीतिक अशांति किसी शहर को पंगु बना देती है, तो गिग डिलीवरी वर्कर तुरंत कमाने की क्षमता खो देते हैं। उनके पास शून्य आय सुरक्षा है, फिर भी सारा वित्तीय जोखिम उन पर है।",
    sol_header: "समाधान",
    sol_desc: "RiderShield लगातार ज़ोन जोखिमों का विश्लेषण करता है। जैसे ही कोई बाधा गंभीरता सीमा को पार करती है, हमारा AI प्रभावित श्रमिकों को तत्काल, एल्गोरिथम भुगतान शुरू करता है।",
    for_workers: "वर्कर्स के लिए",
    worker_flow_1: "बाधा आती है",
    worker_flow_2: "AI गंभीरता का पता लगाता है",
    worker_flow_3: "तत्काल भुगतान",
    for_admins: "एडमिन और बीमाकर्ताओं के लिए",
    admin_mon: "वैश्विक बाधाओं की निगरानी करें",
    admin_claim: "स्वचालित दावा निपटान",
    admin_risk: "वास्तविक समय जोखिम अंतर्दृष्टि",
    worker_welcome: "वापसी पर स्वागत है,",
    worker_trust: "ट्रस्ट स्कोर",
    worker_zone: "वर्तमान ज़ोन",
    worker_alert: "RiderShield अलर्ट",
    worker_detected: "पता चला।",
    worker_credited: "आपके वॉलेट में स्वचालित रूप से जमा हो गया।",
    worker_bal: "वॉलेट बैलेंस",
    worker_jobs: "लंबित नौकरियां",
    zone_disrupted: "बाधित",
    zone_clear: "सुरक्षित"
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('ridershield_lang');
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
    localStorage.setItem('ridershield_lang', newLang);
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
