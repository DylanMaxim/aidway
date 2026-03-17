export const dynamic = "force-dynamic";

import { getPadPrediction } from "../../../../backend/getPadPrediction";
import { db } from "../../../../backend/firebaseAdmin";


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const campId = searchParams.get("campId");

    if (!campId) {
      return Response.json({ error: "campId is required." }, { status: 400 });
    }

    const snapshot = await db
      .collection("requests")
      .where("campId", "==", campId)
      .get();

    let pads_last_4_weeks = 0;
    let flagged_cases_last_4_weeks = 0;
    let high_urgency_last_4_weeks = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const items = Array.isArray(data.catalogItems) ? data.catalogItems : [];

      if (items.includes("Sanitary pads")) {
        pads_last_4_weeks += 1;
      }

      if (data.flagged === true) {
        flagged_cases_last_4_weeks += 1;
      }

      if (data.urgency === "high") {
        high_urgency_last_4_weeks += 1;
      }
    });

    const features = {
      pads_last_month: pads_last_4_weeks,
      pads_2_months_ago: Math.max(0, pads_last_4_weeks - 2),
      pads_3_months_ago: Math.max(0, pads_last_4_weeks - 4),
      pads_last_4_weeks,
      flagged_cases_last_4_weeks,
      high_urgency_last_4_weeks,
      hygiene_score: 0.5,
      survey_pad_usage_rate: 0.6
    };

    const prediction = await getPadPrediction({
      campId,
      ...features
    });

    return Response.json({
      success: true,
      campId,
      features,
      prediction
    });
  } catch (error) {
    console.error("Error predicting pad demand:", error);
    return Response.json({ error: "Failed to predict pad demand." }, { status: 500 });
  }
}
