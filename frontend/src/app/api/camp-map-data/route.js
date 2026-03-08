import { getDemoCampLocation } from "../../../../backend/demoCampLocations";
import { getPadPrediction } from "../../../../backend/getPadPrediction";
import { db } from "../../../../backend/firebaseAdmin";

function getRiskLevel(flaggedCount, sanitaryPadsCount) {
  if (flaggedCount >= 3 || sanitaryPadsCount >= 12) {
    return "red";
  }
  if (flaggedCount >= 1 || sanitaryPadsCount >= 6) {
    return "orange";
  }
  return "green";
}

export async function GET() {
  try {
    const snapshot = await db.collection("requests").get();
    const campMap = new Map();

    snapshot.forEach((doc) => {
      const data = doc.data();
      const campId = data?.campId;
      const items = Array.isArray(data?.catalogItems) ? data.catalogItems : [];

      if (!campId || typeof campId !== "string") {
        return;
      }

      if (!campMap.has(campId)) {
        campMap.set(campId, {
          campId,
          totalRequests: 0,
          flaggedCount: 0,
          highUrgencyCount: 0,
          sanitaryPadsCount: 0
        });
      }

      const stats = campMap.get(campId);
      stats.totalRequests += 1;

      if (data.flagged === true) {
        stats.flaggedCount += 1;
      }

      if (data.urgency === "high") {
        stats.highUrgencyCount += 1;
      }

      if (items.includes("Sanitary pads")) {
        stats.sanitaryPadsCount += 1;
      }
    });

    const camps = [];

    for (const [campId, stats] of campMap.entries()) {
      const location = getDemoCampLocation(campId);
      const riskLevel = getRiskLevel(stats.flaggedCount, stats.sanitaryPadsCount);

      const campRow = {
        campId,
        regionName: location.regionName,
        lat: location.lat,
        lng: location.lng,
        totalRequests: stats.totalRequests,
        flaggedCount: stats.flaggedCount,
        highUrgencyCount: stats.highUrgencyCount,
        sanitaryPadsCount: stats.sanitaryPadsCount,
        riskLevel
      };

      try {
        const prediction = await getPadPrediction({
          campId,
          pads_last_4_weeks: stats.sanitaryPadsCount,
          flagged_cases_last_4_weeks: stats.flaggedCount,
          high_urgency_last_4_weeks: stats.highUrgencyCount,
          hygiene_score: 0.5,
          survey_pad_usage_rate: 0.6
        });
        campRow.predictedNextMonthPads = prediction.predictedNextMonthPads;
      } catch (predictionError) {
        console.error(`Prediction unavailable for camp ${campId}:`, predictionError);
      }

      camps.push(campRow);
    }

    return Response.json({
      success: true,
      camps
    });
  } catch (error) {
    console.error("Error loading camp map data:", error);
    return Response.json({ error: "Failed to load camp map data." }, { status: 500 });
  }
}
