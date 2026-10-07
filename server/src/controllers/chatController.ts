import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import knowledgeBase from "../../data/knowledgeBase.json";

interface KnowledgeChunk {
  id: string;
  title: string;
  content: string;
}

const STOP_WORDS = new Set([
  "the", "and", "is", "in", "it", "of", "to", "for", "with", "on", "at", "by", "from", "up",
  "about", "into", "over", "after", "who", "whom", "what", "which", "when", "where", "why", "how",
  "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not",
  "only", "own", "same", "so", "than", "too", "very", "can", "will", "just", "should", "now",
  "are", "was", "were", "been", "being", "have", "has", "had", "does", "did", "doing", "would",
  "tell", "me", "give", "you", "your", "my", "i", "we", "they", "them", "he", "she", "an", "as"
]);

// ── Explicit In-Memory Keyword & Semantic Context Matcher ──────────────────
function getRelevantContextAndRelevance(userQuery: string): {
  context: string;
  isRelevant: boolean;
  topMatch?: KnowledgeChunk;
} {
  const cleanQuery = userQuery.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const allTokens = cleanQuery.split(/\s+/).filter((t) => t.length >= 2);
  const meaningfulTokens = allTokens.filter((t) => !STOP_WORDS.has(t));

  if (meaningfulTokens.length === 0 && allTokens.length === 0) {
    return { context: "", isRelevant: false };
  }

  // Define domain-specific trigger keywords to ensure relevant queries pass
  const domainKeywords = [
    "loan", "loans", "emi", "emis", "moratorium", "foir", "interest", "tax", "taxes", "80e", "80", "cibil",
    "credit", "score", "scores", "collateral", "margin", "subsidized", "unsubsidized",
    "prepayment", "foreclosure", "disbursement", "nbfc", "nbfcs", "bank", "banks", "educap",
    "calculator", "inflation", "tuition", "grace", "tenure", "2000", "5000",
    "save", "saving", "savings", "paying", "payment", "salaries", "salary", "risk", "risks", "npa", "default", "defaults", "amortization"
  ];

  const hasDomainKeyword = allTokens.some((token) => domainKeywords.includes(token));

  // Score each chunk in knowledge base using whole word/token checks
  const scored = (knowledgeBase as KnowledgeChunk[]).map((item) => {
    let score = 0;
    const fullText = ` ${item.title} ${item.content} ${item.id} `.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
    const docWords = new Set(fullText.split(/\s+/));

    meaningfulTokens.forEach((token) => {
      if (docWords.has(token) || fullText.includes(` ${token} `)) {
        score += 2;
      }
    });

    return { ...item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const topMatches = scored.filter((c) => c.score > 0).slice(0, 4);

  // If matched top chunks OR query contains domain keywords, construct full context
  if (topMatches.length > 0 || hasDomainKeyword) {
    const contextText =
      topMatches.length > 0
        ? topMatches.map((c) => `[${c.title}]: ${c.content}`).join("\n\n")
        : (knowledgeBase as KnowledgeChunk[]).map((c) => `[${c.title}]: ${c.content}`).join("\n\n");

    return {
      context: contextText,
      isRelevant: true,
      topMatch: topMatches[0] || (knowledgeBase as KnowledgeChunk[])[0],
    };
  }

  // Query is completely out of domain (e.g., cricket, weather, general trivia)
  return { context: "", isRelevant: false };
}

// ── POST /api/chat Controller ──────────────────────────────────────────────
export async function chatHandler(req: Request, res: Response) {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ reply: "Please provide a question." });
    }

    const { context, isRelevant, topMatch } = getRelevantContextAndRelevance(message);

    // Immediate fallback for completely out-of-scope questions (e.g. IPL, weather)
    if (!isRelevant) {
      return res.json({ reply: "I don't have that information in my guide." });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Direct fallback if GEMINI_API_KEY is not configured on production/Render
    if (!apiKey) {
      console.warn("[ragChat] GEMINI_API_KEY is missing, returning rule-based context match.");
      const fallbackReply = topMatch
        ? `${topMatch.content}`
        : "I don't have that information in my guide.";
      return res.json({
        reply: fallbackReply,
      });
    }

    const systemPrompt = `
You are the official EduCap AI Assistant—a helpful, direct, and intelligent financial guide for students.

INSTRUCTIONS:
1. Answer the user's question clearly, accurately, and naturally in 2 to 4 sentences using ONLY the provided Context below.
2. Synthesize plain-language explanations. For strategies (e.g., paying ₹2,000 to ₹5,000 during moratorium or claiming Section 80E tax deductions), explain the benefit directly.
3. STRICT RULE: If the answer cannot be answered using the provided Context, reply ONLY with: "I don't have that information in my guide."

Context:
${context}

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
        contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
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
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return res.json({
      reply: "I don't have that information in my guide.",
    });
  }
}

export const handleChatRequest = chatHandler;
