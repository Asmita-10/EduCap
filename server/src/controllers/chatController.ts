import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import knowledgeBase from "../../data/knowledgeBase.json";

interface KnowledgeChunk {
  id: string;
  title: string;
  content: string;
}

// ── Explicit In-Memory Keyword Matcher ─────────────────────────────────────
function getRelevantContext(message: string): { contextText: string; topMatch?: KnowledgeChunk } {
  // Check title, content, and id keywords
  const queryLower = message.toLowerCase().trim();
  const queryTokens = queryLower.split(/\s+/).filter((t) => t.length > 2);

  const scored = (knowledgeBase as KnowledgeChunk[]).map((chunk) => {
    let score = 0;
    const text = `${chunk.id} ${chunk.title} ${chunk.content}`.toLowerCase();
    queryTokens.forEach((token) => {
      if (text.includes(token)) score += 2;
    });
    return { ...chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const topMatches = scored.filter((c) => c.score > 0).slice(0, 3);

  // If no specific match, pass the entire knowledge base context (under 400 tokens total)
  const contextText =
    topMatches.length > 0
      ? topMatches.map((c) => `${c.title}: ${c.content}`).join("\n\n")
      : (knowledgeBase as KnowledgeChunk[]).map((c) => `${c.title}: ${c.content}`).join("\n\n");

  return { contextText, topMatch: topMatches[0] || (knowledgeBase as KnowledgeChunk[])[0] };
}

// ── POST /api/chat Controller ──────────────────────────────────────────────
export async function chatHandler(req: Request, res: Response) {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message string is required." });
    }

    const { contextText, topMatch } = getRelevantContext(message);
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

    const prompt = `
You are EduCap's Financial Assistant. Answer the user's question clearly and directly in 2-3 natural sentences using the context below. Do not copy paste context verbatim; explain it naturally.

Context:
${contextText}

User Question: ${message}
`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        maxOutputTokens: 250,
      },
    });

    const result = await Promise.race([
      model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
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
