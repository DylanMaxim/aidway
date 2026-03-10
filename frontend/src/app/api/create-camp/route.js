import { db } from "../../../../backend/firebaseAdmin";  //"../../../backend/firebaseAdmin";
import * as bcrypt from 'bcrypt';

// Helper to generate random codes
function generateCampCode() {
	const value = Math.floor(Math.random() * 0xffffff)
	return value.toString(16).toUpperCase().padStart(6, "0")
}

function generateOneTimeCode() {
	const part1 = Math.random().toString(36).substring(2, 6).toUpperCase()
	const part2 = Math.random().toString(36).substring(2, 6).toUpperCase()
	return `${part1}-${part2}`
}

export async function POST(request) {
	try {
		const body = await request.json();
		const { campName, campLocation, correspondentName, correspondentEmail, charityID } = body;

		// Validate input
		if (!campName || !campLocation || !correspondentName || !correspondentEmail) {
			return Response.json(
				{ error: "All fields are required." },
				{ status: 400 }
			);
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(correspondentEmail)) {
			return Response.json(
				{ error: "Invalid email address." },
				{ status: 400 }
			);
		}

		// Generate unique camp code
		const campCode = generateCampCode();

		// Generate one-time access code for correspondent
		const oneTimeCode = generateOneTimeCode();

		// Create camp document
		const campData = {
			campCode,
			campName,
			campLocation,
			createdBy: charityID || null,
			createdAt: new Date().toISOString(),
			status: "active"
		};

		await db.collection("camps").doc(campCode).set(campData);

		// Create correspondent document
		const correspondentData = {
			campID: campCode,
			name: correspondentName,
			email: correspondentEmail.toLowerCase(),
			oneTimeCode,
			password: null, // Will be set when they activate
			status: "pending",
			createdAt: new Date().toISOString(),
			lastLogin: null
		};

		const correspondentRef = await db.collection("correspondents").add(correspondentData);

		// Send email with one-time code
		try {
			await fetch(process.env.EMAIL_API_ENDPOINT || '/api/send-email', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					to: correspondentEmail,
					subject: 'Your Camp Access Credentials - Aidway',
					html: `
						<h2>Welcome to Aidway</h2>
						<p>Hello ${correspondentName},</p>
						<p>A camp has been created for you:</p>
						<ul>
							<li><strong>Camp Name:</strong> ${campName}</li>
							<li><strong>Location:</strong> ${campLocation}</li>
							<li><strong>Camp Code:</strong> <code>${campCode}</code></li>
						</ul>
						<p>To activate your account and set your password, use this one-time access code:</p>
						<h3 style="font-family: monospace; font-size: 24px; background: #f3f4f6; padding: 12px; border-radius: 8px; display: inline-block;">${oneTimeCode}</h3>
						<p>Visit the correspondent login page and use the "Activate Account" section.</p>
						<p>This code can only be used once.</p>
						<br>
						<p>Best regards,<br>The Aidway Team</p>
					`
				})
			});
		} catch (emailError) {
			console.error("Failed to send email:", emailError);
			// Continue anyway - camp is created
		}

		return Response.json({
			success: true,
			campCode,
			message: `Camp created successfully. Access credentials sent to ${correspondentEmail}`,
			correspondent: {
				id: correspondentRef.id,
				email: correspondentEmail
			}
		});

	} catch (error) {
		console.error("Error creating camp:", error);
		return Response.json(
			{ error: "Failed to create camp." },
			{ status: 500 }
		);
	}
}