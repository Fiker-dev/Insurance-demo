// /api/chat.js
import OpenAI from "openai";

// ---- CONFIG ----
const inMock = process.env.MOCK_MODE === "1";
const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Small helper to parse raw JSON if a platform doesn't pre-parse body
function parseBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === "object") return resolve(req.body);
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try { resolve(JSON.parse(data || "{}")); } catch { resolve({}); }
    });
  });
}

function mockAnswer(message = "") {
  const t = (message || "").toLowerCase();
  if (t.includes("renewal")) {
    return "Upcoming renewals:\n• Sarah Ndlovu — 22 Oct — Life R500k\n• Thabo Khumalo — 23 Oct — Auto\n• Ayesha Patel — 25 Oct — Home R1.2m";
  }
  if (t.includes("subject")) {
    return "Quick Reminder: Renew Today\nYour Policy Renewal — Stay Covered\nFriendly Nudge: Renew in Minutes";
  }
  if (t.startsWith("log note") || t.startsWith("add note")) {
    return "Noted. I’ll remind you during the daily summary.";
  }
  return "I’m in demo mode. Try: “summarize renewals this week” or “3 renewal subject lines”.";
}

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*"); // tighten later to your domain
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Health check shows mode
  if (req.method === "GET") {
    return res.status(200).json({
      status: "ok",
      mode: inMock ? "mock" : (client ? "live" : "mock"),
      message: inMock ? "Mock mode active." : "API ready for GPT.",
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = await parseBody(req);
    const { message = "", mock = false } = body;

    // Force mock either by env or per-request flag
    if (inMock || mock || !client) {
      return res.status(200).json({ reply: mockAnswer(message), mode: "mock" });
    }

    // LIVE call
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are Gina, a helpful insurance admin assistant." },
        { role: "user", content: message }
      ],
      temperature: 0.2
    });

    return res.status(200).json({
      reply: completion.choices[0].message.content,
      mode: "live"
    });
  } catch (e) {
    // Graceful fallback to mock
    return res.status(200).json({ reply: mockAnswer(), mode: "mock", detail: e?.message });
  }
}
