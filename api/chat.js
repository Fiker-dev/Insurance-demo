// /api/chat.js
import OpenAI from "openai";

// If you add billing later, keep OPENAI_API_KEY in Vercel env.
// Optional: set MOCK_MODE=1 in Vercel env to force mock replies.
const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

function generateMockReply(message = "") {
  const m = message.toLowerCase();

  if (m.includes("renewal") && (m.includes("subject") || m.includes("email"))) {
    return [
      "Quick Reminder: Renew Today",
      "Your Policy Renewal — Stay Covered",
      "Friendly Nudge: Renew in Minutes"
    ].join("\n");
  }

  if (m.includes("renewal") && (m.includes("summary") || m.includes("due"))) {
    return [
      "Renewals due this week: 6",
      "- Sarah N. — Life R500k — due 22 Oct",
      "- Thabo K. — Auto — due 23 Oct",
      "- Ayesha P. — Home — due 24 Oct",
      "- Johan S. — Auto — due 25 Oct",
      "- Zanele M. — Life R1m — due 25 Oct",
      "- Pierre L. — Home — due 26 Oct",
      "Recommended next step: send follow-ups to all un-contacted and schedule 2 reminder SMSes for due-in-48h."
    ].join("\n");
  }

  if (m.includes("quote") || m.includes("premium")) {
    return "To create a quick quote, I need: name, age, smoker (Y/N), policy type (Life/Auto/Home), cover amount, and target renewal date. Example: 'Quote Sarah N, 34, non-smoker, Life R500k, renew 2026-05-01'.";
  }

  if (m.includes("claim")) {
    return "To file a claim: (1) collect client full name + policy #, (2) incident date & brief description, (3) attach photos if relevant. I can draft the claim email and log it to the pipeline.";
  }

  if (m.includes("sms") || m.includes("whatsapp")) {
    return "SMS template: 'Hi {first_name}, it’s {broker}. Your policy renewal is due on {date}. Reply YES to proceed or ask me anything. – Luli Digital'";
  }

  if (m.includes("meeting") || m.includes("calendar")) {
    return "I can draft a meeting invite with agenda, or generate a follow-up note. Provide date/time and attendees and I’ll produce the calendar text.";
  }

  // generic helpful default
  return "I can help with renewals, quotes, claim steps, follow-up templates, and quick client summaries. Try: 'Summarize renewals due this week' or 'Write 3 subject lines for a renewal follow-up'.";
}

function mockResponse(message) {
  return { reply: generateMockReply(message), mode: "mock" };
}

function isMockMode(req) {
  // Enable mock if:
  //  - Vercel env MOCK_MODE=1, or
  //  - no OPENAI_API_KEY, or
  //  - body.mock === true (manual override while testing)
  const body = req._parsedBody || {};
  return (
    process.env.MOCK_MODE === "1" ||
    !client ||
    body.mock === true
  );
}

function parseBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === "object") {
      req._parsedBody = req.body;
      return resolve(req.body);
    }
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try {
        const parsed = data ? JSON.parse(data) : {};
        req._parsedBody = parsed;
        resolve(parsed);
      } catch {
        resolve({});
      }
    });
  });
}

export default async function handler(req, res) {
  // --- CORS ---
  res.setHeader("Access-Control-Allow-Origin", "*"); // when you go live: set to https://insurancedemo.lulidigital.com
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    return res
      .status(200)
      .json({ message: "✅ Assistant API online", mode: client ? "live" : "mock" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = await parseBody(req);
    const { message = "", context = "", history = [], mock = undefined } = body;

    if (!message) return res.status(400).json({ error: "Missing 'message' in body" });

    // Mock mode always available
    if (isMockMode(req)) {
      return res.status(200).json(mockResponse(message));
    }

    // Live mode (requires API key + billing)
    const messages = [
      { role: "system", content: "You are an insurance admin assistant. Be concise, factual, and action-oriented." },
      { role: "system", content: `Business context: ${context || "N/A"}` },
      ...history,
      { role: "user", content: message }
    ];

    try {
      const out = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.2
      });
      return res.status(200).json({ reply: out.choices[0].message.content, mode: "live" });
    } catch (e) {
      const status = e?.status || e?.response?.status || 500;
      // Graceful fallback on quota or temporary issues
      if (status === 429 || status === 401) {
        return res.status(200).json(mockResponse(message));
      }
      console.error("live call error:", status, e?.message);
      return res.status(500).json({ error: "server_error", detail: e?.message || "Unknown" });
    }
  } catch (e) {
    console.error("handler error:", e);
    return res.status(500).json({ error: "server_error", detail: e?.message || "Unknown" });
  }
}
