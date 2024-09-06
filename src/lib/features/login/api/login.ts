import { buildBackendUrl } from "@/config/backend";
import { backendUrls, POST } from "types";

export async function login(identifier: string, password: string) {
	return await fetch(buildBackendUrl(backendUrls.LOGIN), {
		method: POST,
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ identifier, password }),
		credentials: "include"
	});
}
