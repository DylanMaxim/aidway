import { PRODUCT_CATALOG } from "./catalog";

export async function classifyRequest(userText) {
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
    return {
      catalogItems: ["Hygiene kit"],
      urgency: "low",
      flagged: false
    };
  }

  const catalogItems = PRODUCT_CATALOG.filter((item) => catalogSet.has(item));

  return {
    catalogItems,
    urgency,
    flagged
  };
}
