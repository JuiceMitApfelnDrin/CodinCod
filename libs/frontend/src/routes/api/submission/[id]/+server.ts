import { backendUrls, httpRequestMethod } from "types";
import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";
import { buildBackendUrl } from "@/config/backend";
import type { RequestEvent } from "./$types";

export async function GET({ params }: RequestEvent) {
	return await fetchWithAuthenticationCookie(
		buildBackendUrl(backendUrls.SUBMISSION_BY_ID, { id: params.id }),
		{
			method: httpRequestMethod.GET
		}
	);
}
