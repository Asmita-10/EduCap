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

// ── TF-IDF / BM25-style Keyword Tokenizer ─────────────────────────────────
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

// ── Vector / Token Similarity Calculation ────────────────────────────────
function computeScore(queryTokens: string[], chunk: IndexedChunk): number {
  if (queryTokens.length === 0) return 0;
  let matches = 0;
  const chunkText = (chunk.title + " " + chunk.content).toLowerCase();

  for (const token of queryTokens) {
    if (chunkText.includes(token)) {
      matches += 1;
    }
  }

  // Exact phrase or title boost
  const rawQuery = queryTokens.join(" ");
  if (chunkText.includes(rawQuery)) {
    matches += 2;
  }

  return matches / queryTokens.length;
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
      tokens: tokenize(chunk.title + " " + chunk.content),
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

    const queryTokens = tokenize(message);
    if (queryTokens.length === 0) {
      return res.json({
        reply: "I don't have that information in my guide.",
        retrieved: [],
      });
    }

    // 1. Retrieve top 2 relevant chunks using score similarity
    const scoredChunks = indexedKnowledgeBase
      .map((chunk) => ({
        chunk,
        score: computeScore(queryTokens, chunk),
      }))
      .sort((a, b) => b.score - a.score);

    const topMatches = scoredChunks.filter((item) => item.score > 0.15).slice(0, 2);

    // If similarity is below threshold, reject immediately without calling LLM
    if (topMatches.length === 0) {
      return res.json({
        reply: "I don't have that information in my guide.",
        retrieved: [],
      });
    }

    const retrievedContext = topMatches
      .map((m) => `[${m.chunk.title}]: ${m.chunk.content}`)
      .join("\n\n");

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback if no Gemini API key configured
    if (!apiKey) {
      const bestMatch = topMatches[0].chunk;
      return res.json({
        reply: `${bestMatch.content} (Source: ${bestMatch.title})`,
        retrieved: topMatches.map((m) => m.chunk.title),
      });
    }

    // 2. Compact Credit-Efficient Prompt
    const prompt = `You are the EduCap Assistant. Answer the question strictly using the provided context.
If the answer is not in the context, say "I don't have that information in my guide."
Keep answers under 3 sentences.

Context:
${retrievedContext}

Question: ${message}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 200,
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
      retrieved: topMatches.map((m) => m.chunk.title),
    });
  } catch (err) {
    console.error("[ragChat] Chat controller error:", (err as Error).message);
    // Graceful error prevention - never crash
    return res.json({
      reply: "I don't have that information in my guide.",
      retrieved: [],
    });
  }
}
