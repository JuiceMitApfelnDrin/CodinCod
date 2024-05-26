<script lang="ts">
	import LoggedInNav from "./logged-in-nav.svelte";
	import LoggedOutNav from "./logged-out-nav.svelte";

	const loggedIn = true;
</script>

{#if loggedIn}
	<LoggedInNav></LoggedInNav>
{:else}
	<LoggedOutNav></LoggedOutNav>
{/if}
