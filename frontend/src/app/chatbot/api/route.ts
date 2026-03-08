import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `You are a compassionate and efficient intake assistant for a humanitarian aid organisation that distributes sanitary and menstrual health products to people in crisis (e.g. refugee camps, disaster zones).

Your job is to have a friendly, conversational chat with someone submitting a needs request. You should gather the following information across natural turns of conversation:
- Location / region / country where products are needed
- Number of people who need the products
- Specific product types needed (e.g. sanitary pads, tampons, menstrual cups, pantyliners, pain relief, underwear)
- Approximate quantities needed
- Urgency level (immediate / within a week / within a month)
- Any additional notes or special circumstances

Ask follow-up questions naturally. Don't ask everything at once. Be warm, concise, and respectful.

When you have gathered enough information (at least location, approximate number of people, and product type), you can tell the user they can click the "Generate JSON" button to produce a structured summary. But keep chatting if they have more to add.

IMPORTANT: Never produce a JSON block yourself during normal conversation — that's done separately when the user clicks "Generate JSON".`;

const JSON_PROMPT = `Based on the conversation so far, produce a structured JSON object that summarises the sanitary product needs. Use this exact schema:

{
  "location": "string",
  "population": number,
  "urgency": "immediate" | "within_a_week" | "within_a_month" | "unknown",
  "products": [
    {
      "type": "string (e.g. sanitary_pads, tampons, menstrual_cups, pantyliners, pain_relief, underwear, other)",
      "quantity": number or null,
      "notes": "string or null"
    }
  ],
  "submittedAt": "ISO8601 timestamp",
  "additionalNotes": "string or null"
}

Return ONLY the raw JSON with no markdown code fences, no explanation, nothing else.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, generateJson } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: generateJson ? undefined : SYSTEM_PROMPT,
    });

    if (generateJson) {
      // Build a single prompt with the full conversation history for JSON extraction
      const conversationText = messages
        .map((m: { role: string; text: string }) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
        .join("\n");

      const result = await model.generateContent(
        `${JSON_PROMPT}\n\nConversation:\n${conversationText}\n\nCurrent UTC time: ${new Date().toISOString()}`
      );
      const text = result.response.text();
      return NextResponse.json({ text });
    }

    // Normal chat turn
    // Gemini requires history to start with a 'user' message, so drop any leading assistant messages
    const allHistory = messages.slice(0, -1).map((m: { role: string; text: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));
    const firstUserIdx = allHistory.findIndex((m: { role: string }) => m.role === "user");
    const history = firstUserIdx >= 0 ? allHistory.slice(firstUserIdx) : [];

    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1].text;
    const result = await chat.sendMessage(lastMessage);
    const text = result.response.text();

    return NextResponse.json({ text });
  } catch (err: unknown) {
    console.error("Gemini API error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
