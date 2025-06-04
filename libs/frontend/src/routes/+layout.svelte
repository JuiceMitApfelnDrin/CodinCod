<script lang="ts">
	import Nav from "@/components/nav/navigation/navigation.svelte";
	import { authenticatedUserInfo } from "@/stores/index.js";
	import { isAuthenticatedInfo } from "types";
	import { Toaster } from "$lib/components/ui/sonner";

	export let data;

	$: authenticatedUserInfo.set(isAuthenticatedInfo(data) ? data : null);
</script>

<Nav />

<main class="dark:bg-primary-900 dark:text-primary-100 flex min-h-screen flex-col">
	<slot />
</main>

<Toaster richColors closeButton />
