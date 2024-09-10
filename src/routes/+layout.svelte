<script lang="ts">
	import Nav from "@/components/nav/nav.svelte";

	export let data;
</script>

<Nav {data} />

<div class="dark:bg-primary-900 dark:text-primary-100 flex min-h-screen flex-col">
	<slot />
</div>
