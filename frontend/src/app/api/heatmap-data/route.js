import { PRODUCT_CATALOG } from "../../../../backend/catalog";
import { db } from "../../../../backend/firebaseAdmin";

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
        const baseCounts = PRODUCT_CATALOG.reduce((acc, item) => {
          acc[item] = 0;
          return acc;
        }, {});
        campMap.set(campId, baseCounts);
      }

      const counts = campMap.get(campId);
      items.forEach((item) => {
        if (Object.prototype.hasOwnProperty.call(counts, item)) {
          counts[item] += 1;
        }
      });
    });

    const rows = Array.from(campMap.entries()).map(([campId, counts]) => ({
      campId,
      counts
    }));

    return Response.json({
      success: true,
      catalogItems: PRODUCT_CATALOG,
      rows
    });
  } catch (error) {
    console.error("Error loading heatmap data:", error);
    return Response.json({ error: "Failed to load heatmap data." }, { status: 500 });
  }
}
