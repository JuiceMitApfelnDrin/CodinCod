<script lang="ts">
	import { run } from "svelte/legacy";

	import Nav from "@/components/nav/navigation/navigation.svelte";
	import { authenticatedUserInfo } from "@/stores/index.js";
	import { isAuthenticatedInfo } from "types";
	import { Toaster } from "$lib/components/ui/sonner";

	let { data, children } = $props();

	run(() => {
		authenticatedUserInfo.set(isAuthenticatedInfo(data) ? data : null);
	});
</script>

<Nav />

<main class="dark:bg-primary-900 dark:text-primary-100 flex min-h-screen flex-col">
	{@render children?.()}
</main>

<Toaster richColors closeButton />
