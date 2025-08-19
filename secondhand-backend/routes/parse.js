import express from "express";
import OpenAI from "openai";

const router = express.Router();

// Initialize OpenAI client with your API key (set in ECS environment variables)
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log("OpenAI key loaded:", process.env.OPENAI_API_KEY ? "Yes" : "No");

router.post("/", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // fast + cheap
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that extracts product listings from casual chat messages. Respond ONLY in valid JSON with fields: description (string), price (number or null), styleTags (array of strings).",
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0,
      max_tokens: 150,
    });

    let parsed;
    try {
      parsed = JSON.parse(response.choices[0].message.content);
    } catch (err) {
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

    res.json(parsed);
  } catch (err) {
    console.error("Error calling OpenAI:", err);
    res.status(500).json({ error: "AI service error" });
  }
});

export default router;
