<script lang="ts">
	import Nav from "@/components/nav/navigation/navigation.svelte";
	import { authenticatedUserInfo } from "@/stores/index.js";
	import { isAuthenticatedInfo } from "types";
	import { Toaster } from "$lib/components/ui/sonner";

	let { children, data } = $props();

	$effect(() => {
		authenticatedUserInfo.set(isAuthenticatedInfo(data) ? data : null);
	});
</script>

<Nav />

<main class="dark:bg-primary-900 dark:text-primary-100 flex min-h-screen flex-col">
	{@render children?.()}
</main>

<Toaster richColors closeButton />
