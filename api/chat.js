
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Ensure it only runs on POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Missing message in request body" });
    }

    // Send the message to GPT
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // lightweight model, great for small demos
      messages: [
        { role: "system", content: "You are an assistant helping with insurance data entry and client management." },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0].message.content;
    return res.status(200).json({ reply });

  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
}
