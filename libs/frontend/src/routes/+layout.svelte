<script lang="ts">
	import Nav from "@/components/nav/navigation/navigation.svelte";
	import { authenticatedUserInfo } from "@/stores/auth.store";
	import { Toaster } from "$lib/components/ui/sonner";
	import { untrack, type Snippet } from "svelte";
	import { logger } from "$lib/utils/debug-logger";
	import type { AuthenticatedInfo } from "$lib/types/core/authentication/schema/authenticated-info.schema.js";
	import { isAuthenticatedInfo } from "$lib/types/core/authentication/schema/authenticated-info.schema.js";

	let { children, data }: { children: Snippet; data: AuthenticatedInfo } =
		$props();

	// Derive auth info once
	const newAuthInfo = $derived(isAuthenticatedInfo(data) ? data : null);

	// Fix: Use untrack properly and add dependencies
	$effect(() => {
		// Read newAuthInfo to establish dependency
		const authInfo = newAuthInfo;

		logger.page("+layout.svelte $effect triggered", {
			dataReceived: !!data,
			data
		});

		// Read current store value without tracking
		const currentAuthInfo = untrack(() => $authenticatedUserInfo);

		logger.auth("Syncing server auth data to client store", {
			newAuthInfo: authInfo,
			currentAuthInfo,
			willUpdate: JSON.stringify(authInfo) !== JSON.stringify(currentAuthInfo)
		});

		// Only update if the data has actually changed
		if (JSON.stringify(authInfo) !== JSON.stringify(currentAuthInfo)) {
			logger.auth("🔄 Updating authenticatedUserInfo store", {
				from: currentAuthInfo,
				to: authInfo
			});
			authenticatedUserInfo.set(authInfo);
		} else {
			logger.auth("⏭️  No auth state change, skipping store update");
		}
	});
</script>

<Nav />
<main
	class="dark:bg-primary-900 dark:text-primary-100 flex min-h-screen flex-col"
>
	{@render children()}
</main>
<Toaster richColors closeButton />
