<script lang="ts">
	import LoggedInNav from "./loggedInNav.svelte";
	import LoggedOutNav from "./loggedOutNav.svelte";

	const loggedIn = true;
</script>

{#if loggedIn}
	<LoggedInNav></LoggedInNav>
{:else}
	<LoggedOutNav></LoggedOutNav>
{/if}
