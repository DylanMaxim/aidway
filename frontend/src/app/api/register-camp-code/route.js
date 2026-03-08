import { db, admin } from "../../../../backend/firebaseAdmin";

export async function POST(request) {
    try {
        const body = await request.json();
        const { campCode } = body;

        if (!campCode) {
            return Response.json({ error: "campCode is required." }, { status: 400 });
        }

        const code = campCode.trim().toUpperCase();

        await db.collection("camps").doc(code).set({
            campCode: code,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        return Response.json({ success: true, campCode: code });

    } catch (error) {
        console.error("Error registering camp code:", error);
        return Response.json({ error: "Failed to register camp code." }, { status: 500 });
    }
}
