import { backendUrls, httpRequestMethod } from "types";
import { buildBackendUrl } from "@/config/backend";
import type { RequestEvent } from "./$types";

export async function GET({ fetch }: RequestEvent) {
	const something = fetch(buildBackendUrl(backendUrls.PUZZLE_LANGUAGES), {
		method: httpRequestMethod.GET
	});
	console.log("hi", { something });
	return something;
}
