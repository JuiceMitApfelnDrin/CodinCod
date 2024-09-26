<script lang="ts">
	import { isAuthenticated } from "../../stores";
	import LoggedInNav from "./logged-in-nav.svelte";
	import LoggedOutNav from "./logged-out-nav.svelte";

	$: console.log({ $isAuthenticated });
</script>

{#if $isAuthenticated}
	<LoggedInNav></LoggedInNav>
{:else}
	<LoggedOutNav></LoggedOutNav>
{/if}
