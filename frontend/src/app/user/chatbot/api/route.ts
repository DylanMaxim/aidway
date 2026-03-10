import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `You are a compassionate, knowledgeable, and non-judgmental women's health assistant. Your role is to have warm, supportive conversations about women's health topics and help users understand their symptoms, concerns, and options.

You can help with topics such as:
- Menstrual health (cycle irregularities, pain, heavy bleeding, etc.)
- Reproductive health (PCOS, endometriosis, fibroids, fertility, etc.)
- Menopause and perimenopause
- Sexual health and contraception
- Pregnancy and postpartum health
- General gynaecological concerns
- Mental health as it relates to hormones and women's health
- Nutrition, lifestyle, and wellness for women

Guidelines:
- Be warm, empathetic, and conversational — never clinical or cold
- Ask follow-up questions naturally to better understand the user's situation
- Provide helpful, evidence-based information but always recommend consulting a healthcare professional for diagnosis or treatment
- Never dismiss symptoms — take every concern seriously
- Be inclusive and sensitive to all women and people with female reproductive systems
- If someone describes urgent or serious symptoms (e.g. severe pain, heavy bleeding, signs of miscarriage), gently encourage them to seek immediate medical attention
- Never produce a JSON summary during conversation — that is handled separately via the "Generate Summary" button

IMPORTANT: You are an informational assistant, not a doctor. Always make clear that your information does not replace professional medical advice.`;

const JSON_PROMPT = `Based on the conversation so far, produce a structured JSON summary of the women's health consultation. Use this exact schema:
{
  "primaryConcern": "string (main health topic or symptom discussed)",
  "symptoms": [
    {
      "description": "string",
      "duration": "string or null",
      "severity": "mild" | "moderate" | "severe" | "unknown"
    }
  ],
  "relevantHistory": "string or null (any mentioned medical history, medications, or prior diagnoses)",
  "recommendedNextSteps": ["string array of suggested actions discussed"],
  "topicsDiscussed": ["string array of women's health topics covered"],
  "urgencyFlag": "routine" | "soon" | "urgent" | "unknown",
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