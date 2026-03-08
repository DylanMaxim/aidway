import { db } from "../../../../backend/firebaseAdmin";
import * as bcrypt from 'bcrypt';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log(body)

    // Validate input
    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required." }, 
        { status: 400 }
      );
    }

    // Query user from Firestore
    const snapshot = await db
      .collection("correspondents")
      .where("email", "==", email.toLowerCase())
      .limit(1)
      .get();

    // Check if user exists
    if (snapshot.empty) {
      return Response.json(
        { error: "Invalid email or password." }, 
        { status: 401 }
      );
    }

    // Get user document
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

	console.log(` > qpass in : ${password}\n > hashed : ${await bcrypt.hash(password, 10)}\n > passDB : ${userData.password}`)

    // Verify password
    const passwordMatch = await bcrypt.compare(password, userData.password);

	console.log(passwordMatch);

    if (!passwordMatch) {
      return Response.json(
        { error: "Invalid email or password." }, 
        { status: 401 }
      );
    }

    // Check if account is active
    if (userData.status !== "active") {
      return Response.json(
        { error: "Account is not active. Please contact support." }, 
        { status: 403 }
      );
    }

    // Update last login timestamp
    await db.collection("correspondents").doc(userDoc.id).update({
      lastLogin: new Date().toISOString()
    });

    // Return success with user data (excluding password)
    return Response.json({
      success: true,
      user: {
        id: userDoc.id,
        email: userData.email,
        name: userData.name,
        organizationName: userData.organizationName,
        role: userData.role || "correspondent",
        status: userData.status
      }
    });

  } catch (error) {
    console.error("Error during login:", error);
    return Response.json(
      { error: "Login failed. Please try again." }, 
      { status: 500 }
    );
  }
}