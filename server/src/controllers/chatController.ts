import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import knowledgeBase from "../../data/knowledgeBase.json";

interface KnowledgeChunk {
  id: string;
  title: string;
  content: string;
}

// ── Explicit In-Memory Keyword Matcher ─────────────────────────────────────
function getRelevantContext(query: string): string {
  const normalizedQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const queryTokens = normalizedQuery.split(/\s+/).filter((t) => t.length > 2);

  // Score each chunk based on token matches in title and content
  const scoredChunks = (knowledgeBase as KnowledgeChunk[]).map((chunk) => {
    let score = 0;
    const titleLower = chunk.title.toLowerCase();
    const contentLower = chunk.content.toLowerCase();

    queryTokens.forEach((token) => {
      if (titleLower.includes(token)) score += 3; // Heavy weight for title match
      if (contentLower.includes(token)) score += 1; // Weight for content match
    });

    return { ...chunk, score };
  });

  // Sort by highest score
  scoredChunks.sort((a, b) => b.score - a.score);

  // If top chunk has score > 0, return top 2-3 matched chunks
  const topMatches = scoredChunks.filter((c) => c.score > 0).slice(0, 3);

  if (topMatches.length === 0) {
    // Fallback: If no direct token match, pass entire knowledgeBase (under 1KB total!)
    return (knowledgeBase as KnowledgeChunk[])
      .map((c) => `${c.title}: ${c.content}`)
      .join("\n\n");
  }

  return topMatches.map((c) => `${c.title}: ${c.content}`).join("\n\n");
}

// ── POST /api/chat Controller ──────────────────────────────────────────────
export async function chatHandler(req: Request, res: Response) {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message string is required." });
    }

    const context = getRelevantContext(message);
    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback if no Gemini API key configured
    if (!apiKey) {
      const firstLine = context.split("\n\n")[0] || "No context available.";
      return res.json({
        reply: firstLine,
        contextUsed: true,
      });
    }

    const systemPrompt = `You are EduCap's AI Assistant. Answer the user's question concisely (2-3 sentences max) using ONLY the context provided below.

Context:
${context}

User Question: ${message}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 250,
        temperature: 0.2,
      },
    });

    const result = await Promise.race([
      model.generateContent(systemPrompt),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("LLM_TIMEOUT")), 8000)
      ),
    ]);

    const replyText = result.response.text().trim();

    return res.json({
      reply: replyText || "I don't have that information in my guide.",
      contextUsed: true,
    });
  } catch (err) {
    console.error("[ragChat] Chat controller error:", (err as Error).message);
    return res.json({
      reply: "I don't have that information in my guide.",
      contextUsed: false,
    });
  }
}
