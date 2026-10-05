import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

interface KnowledgeChunk {
  id: string;
  title: string;
  content: string;
}

interface IndexedChunk extends KnowledgeChunk {
  tokens: string[];
}

let indexedKnowledgeBase: IndexedChunk[] = [];

// Common stop words to exclude from keyword extraction
const STOP_WORDS = new Set([
  "what", "is", "a", "an", "the", "do", "does", "did", "i", "you", "need",
  "how", "works", "work", "can", "should", "of", "to", "for", "in", "on",
  "with", "about", "tell", "me", "what's", "whats", "there", "are", "is",
]);

// ── Normalize and Tokenize Input Queries ──────────────────────────────────
function normalizeAndTokenize(text: string): { normalized: string; tokens: string[]; keywords: string[] } {
  const normalized = text.toLowerCase().trim();
  const rawTokens = normalized
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 1);

  const keywords = rawTokens.filter((w) => !STOP_WORDS.has(w) && w.length > 2);

  return {
    normalized,
    tokens: rawTokens,
    keywords: keywords.length > 0 ? keywords : rawTokens,
  };
}

// ── Vector / Similarity Match (Pass 1) ───────────────────────────────────
function computeSimilarityScore(queryKeywords: string[], chunk: IndexedChunk): number {
  if (queryKeywords.length === 0) return 0;
  let matches = 0;
  const chunkText = (chunk.title + " " + chunk.content).toLowerCase();

  for (const keyword of queryKeywords) {
    if (chunkText.includes(keyword)) {
      matches += 1;
    }
  }

  // Exact phrase or title match boost
  const rawQuery = queryKeywords.join(" ");
  if (chunkText.includes(rawQuery)) {
    matches += 2;
  }

  return matches / queryKeywords.length;
}

// ── Keyword Fallback Search (Pass 2) ──────────────────────────────────────
function performKeywordFallback(queryKeywords: string[]): IndexedChunk[] {
  if (queryKeywords.length === 0) return [];

  const matched: { chunk: IndexedChunk; score: number }[] = [];

  for (const chunk of indexedKnowledgeBase) {
    const titleLower = chunk.title.toLowerCase();
    const contentLower = chunk.content.toLowerCase();
    let score = 0;

    for (const kw of queryKeywords) {
      if (titleLower.includes(kw)) score += 3;
      else if (contentLower.includes(kw)) score += 1;
    }

    if (score > 0) {
      matched.push({ chunk, score });
    }
  }

  return matched
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((m) => m.chunk);
}

// ── Initialize In-Memory Vector Index ──────────────────────────────────────
export function initVectorIndex() {
  try {
    const filePath = path.join(__dirname, "../../data/knowledgeBase.json");
    if (!fs.existsSync(filePath)) {
      console.warn("[ragChat] knowledgeBase.json not found at", filePath);
      return;
    }

    const rawData = fs.readFileSync(filePath, "utf-8");
    const chunks: KnowledgeChunk[] = JSON.parse(rawData);

    indexedKnowledgeBase = chunks.map((chunk) => ({
      ...chunk,
      tokens: normalizeAndTokenize(chunk.title + " " + chunk.content).tokens,
    }));

    console.log(`[ragChat] Successfully indexed ${indexedKnowledgeBase.length} knowledge chunks in memory.`);
  } catch (err) {
    console.error("[ragChat] Failed to initialize knowledge base index:", err);
  }
}

// Auto-run indexing on load
initVectorIndex();

// ── POST /api/chat Controller ──────────────────────────────────────────────
export async function chatHandler(req: Request, res: Response) {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message string is required." });
    }

    const { normalized, keywords } = normalizeAndTokenize(message);

    // Pass 1: Vector / Similarity Matching (Threshold: 0.35 - 0.45)
    const SIMILARITY_THRESHOLD = 0.35;
    const scoredChunks = indexedKnowledgeBase
      .map((chunk) => ({
        chunk,
        score: computeSimilarityScore(keywords, chunk),
      }))
      .sort((a, b) => b.score - a.score);

    let topChunks = scoredChunks
      .filter((item) => item.score >= SIMILARITY_THRESHOLD)
      .slice(0, 3)
      .map((item) => item.chunk);

    // Pass 2: Keyword Fallback Search if Pass 1 yielded 0 results
    if (topChunks.length === 0) {
      topChunks = performKeywordFallback(keywords);
    }

    // Unrelated query check: If both passes return 0 results
    if (topChunks.length === 0) {
      return res.json({
        reply: "I don't have that information in my guide.",
        retrieved: [],
      });
    }

    const retrievedContext = topChunks
      .map((c) => `[${c.title}]: ${c.content}`)
      .join("\n\n");

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback if no Gemini API key configured
    if (!apiKey) {
      const bestMatch = topChunks[0];
      return res.json({
        reply: `${bestMatch.content} (Source: ${bestMatch.title})`,
        retrieved: topChunks.map((c) => c.title),
      });
    }

    // Refined System Prompt & Context
    const prompt = `You are EduCap's Financial Assistant. Use the provided context from EduCap's guide to answer the user's question accurately and concisely (under 3-4 sentences).

Context:
${retrievedContext}

User Question: ${normalized}

Rule: If the user's question relates to student loans, interest, moratorium, FOIR, collateral, or EduCap features, answer using the context. Only say "I don't have that information in my guide" if the query is completely unrelated to financial planning or education loans.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 250,
        temperature: 0.2,
      },
    });

    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("LLM_TIMEOUT")), 8000)
      ),
    ]);

    const replyText = result.response.text().trim();

    return res.json({
      reply: replyText || "I don't have that information in my guide.",
      retrieved: topChunks.map((c) => c.title),
    });
  } catch (err) {
    console.error("[ragChat] Chat controller error:", (err as Error).message);
    return res.json({
      reply: "I don't have that information in my guide.",
      retrieved: [],
    });
  }
}
