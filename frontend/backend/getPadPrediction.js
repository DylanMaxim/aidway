import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

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
  const scriptPath = path.join(process.cwd(), "backend", "predict_pad_demand.py");

  const args = [
    scriptPath,
    "--camp_id",
    String(campId),
    "--pads_last_month",
    String(pads_last_month),
    "--pads_2_months_ago",
    String(pads_2_months_ago),
    "--pads_3_months_ago",
    String(pads_3_months_ago),
    "--pads_last_4_weeks",
    String(pads_last_4_weeks),
    "--flagged_cases_last_4_weeks",
    String(flagged_cases_last_4_weeks),
    "--high_urgency_last_4_weeks",
    String(high_urgency_last_4_weeks),
    "--hygiene_score",
    String(hygiene_score),
    "--survey_pad_usage_rate",
    String(survey_pad_usage_rate)
  ];

  const { stdout } = await execFileAsync("python3", args);
  return JSON.parse(stdout.trim());
}
