import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  // CORS for your Pages site
  res.setHeader("Access-Control-Allow-Origin", "*"); // replace * with https://insurancedemo.lulidigital.com once tested
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    return res.status(200).json({ message: "✅ API ready for GPT" });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST {message, context?, history?}" });
  }

  try {
    let body = req.body || {};
    if (typeof body === "string") body = JSON.parse(body);
    const { message = "", context = "", history = [] } = body;

    const messages = [
      { role: "system", content: "You are an insurance admin assistant. Be concise and action-oriented." },
      { role: "system", content: `Business context: ${context || "N/A"}` },
      ...history,
      { role: "user", content: message }
    ];

    const out = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.2
    });

    return res.status(200).json({ reply: out.choices[0].message.content });
  } catch (e) {
    console.error("chat error:", e);
    return res.status(500).json({ error: "Server error", detail: e.message });
  }
}
