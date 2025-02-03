import { json } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import { env } from "$env/dynamic/private";

export async function POST({ request }) {
	const { token } = await request.json();

	const JWT_SECRET = env.JWT_SECRET;

	if (!JWT_SECRET) {
		throw new Error("Forgot environment variable JWT_SECRET in .env");
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET);

		return json(decoded);
	} catch {
		return json({ error: "Invalid token", isAuthenticated: false }, { status: 401 });
	}
}
