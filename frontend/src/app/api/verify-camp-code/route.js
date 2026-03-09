import { db } from "../../../../backend/firebaseAdmin";

export async function POST(request) {
    try {
        const body = await request.json();
        const { campCode } = body;

        if (!campCode) {
            return Response.json({ error: "campCode is required." }, { status: 400 });
        }

        const code = campCode.trim().toUpperCase();

        // Check the camps collection first
        const campDoc = await db.collection("camps").doc(code).get();
        if (campDoc.exists) {
            return Response.json({ valid: true });
        }

        // Fallback: check if any requests have been submitted with this campId
        const snapshot = await db
            .collection("requests")
            .where("campId", "==", code)
            .limit(1)
            .get();

        if (!snapshot.empty) {
            return Response.json({ valid: true });
        }

        return Response.json({ valid: false, error: "Camp code not found." }, { status: 404 });

    } catch (error) {
        console.error("Error verifying camp code:", error);
        return Response.json({ error: "Verification failed." }, { status: 500 });
    }
}
