export const config = { runtime: 'edge' };

const SYSTEM_PROMPT = `You are a friendly assistant for Wheelie Good Wheels, a peer-to-peer car rental business in Florida that lists vehicles on Turo. 
Answer questions about renting cars, our fleet (Tesla Model Y 2024 and Hyundai Santa Fe Sport 2017), pricing, pickup locations (Tampa Bay area), and the booking process.
Keep answers short, helpful, and friendly. If asked about something you don't know, suggest they contact us via the contact form or visit Turo. 
Do NOT make up specific prices — tell them to check Turo for current rates. Always be upbeat and professional.`;

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { message, history = [] } = await req.json();

  if (!message) {
    return new Response(JSON.stringify({ error: 'No message provided' }), { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API not configured' }), { status: 500 });
  }

  const contents = [
    ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
    { role: 'user', parts: [{ text: message }] }
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents
      })
    }
  );

  const data = await res.json();
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't get a response. Please try again!";

  return new Response(JSON.stringify({ reply }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
