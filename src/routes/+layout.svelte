<script lang="ts">
	import Nav from "@/components/nav/nav.svelte";
	import { setAuthenticatedUserInfo } from "../stores.js";
	import { isAuthenticatedInfo } from "types";

	export let data;

	$: console.log({ data });
	if (isAuthenticatedInfo(data)) setAuthenticatedUserInfo(data);
</script>

<Nav />

<div class="dark:bg-primary-900 dark:text-primary-100 flex min-h-screen flex-col">
	<slot />
</div>
