import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import knowledgeBase from "../../data/knowledgeBase.json";

interface KnowledgeChunk {
  id: string;
  title: string;
  content: string;
}

// ── Explicit In-Memory Keyword Matcher ─────────────────────────────────────
function getRelevantContext(query: string): { context: string; topMatch?: KnowledgeChunk } {
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
    const allContext = (knowledgeBase as KnowledgeChunk[])
      .map((c) => `${c.title}: ${c.content}`)
      .join("\n\n");
    return { context: allContext, topMatch: (knowledgeBase as KnowledgeChunk[])[0] };
  }

  const context = topMatches.map((c) => `${c.title}: ${c.content}`).join("\n\n");
  return { context, topMatch: topMatches[0] };
}

// ── POST /api/chat Controller ──────────────────────────────────────────────
export async function chatHandler(req: Request, res: Response) {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message string is required." });
    }

    const { context, topMatch } = getRelevantContext(message);
    const apiKey = process.env.GEMINI_API_KEY;

    // Direct fallback if GEMINI_API_KEY is not configured on production/Render
    if (!apiKey) {
      console.warn("[ragChat] GEMINI_API_KEY is missing, returning rule-based context match.");
      const fallbackReply = topMatch
        ? `${topMatch.content}`
        : "I don't have that information in my guide.";
      return res.json({
        reply: fallbackReply,
        contextUsed: true,
      });
    }

    const systemPrompt = `You are EduCap's AI Assistant. Answer the user's question concisely in 2-3 sentences based on the provided context below.

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

    const rawText = result.response.text().trim();
    const replyText =
      !rawText || rawText.toLowerCase().includes("don't have that information")
        ? topMatch?.content || "I don't have that information in my guide."
        : rawText;

    return res.json({
      reply: replyText,
      contextUsed: true,
    });
  } catch (err) {
    console.warn("[ragChat] Gemini call failed/timed out, returning direct context match:", (err as Error).message);
    
    // Fail-safe: Return top match content directly instead of static "I don't have that information"
    const { topMatch } = getRelevantContext(req.body.message || "");
    const fallbackReply = topMatch
      ? `${topMatch.content}`
      : "I don't have that information in my guide.";

    return res.json({
      reply: fallbackReply,
      contextUsed: false,
    });
  }
}
