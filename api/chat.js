import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  // --- CORS ---
  res.setHeader("Access-Control-Allow-Origin", "*"); // later: set to https://insurancedemo.lulidigital.com
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end(); // preflight OK

  // Simple GET check
  if (req.method === "GET") {
    return res.status(200).json({ message: "✅ API ready for GPT" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let body = req.body || {};
    if (typeof body === "string") body = JSON.parse(body);
    const { message = "" } = body;

    if (!message) return res.status(400).json({ error: "Missing 'message' in body" });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an insurance admin assistant. Be concise and action-oriented." },
        { role: "user", content: message }
      ],
      temperature: 0.2
    });

    return res.status(200).json({ reply: completion.choices[0].message.content });
  } catch (e) {
    console.error("chat error:", e);
    return res.status(500).json({ error: "Server error", detail: e.message });
  }
}
