<script lang="ts">
	import LoggedInNav from "./logged-in-nav.svelte";
	import LoggedOutNav from "./logged-out-nav.svelte";

	export let data;
</script>

{#if data?.userInfo?.isAuthenticated}
	<LoggedInNav></LoggedInNav>
{:else}
	<LoggedOutNav></LoggedOutNav>
{/if}
