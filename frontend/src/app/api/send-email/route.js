import emailjs from '@emailjs/nodejs';

export async function POST(request) {
	try {
		const body = await request.json();
		const { to, subject, templateParams } = body;

		if (!to) {
			return Response.json(
				{ error: "Recipient email is required" },
				{ status: 400 }
			);
		}

		// Send email using EmailJS
		const response = await emailjs.send(
			process.env.EMAILJS_SERVICE_ID,
			process.env.EMAILJS_TEMPLATE_ID,
			{
				to_email: to,
				...templateParams
			},
			{
				publicKey: process.env.EMAILJS_PUBLIC_KEY,
				privateKey: process.env.EMAILJS_PRIVATE_KEY,
			}
		);

		console.log('Email sent successfully:', response);

		return Response.json({
			success: true,
			messageId: response.text,
			message: `Email sent to ${to}`
		});

	} catch (error) {
		console.error('Error sending email:', error);
		return Response.json(
			{ error: 'Failed to send email.', details: error.text || error.message },
			{ status: 500 }
		);
	}
}