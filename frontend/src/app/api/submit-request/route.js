import { classifyRequest } from "../../../../backend/classifyRequest";
import { generateCampCode } from "../../../../backend/generateCampCode";
import { db, admin } from "../../../../backend/firebaseAdmin";

export async function POST(request) {
  try {
    const body = await request.json();

    const { userId, location, anonymous, userText, campAccessCode } = body;

    if (!userId || !location || typeof anonymous !== "boolean" || !userText) {
      return Response.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const finalCampCode = campAccessCode || generateCampCode();
    const classification = await classifyRequest(userText);

    const newRequest = {
      userId,
      location,
      anonymous,
      userText,
      campAccessCode: finalCampCode,
      campId: finalCampCode,
      catalogItems: classification.catalogItems,
      urgency: classification.urgency,
      flagged: classification.flagged,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection("requests").add(newRequest);

    return Response.json(
      { success: true, id: docRef.id, data: newRequest },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating request:", error);
    return Response.json(
      { error: "Failed to create request." },
      { status: 500 }
    );
  }
}
