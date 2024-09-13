<script lang="ts">
	import { DEFAULT_PAGE } from "types";

	export let currentPage: number;
	export let totalPages: number;

	const changePage = (page: number) => {
		const url = new URL(window.location.href);
		url.searchParams.set("page", page.toString());
		window.location.href = url.toString();
	};

	const nextPage = () => {
		changePage(currentPage + 1);
	};

	const previousPage = () => {
		changePage(currentPage - 1);
	};

	const firstPage = () => {
		changePage(DEFAULT_PAGE);
	};
	const lastPage = () => {
		changePage(totalPages);
	};
</script>

{#if totalPages > DEFAULT_PAGE}
	<nav class="pagination">
		<button on:click={firstPage} disabled={currentPage === DEFAULT_PAGE}>First</button>
		{#if currentPage > DEFAULT_PAGE}
			<button on:click={previousPage}>Previous</button>
		{/if}

		<span>Page {currentPage} of {totalPages}</span>

		{#if currentPage < totalPages}
			<button on:click={nextPage}>Next</button>
		{/if}
		<button on:click={lastPage} disabled={currentPage === totalPages}>Last</button>
	</nav>
{/if}

<style>
	.pagination {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
