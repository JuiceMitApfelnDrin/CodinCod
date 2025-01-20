import { buildBackendUrl } from "@/config/backend";
import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";
import { backendUrls, POST, type CodeExecutionParams } from "types";

export async function executeCode({ code, language, testInput, testOutput }: CodeExecutionParams) {
	const response = await fetchWithAuthenticationCookie(buildBackendUrl(backendUrls.EXECUTE), {
		body: JSON.stringify({
			code,
			language,
			testInput,
			testOutput
		}),
		headers: {
			"Content-Type": "application/json"
		},
		method: POST
	});
	const testResult = await response.json();

	return testResult;
}
