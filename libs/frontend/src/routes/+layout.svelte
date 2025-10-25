<script lang="ts">
	import Nav from "@/components/nav/navigation/navigation.svelte";
	import { authenticatedUserInfo } from "@/stores/index.js";
	import { isAuthenticatedInfo } from "types";
	import { Toaster } from "$lib/components/ui/sonner";
	import { untrack } from "svelte";

	let { children, data } = $props();

	// Use untrack to prevent the store read from causing infinite loops
	$effect(() => {
		const newAuthInfo = isAuthenticatedInfo(data) ? data : null;
		const currentAuthInfo = untrack(() => $authenticatedUserInfo);

		// Only update if the data has actually changed
		if (JSON.stringify(newAuthInfo) !== JSON.stringify(currentAuthInfo)) {
			authenticatedUserInfo.set(newAuthInfo);
		}
	});
</script>

<Nav />

<main
	class="dark:bg-primary-900 dark:text-primary-100 flex min-h-screen flex-col"
>
	{@render children?.()}
</main>

<Toaster richColors closeButton />
