import { buildBackendUrl } from "@/config/backend";
import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";
import { backendUrls, POST, type SubmissionParams } from "types";

export async function submitCode({ code, language, puzzleId }: SubmissionParams) {
	const response = await fetchWithAuthenticationCookie(buildBackendUrl(backendUrls.SUBMISSION), {
		body: JSON.stringify({
			code,
			language,
			puzzleId
		}),
		headers: {
			"Content-Type": "application/json"
		},
		method: POST
	});

	const submission = await response.json();

	return submission;
}
