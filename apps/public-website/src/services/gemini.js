const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const MODEL_NAME = "gemini-1.5-flash";

/**
 * Calls the Gemini API with RiderShield context
 * @param {string} prompt - User message
 * @param {string} lang - 'en' or 'hi'
 * @param {object} knowledge - The BOT_KNOWLEDGE object for context
 */
export async function getGeminiResponse(prompt, lang, knowledge) {
  try {
    const kb = JSON.stringify(knowledge[lang]);
    
    const systemInstruction = `
      You are the "RiderShield Guardian", a helpful and direct AI assistant for delivery riders (Zomato, Swiggy, etc.).
      
      CORE KNOWLEDGE: ${kb}
      
      GUIDELINES:
      - Language: Respond in ${lang === 'en' ? 'English' : 'Hindi'}.
      - Persona: Friendly, supportive, and 100% focused on the rider's welfare. 
      - Key Rules:
        * Pricing: Rs. 49 (Basic), Rs. 79 (Standard), Rs. 119 (Premium) / week.
        * Claims: No paperwork. 100% automatic UPI payouts within 2 minutes.
        * Tone: Avoid jargon. If a rider asks "How to get money?", they mean claiming insurance.
      - Keep responses short and easy to read on a mobile phone. Use bullet points.
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemInstruction}\n\nUser Question: ${prompt}` }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300,
        }
      })
    });

    const data = await response.json();
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("No useful Gemini API response");
    }
    return data.candidates[0].content.parts[0].text;
  } catch (err) {
    console.error("Gemini Error:", err);
    throw new Error("Failed connecting to Gemini");
  }
}
