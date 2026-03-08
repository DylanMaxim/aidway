export async function GET(request) {
	try	{  // Get today's date in YYYY-MM-DD
		const { searchParams } = new URL(request.url);
		const campID = searchParams.get("id");

		const today = new Date().toISOString().slice(0, 10)

		const input = campID + today

		// Simple deterministic hash
		let hash = 0
		for (let i = 0; i < input.length; i++) {
			hash = (hash * 31 + input.charCodeAt(i)) >>> 0
		}

		// Convert to base36 (0-9A-Z)
		const code = hash.toString(36).toUpperCase()

		// Ensure exactly 6 chars
		return Response.json({ 
			success: true,
        	code: code.padStart(6, "0").slice(0, 6)
		})
	} catch (error) {
    console.error("Error fetching correspondent:", error);
    return Response.json(
      { error: "Failed to fetch correspondent data." },
      { status: 500 }
    );
  }
}