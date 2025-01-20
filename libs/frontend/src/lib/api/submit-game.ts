import { buildBackendUrl } from "@/config/backend";
import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";
import { backendUrls, POST, type SubmissionParams } from "types";

export async function submitGame({
	gameId,
	submissionId
}: {
	gameId: string;
	submissionId: string;
}) {
	return await fetchWithAuthenticationCookie(buildBackendUrl(backendUrls.SUBMISSION_GAME), {
		body: JSON.stringify({
			gameId,
			submissionId
		}),
		headers: {
			"Content-Type": "application/json"
		},
		method: POST
	});
}
