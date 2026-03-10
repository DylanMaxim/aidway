import nodemailer from 'nodemailer';

export async function POST(request) {
	try {
		const body = await request.json();
		const { to, subject, html, text } = body;

		if (!to || !subject || (!html && !text)) {
			return Response.json(
				{ error: "Missing required fields: to, subject, and html/text" },
				{ status: 400 }
			);
		}

		// Create transporter using environment variables
		const transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: parseInt(process.env.SMTP_PORT || '587'),
			secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS,
			},
		});

		// Send email
		const info = await transporter.sendMail({
			from: process.env.SMTP_FROM || `"Aidway" <${process.env.SMTP_USER}>`,
			to,
			subject,
			text: text || '', // Plain text fallback
			html: html || text,
		});

		console.log("Email sent successfully:", info.messageId);

		return Response.json({
			success: true,
			messageId: info.messageId,
			message: `Email sent to ${to}`
		});

	} catch (error) {
		console.error("Error sending email:", error);
		return Response.json(
			{ error: "Failed to send email.", details: error.message },
			{ status: 500 }
		);
	}
}