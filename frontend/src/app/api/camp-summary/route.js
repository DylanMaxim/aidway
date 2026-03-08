import { PRODUCT_CATALOG } from "../../../../backend/catalog";
import { db } from "../../../../backend/firebaseAdmin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const campId = searchParams.get("campId");

    if (!campId) {
      return Response.json({ error: "campId is required." }, { status: 400 });
    }

    const totals = PRODUCT_CATALOG.reduce((acc, item) => {
      acc[item] = 0;
      return acc;
    }, {});

    const snapshot = await db
      .collection("requests")
      .where("campId", "==", campId)
      .get();

    snapshot.forEach((doc) => {
      const data = doc.data();
      const items = Array.isArray(data.catalogItems) ? data.catalogItems : [];

      items.forEach((item) => {
        if (Object.prototype.hasOwnProperty.call(totals, item)) {
          totals[item] += 1;
        }
      });
    });

    return Response.json({
      success: true,
      campId,
      totals,
      totalRequests: snapshot.size
    });
  } catch (error) {
    console.error("Error getting camp summary:", error);
    return Response.json({ error: "Failed to get camp summary." }, { status: 500 });
  }
}
