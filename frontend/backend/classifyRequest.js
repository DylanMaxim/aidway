import { PRODUCT_CATALOG } from "./catalog";
import { classifyWithOllama } from "./classifyWithOllama";

const DEFAULT_RESULT = {
  catalogItems: ["Hygiene kit"],
  urgency: "low",
  flagged: false
};

const COMPLEX_KEYWORDS = [
  "severe",
  "heavy bleeding",
  "infection",
  "dizzy",
  "weak",
  "unusual discharge"
];

export function heuristicClassifyRequest(userText) {
  const text = String(userText || "").toLowerCase();
  const catalogSet = new Set();
  let urgency = "low";
  let flagged = false;

  if (text.includes("pad") || text.includes("pads")) {
    catalogSet.add("Sanitary pads");
  }

  if (text.includes("reusable")) {
    catalogSet.add("Reusable pads");
  }

  if (text.includes("underwear") || text.includes("panties")) {
    catalogSet.add("Underwear");
  }

  if (
    text.includes("wipe") ||
    text.includes("wipes") ||
    text.includes("soap") ||
    text.includes("clean") ||
    text.includes("hygiene")
  ) {
    catalogSet.add("Hygiene kit");
  }

  if (text.includes("pain") || text.includes("cramp") || text.includes("cramps")) {
    catalogSet.add("Pain relief support");
    if (urgency !== "high") {
      urgency = "medium";
    }
  }

  const medicalKeywords = [
    "heavy bleeding",
    "bleeding a lot",
    "infection",
    "severe pain",
    "dizzy",
    "faint",
    "weak",
    "unusual discharge"
  ];

  const hasMedicalFollowUp = medicalKeywords.some((keyword) => text.includes(keyword));
  if (hasMedicalFollowUp) {
    catalogSet.add("Medical follow-up");
    urgency = "high";
    flagged = true;
  }

  if (catalogSet.size === 0) {
    return { ...DEFAULT_RESULT };
  }

  const catalogItems = PRODUCT_CATALOG.filter((item) => catalogSet.has(item));

  return {
    catalogItems,
    urgency,
    flagged
  };
}

function shouldTryOllama(userText, heuristicResult) {
  const text = String(userText || "").toLowerCase();
  const isDefaultOnly =
    heuristicResult.catalogItems.length === 1 &&
    heuristicResult.catalogItems[0] === "Hygiene kit" &&
    heuristicResult.urgency === "low" &&
    heuristicResult.flagged === false;

  const hasComplexSymptoms = COMPLEX_KEYWORDS.some((keyword) => text.includes(keyword));

  return isDefaultOnly || hasComplexSymptoms;
}

export async function classifyRequest(userText) {
  const heuristicResult = heuristicClassifyRequest(userText);

  if (!shouldTryOllama(userText, heuristicResult)) {
    return heuristicResult;
  }

  try {
    return await classifyWithOllama(userText);
  } catch (error) {
    console.error("Ollama classification failed, falling back to heuristic:", error);
    return heuristicResult;
  }
}
