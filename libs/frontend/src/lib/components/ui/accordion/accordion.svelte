<script lang="ts">
	export let id: string;
	export let open: boolean = false;
</script>

<details bind:open {id}>
	<summary><slot name="title">no title provided</slot></summary>

	<slot name="content">no content provided</slot>
</details>

<style lang="postcss">
	summary {
		@apply py-2;
	}

	details:not(:first-child) {
		@apply mt-8;
	}
</style>
