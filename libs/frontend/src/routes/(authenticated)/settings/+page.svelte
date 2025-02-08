<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import { frontendUrls } from "types";

	onMount(() => {
		goto(frontendUrls.SETTINGS_PROFILE);
	});
</script>
