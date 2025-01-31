import { backendUrls, httpRequestMethod } from "types";
import type { RequestEvent } from "./$types";
import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";
import { buildBackendUrl } from "@/config/backend";

export async function POST({ cookies, request }: RequestEvent) {
	const body = await request.text();

	console.log({ body, cookies: cookies.getAll() });

	const result = await fetchWithAuthenticationCookie(buildBackendUrl(backendUrls.SUBMISSION), {
		body: body,
		method: httpRequestMethod.POST
	});
	console.log({ result });

	return result;
}
