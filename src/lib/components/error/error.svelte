<script lang="ts">
	import { frontendUrls } from "types";
	import Container from "../ui/container/container.svelte";

	export let status: number = 500;
	export let message: string | null = null;
	export let header: string | null = null;

	type ErrorTypeDefaultInfo = { header: string; description: string };
	const errorMap: Record<number, ErrorTypeDefaultInfo> = {
		404: { header: "Page Not Found", description: "The page you are looking for does not exist." },
		500: {
			header: "Internal Server Error",
			description: "An unexpected error occurred on the server."
		},
		403: { header: "Forbidden", description: "You don't have permission to access this page." }
	};

	// Fallback for unknown status codes
	const defaultError = { header: "Unknown Error", description: "An unexpected error occurred." };

	const errorInfo = errorMap[status] ?? defaultError;
</script>

<Container>
	<h1 class="text-4xl font-bold">{status} - {header ?? errorInfo.header}</h1>
	<p class="text-lg">{message ?? errorInfo.description}</p>

	<a href={frontendUrls.ROOT} class="mt-4 text-blue-600">Go to Homepage</a>
</Container>
