import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/**
 * Heuristic fallback when the Python/ML model is unavailable.
 * Uses a weighted trend + urgency adjustment to estimate next month's pad demand.
 */
function heuristicPrediction({
  campId,
  pads_last_month,
  pads_2_months_ago,
  pads_3_months_ago,
  pads_last_4_weeks,
  flagged_cases_last_4_weeks,
  high_urgency_last_4_weeks,
  hygiene_score,
  survey_pad_usage_rate,
}) {
  // Weighted average of the last 3 months (most recent weighted heaviest)
  const trend =
    pads_last_month * 0.5 +
    pads_2_months_ago * 0.3 +
    pads_3_months_ago * 0.2;

  // Urgency boost: flagged and high-urgency cases signal higher future demand
  const urgencyFactor =
    1 +
    high_urgency_last_4_weeks * 0.1 +
    flagged_cases_last_4_weeks * 0.05;

  // Normalise survey usage rate against its default (0.6)
  const usageFactor = survey_pad_usage_rate / 0.6;

  // 4-week pace: how the current 4-week count compares to last month's pace
  const paceFactor = pads_last_month > 0
    ? pads_last_4_weeks / pads_last_month
    : 1;

  const raw = trend * urgencyFactor * usageFactor * (0.5 + 0.5 * paceFactor);
  const predictedNextMonthPads = Math.max(1, Math.round(raw));

  return { campId, predictedNextMonthPads, method: "heuristic" };
}

export async function getPadPrediction({
  campId,
  pads_last_month,
  pads_2_months_ago,
  pads_3_months_ago,
  pads_last_4_weeks,
  flagged_cases_last_4_weeks,
  high_urgency_last_4_weeks,
  hygiene_score,
  survey_pad_usage_rate
}) {
  // Try the Python ML model first
  try {
    const scriptPath = path.join(process.cwd(), "backend", "predict_pad_demand.py");

    const args = [
      scriptPath,
      "--camp_id", String(campId),
      "--pads_last_month", String(pads_last_month),
      "--pads_2_months_ago", String(pads_2_months_ago),
      "--pads_3_months_ago", String(pads_3_months_ago),
      "--pads_last_4_weeks", String(pads_last_4_weeks),
      "--flagged_cases_last_4_weeks", String(flagged_cases_last_4_weeks),
      "--high_urgency_last_4_weeks", String(high_urgency_last_4_weeks),
      "--hygiene_score", String(hygiene_score),
      "--survey_pad_usage_rate", String(survey_pad_usage_rate)
    ];

    const { stdout } = await execFileAsync("python3", args, { timeout: 10000 });
    const result = JSON.parse(stdout.trim());
    return { ...result, method: "ml-model" };

  } catch (err) {
    // Python/model unavailable (e.g. Railway) — use heuristic fallback
    console.warn("ML model unavailable, using heuristic fallback:", err.message);
    return heuristicPrediction({
      campId,
      pads_last_month,
      pads_2_months_ago,
      pads_3_months_ago,
      pads_last_4_weeks,
      flagged_cases_last_4_weeks,
      high_urgency_last_4_weeks,
      hygiene_score,
      survey_pad_usage_rate,
    });
  }
}
