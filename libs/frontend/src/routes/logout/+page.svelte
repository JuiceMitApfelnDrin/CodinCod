<script lang="ts">
	import { goto } from "$app/navigation";
	import { clearAuthenticatedUserInfo } from "@/stores";
	import { onMount } from "svelte";
	import { frontendUrls } from "types";

	export let data: { loggedOut: boolean };

	onMount(() => {
		if (data.loggedOut) {
			clearAuthenticatedUserInfo();
			goto(frontendUrls.ROOT);
		}
	});
</script>
