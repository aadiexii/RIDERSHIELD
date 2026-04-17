export const BOT_KNOWLEDGE = {
  en: {
    greetings: ["Hello! I am your RiderShield Assistant. How can I help you today?", "Hi there! Need help with payouts or insurance? Ask me anything!", "Welcome to RiderShield Support. I speak English and Hindi."],
    categories: [
      { id: 'payouts', label: 'Payouts & Claims' },
      { id: 'plans', label: 'Insurance Plans' },
      { id: 'aa', label: 'Bank (AA) Verification' },
      { id: 'safety', label: 'Safety Mode' }
    ],
    faqs: [
      {
        keywords: ['payout', 'money', 'time', 'fast'],
        question: "How fast do I get paid?",
        answer: "Payouts are instant! Once our AI detects a disruption (like heavy rain or heatwave) in your zone, the money is sent to your UPI account within 2 minutes."
      },
      {
        keywords: ['claim', 'form', 'apply'],
        question: "How do I file a claim?",
        answer: "You don't need to file anything. RiderShield is 'Zero-Touch'. We monitor the weather and AQI 24/7. If you are active in a disrupted zone, we pay you automatically."
      },
      {
        keywords: ['plan', 'cost', 'premium', 'price'],
        question: "What are the insurance plans?",
        answer: "We have 3 plans: Basic (Rs. 49/week), Standard (Rs. 79/week), and Premium (Rs. 119/week). Premium covers all 6 disruption types including strikes and curfews."
      },
      {
        keywords: ['aa', 'bank', 'verification', 'link'],
        question: "Why do I need to link my bank?",
        answer: "We use Account Aggregator (AA) to verify that you are an active gig worker based on your Zomato/Swiggy deposits. This helps us calculate your income baseline and suggest the right plan."
      },
      {
        keywords: ['safety', 'manual', 'verify'],
        question: "What is Safety Mode?",
        answer: "Safety Mode is for disruptions that our sensors might miss (like a local market closure). You can activate it in the app, and our group-verification logic will check if other riders are also stuck before approving your claim."
      }
    ],
    fallback: "I'm not sure about that. Would you like to talk about Payouts, Plans, or how to get started?"
  },
  hi: {
    greetings: ["नमस्ते! मैं आपका राइडरशील्ड सहायक हूँ। मैं आज आपकी कैसे मदद कर सकता हूँ?", "नमस्ते! क्या आपको भुगतान या बीमा में मदद चाहिए? मुझसे कुछ भी पूछें!", "राइडरशील्ड सपोर्ट में आपका स्वागत है। मैं अंग्रेजी और हिंदी बोलता हूँ।"],
    categories: [
      { id: 'payouts', label: 'भुगतान और दावे' },
      { id: 'plans', label: 'बीमा योजनाएं' },
      { id: 'aa', label: 'बैंक (AA) सत्यापन' },
      { id: 'safety', label: 'सेफ्टी मोड' }
    ],
    faqs: [
      {
        keywords: ['भुगतान', 'पैसा', 'समय', 'तेज'],
        question: "मुझे भुगतान कितनी तेजी से मिलता है?",
        answer: "भुगतान तत्काल है! जैसे ही हमारा AI आपके क्षेत्र में किसी रुकावट (जैसे भारी बारिश या लू) का पता लगाता है, पैसा 2 मिनट के भीतर आपके UPI खाते में भेज दिया जाता है।"
      },
      {
        keywords: ['दावा', 'फॉर्म', 'आवेदन'],
        question: "मैं दावा कैसे करूँ?",
        answer: "आपको कुछ भी भरने की आवश्यकता नहीं है। राइडरशील्ड 'जीरो-टच' है। हम 24/7 मौसम और AQI की निगरानी करते हैं। यदि आप प्रभावित क्षेत्र में सक्रिय हैं, तो हम आपको स्वचालित रूप से भुगतान करते हैं।"
      },
      {
        keywords: ['योजना', 'लागत', 'प्रीमियम', 'कीमत'],
        question: "बीमा योजनाएं क्या हैं?",
        answer: "हमारे पास 3 योजनाएं हैं: बेसिक (49 रुपये/सप्ताह), स्टैंडर्ड (79 रुपये/सप्ताह), और प्रीमियम (119 रुपये/सप्ताह)। प्रीमियम में हड़ताल और कर्फ्यू सहित सभी 6 प्रकार की रुकावटें शामिल हैं।"
      },
      {
        keywords: ['एए', 'बैंक', 'सत्यापन', 'लिंक'],
        question: "मुझे अपना बैंक लिंक करने की आवश्यकता क्यों है?",
        answer: "हम यह सत्यापित करने के लिए अकाउंट एग्रीगेटर (AA) का उपयोग करते हैं कि आप अपने ज़ोमैटो/स्विगी जमा के आधार पर एक सक्रिय गिग वर्कर हैं। इससे हमें आपकी आय के आधार की गणना करने और सही योजना का सुझाव देने में मदद मिलती है।"
      },
      {
        keywords: ['सुरक्षा', 'मैनुअल', 'सत्यापन', 'सेफ्टी'],
        question: "सेफ्टी मोड क्या है?",
        answer: "सेफ्टी मोड उन रुकावटों के लिए है जिन्हें हमारे सेंसर शायद पकड़ न पाएं (जैसे स्थानीय बाजार बंद होना)। आप इसे ऐप में सक्रिय कर सकते हैं, और हमारा ग्रुप-वेरिफिकेशन लॉजिक दावे को मंजूरी देने से पहले यह जांच करेगा कि क्या अन्य राइडर्स भी फंसे हुए हैं।"
      }
    ],
    fallback: "मुझे उस बारे में यकीन नहीं है। क्या आप भुगतान, योजनाओं, या शुरुआत कैसे करें के बारे में बात करना चाहेंगे?"
  }
};
