import { db } from "../../../../backend/firebaseAdmin";
import * as bcrypt from 'bcrypt';

export async function POST(request) {
    try {
        const body = await request.json();
        const { accessCode, password } = body;

        if (!accessCode || !password) {
            return Response.json(
                { error: "Access code and password are required." },
                { status: 400 }
            );
        }

        // Validate password strength
        if (password.length < 8) {
            return Response.json(
                { error: "Password must be at least 8 characters long." },
                { status: 400 }
            );
        }

        const code = accessCode.trim().toUpperCase();

        // Query for correspondent with matching one-time access code
        const snapshot = await db
            .collection("correspondents")
            .where("oneTimeCode", "==", code)
            .limit(1)
            .get();

        // Check if correspondent exists with this one-time code
        if (snapshot.empty) {
            return Response.json(
                { error: "Invalid or already used access code." },
                { status: 401 }
            );
        }

        // Get correspondent document
        const correspondentDoc = snapshot.docs[0];
        const correspondentData = correspondentDoc.data();

        // Check if account is already activated
        if (correspondentData.password) {
            return Response.json(
                { error: "This access code has already been used." },
                { status: 400 }
            );
        }

        // Hash the new password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Update correspondent: set password, remove one-time code, activate account
        await db.collection("correspondents").doc(correspondentDoc.id).update({
            password: passwordHash,
            oneTimeCode: null, // Deactivate the one-time code
            status: "active",
            activatedAt: new Date().toISOString()
        });

        // Return success
        return Response.json({
            success: true,
            message: "Account activated successfully!",
            correspondent: {
                id: correspondentDoc.id,
                email: correspondentData.email,
                name: correspondentData.name,
                campID: correspondentData.campID
            }
        });

    } catch (error) {
        console.error("Error activating account:", error);
        return Response.json(
            { error: "Account activation failed. Please try again." },
            { status: 500 }
        );
    }
}