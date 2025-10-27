<script lang="ts">
	import { page } from "$app/stores";
	import { DEFAULT_PAGE } from "types";
	import { Button } from "../ui/button";
	import { testIds } from "@/config/test-ids";

	let {
		currentPage,
		totalPages
	}: {
		currentPage: number;
		totalPages: number;
	} = $props();

	function createPaginatedUrl(newPage: number) {
		let params = new URLSearchParams($page.url.searchParams.toString());
		params.set("page", newPage.toString());

		return `?${params.toString()}`;
	}
</script>

{#if totalPages > DEFAULT_PAGE}
	<nav
		class="flex w-full flex-col items-center justify-center gap-2 md:flex-row md:gap-8"
	>
		<div class="flex flex-1 justify-end gap-2">
			{#if currentPage === DEFAULT_PAGE}
				<Button
					data-testid={testIds.PAGINATION_BUTTON_FIRST}
					disabled
					aria-hidden="true"
					variant="outline">First</Button
				>
			{:else}
				<Button
					data-testid={testIds.PAGINATION_BUTTON_FIRST}
					href={createPaginatedUrl(DEFAULT_PAGE)}
					variant="outline">First</Button
				>
			{/if}

			{#if currentPage > DEFAULT_PAGE}
				<Button
					data-testid={testIds.PAGINATION_BUTTON_PREVIOUS}
					href={createPaginatedUrl(currentPage - 1)}
					variant="outline">Previous</Button
				>
			{:else}
				<Button
					data-testid={testIds.PAGINATION_BUTTON_PREVIOUS}
					disabled
					aria-hidden="true"
					variant="outline">Previous</Button
				>
			{/if}
		</div>

		<p aria-live="polite" role="status">Page {currentPage} of {totalPages}</p>

		<div class="flex flex-1 gap-2">
			{#if currentPage < totalPages}
				<Button
					data-testid={testIds.PAGINATION_BUTTON_NEXT}
					href={createPaginatedUrl(currentPage + 1)}
					variant="outline">Next</Button
				>
			{:else}
				<Button
					data-testid={testIds.PAGINATION_BUTTON_NEXT}
					disabled
					aria-hidden="true"
					variant="outline">Next</Button
				>
			{/if}

			{#if currentPage === totalPages}
				<Button
					data-testid={testIds.PAGINATION_BUTTON_LAST}
					disabled
					aria-hidden="true"
					variant="outline">Last</Button
				>
			{:else}
				<Button
					data-testid={testIds.PAGINATION_BUTTON_LAST}
					href={createPaginatedUrl(totalPages)}
					variant="outline">Last</Button
				>
			{/if}
		</div>
	</nav>
{/if}
