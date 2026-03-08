import { PRODUCT_CATALOG } from "./catalog";

const VALID_URGENCY = new Set(["low", "medium", "high"]);

function sanitizeAndValidate(raw) {
  if (!raw || typeof raw !== "object") {
    throw new Error("Ollama response is not an object");
  }

  if (!Array.isArray(raw.catalogItems)) {
    throw new Error("catalogItems must be an array");
  }

  const dedupedItems = [...new Set(raw.catalogItems)]
    .map((item) => String(item))
    .filter((item) => PRODUCT_CATALOG.includes(item));

  if (dedupedItems.length === 0) {
    throw new Error("No valid catalog items in Ollama response");
  }

  const urgency = String(raw.urgency || "").toLowerCase();
  if (!VALID_URGENCY.has(urgency)) {
    throw new Error("Invalid urgency in Ollama response");
  }

  if (typeof raw.flagged !== "boolean") {
    throw new Error("flagged must be boolean");
  }

  return {
    catalogItems: dedupedItems,
    urgency,
    flagged: raw.flagged
  };
}

export async function classifyWithOllama(userText) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  const prompt = `You are a classifier.

Allowed catalog items:
- Sanitary pads
- Reusable pads
- Underwear
- Hygiene kit
- Pain relief support
- Medical follow-up

Classify the user message.

Return ONLY valid JSON in exactly this format:
{
  "catalogItems": [],
  "urgency": "low",
  "flagged": false
}

Rules:
- Choose one or more items from the allowed catalog only
- Do not invent categories
- If severe symptoms are mentioned, include "Medical follow-up"
- urgency must be exactly one of: low, medium, high
- flagged must be a boolean
- Respond ONLY with valid JSON
- No explanations
- No markdown
- If the response is not valid JSON the system will crash

User message:
${String(userText || "")}`;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3.1",
        prompt,
        stream: false
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Ollama HTTP ${response.status}`);
    }

    const data = await response.json();
    const rawText = String(data?.response || "").trim();

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      throw new Error("Ollama returned invalid JSON");
    }

    return sanitizeAndValidate(parsed);
  } finally {
    clearTimeout(timeout);
  }
}
