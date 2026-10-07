import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import fs from 'fs';
import staticKnowledgeBase from '../../data/knowledgeBase.json';

// 1. Safely load knowledgeBase.json across local and production builds
let knowledgeBase: Array<{ id: string; title: string; content: string }> = (staticKnowledgeBase as any) || [];

try {
  const possiblePaths = [
    path.resolve(__dirname, '../../data/knowledgeBase.json'),
    path.resolve(__dirname, '../data/knowledgeBase.json'),
    path.resolve(process.cwd(), 'data/knowledgeBase.json'),
    path.resolve(process.cwd(), 'server/data/knowledgeBase.json'),
    path.resolve(process.cwd(), 'src/data/knowledgeBase.json'),
  ];

  for (const jsonPath of possiblePaths) {
    if (fs.existsSync(jsonPath)) {
      const rawData = fs.readFileSync(jsonPath, 'utf-8');
      const parsed = JSON.parse(rawData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        knowledgeBase = parsed;
        console.log(`[CHAT LOG] Knowledge Base loaded successfully from ${jsonPath} with ${knowledgeBase.length} items.`);
        break;
      }
    }
  }
} catch (err) {
  console.error('[CHAT ERROR] Failed to load dynamic knowledgeBase.json, using static bundled array:', err);
}

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const handleChatRequest = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ reply: "Please provide a valid question." });
    }

    console.log(`[CHAT LOG] Incoming Query: "${message}"`);

    // Check if knowledge base is populated
    if (!knowledgeBase || knowledgeBase.length === 0) {
      console.error("[CHAT ERROR] Knowledge base array is empty!");
      return res.json({ reply: "I don't have that information in my guide." });
    }

    // 2. Simple Token Matching Strategy
    const cleanQuery = message.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const tokens = cleanQuery.split(/\s+/).filter((t: string) => t.length > 2);

    const scored = knowledgeBase.map((item) => {
      let score = 0;
      const fullText = `${item.title} ${item.content} ${item.id}`.toLowerCase();
      tokens.forEach((token: string) => {
        if (fullText.includes(token)) score += 2;
      });
      return { ...item, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const topMatches = scored.filter((c) => c.score > 0).slice(0, 4);

    // Context Assembly: Use top matches, or fall back to FULL knowledge base if scores are low
    const contextText = topMatches.length > 0 
      ? topMatches.map((c) => `[${c.title}]: ${c.content}`).join('\n\n')
      : knowledgeBase.map((c) => `[${c.title}]: ${c.content}`).join('\n\n');

    console.log(`[CHAT LOG] Retaining context length: ${contextText.length} characters with ${topMatches.length} scored matches.`);

    // 3. System Prompt for Gemini
    const systemPrompt = `
You are the official EduCap AI Assistant—a helpful, direct, and intelligent financial guide for students.

INSTRUCTIONS:
1. Answer the user's question clearly, accurately, and naturally in 2 to 4 sentences using the Context below.
2. If the user asks a financial, loan, or EduCap question (e.g. FOIR, moratorium, tax Section 80E, calculators, collateral), explain it directly.
3. If the question is completely unrelated to education loans or financial planning (e.g. cricket, weather, movies), reply ONLY with: "I don't have that information in my guide."

Context:
${contextText}

User Question: ${message}
`;

    if (!process.env.GEMINI_API_KEY) {
      console.error("[CHAT ERROR] GEMINI_API_KEY environment variable is missing on server!");
      const directFallback = topMatches.length > 0 ? topMatches[0].content : knowledgeBase[0].content;
      return res.json({ reply: directFallback });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await Promise.race([
      model.generateContent(systemPrompt),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("LLM_TIMEOUT")), 8000)
      ),
    ]);

    const botReply = result.response.text().trim();

    console.log(`[CHAT LOG] Gemini Reply Generated Successfully.`);
    return res.json({ reply: botReply });

  } catch (error) {
    console.error("[CHAT API CATCH ERROR]:", error);
    // Return direct top matched content if Gemini API error occurs
    const cleanQuery = (req.body.message || "").toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const tokens = cleanQuery.split(/\s+/).filter((t: string) => t.length > 2);
    const scored = (knowledgeBase || []).map((item) => {
      let score = 0;
      const fullText = `${item.title} ${item.content} ${item.id}`.toLowerCase();
      tokens.forEach((token: string) => {
        if (fullText.includes(token)) score += 2;
      });
      return { ...item, score };
    });
    scored.sort((a, b) => b.score - a.score);
    const top = scored.find((c) => c.score > 0);

    return res.json({ reply: top ? top.content : "I don't have that information in my guide." });
  }
};

export const chatHandler = handleChatRequest;
export default handleChatRequest;
