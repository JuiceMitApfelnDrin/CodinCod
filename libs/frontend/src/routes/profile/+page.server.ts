import { buildBackendUrl } from "@/config/backend";
import { backendUrls } from "types";

export async function load({ fetch }) {
	const url = buildBackendUrl(backendUrls.ACCOUNT);

	const res = await fetch(url);
	const data = await res.json();

	console.log(data)

	return data;
}
