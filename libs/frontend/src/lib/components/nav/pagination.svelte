<script lang="ts">
	import { page } from "$app/stores";
	import { DEFAULT_PAGE } from "types";
	import { Button } from "../ui/button";

	export let currentPage: number;
	export let totalPages: number;

	function createPaginatedUrl(newPage: number) {
		let params = new URLSearchParams($page.url.searchParams.toString());
		params.set("page", newPage.toString());

		return `?${params.toString()}`;
	}
</script>

{#if totalPages > DEFAULT_PAGE}
	<nav class="flex w-full flex-col items-center justify-center gap-2 md:flex-row md:gap-8">
		<div class="flex flex-1 justify-end gap-2">
			{#if currentPage === DEFAULT_PAGE}
				<Button disabled aria-hidden="true" variant="outline">First</Button>
			{:else}
				<Button href={createPaginatedUrl(DEFAULT_PAGE)} variant="outline">First</Button>
			{/if}

			{#if currentPage > DEFAULT_PAGE}
				<Button href={createPaginatedUrl(currentPage - 1)} variant="outline">Previous</Button>
			{:else}
				<Button disabled aria-hidden="true" variant="outline">Previous</Button>
			{/if}
		</div>

		<p aria-live="polite" role="status">Page {currentPage} of {totalPages}</p>

		<div class="flex flex-1 gap-2">
			{#if currentPage < totalPages}
				<Button href={createPaginatedUrl(currentPage + 1)} variant="outline">Next</Button>
			{:else}
				<Button disabled aria-hidden="true" variant="outline">Next</Button>
			{/if}

			{#if currentPage === totalPages}
				<Button disabled aria-hidden="true" variant="outline">Last</Button>
			{:else}
				<Button href={createPaginatedUrl(totalPages)} variant="outline">Last</Button>
			{/if}
		</div>
	</nav>
{/if}
