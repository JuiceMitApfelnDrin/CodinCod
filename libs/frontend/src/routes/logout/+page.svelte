<script lang="ts">
	import { goto } from "$app/navigation";
	import { authenticatedUserInfo } from "@/stores";
	import { onMount } from "svelte";
	import { frontendUrls } from "types";

	export let data: { loggedOut: boolean };

	onMount(() => {
		if (data.loggedOut) {
			authenticatedUserInfo.set(null);
			goto(frontendUrls.ROOT);
		}
	});
</script>
