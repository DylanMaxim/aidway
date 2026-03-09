import { db } from "../../../../../backend/firebaseAdmin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const correspondentID = searchParams.get("id");

    if (!correspondentID) {
      return Response.json(
        { error: "Correspondent ID is required." },
        { status: 400 }
      );
    }

    // Fetch correspondent document from Firestore
    const doc = await db.collection("correspondents").doc(correspondentID).get();

    if (!doc.exists) {
      return Response.json(
        { error: "Correspondent not found." },
        { status: 404 }
      );
    }

    const correspondentData = doc.data();

    // Check if correspondent has a camp ID
    if (!correspondentData.campID) {
      return Response.json(
        { error: "No camp ID assigned to this correspondent." },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      correspondent: {
        id: doc.id,
        name: correspondentData.name,
        email: correspondentData.email,
        campID: correspondentData.campID,
        status: correspondentData.status,
        lastLogin: correspondentData.lastLogin,
      }
    });

  } catch (error) {
    console.error("Error fetching correspondent:", error);
    return Response.json(
      { error: "Failed to fetch correspondent data." },
      { status: 500 }
    );
  }
}