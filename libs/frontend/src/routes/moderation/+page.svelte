<script lang="ts">
	import { goto, invalidateAll } from "$app/navigation";
	import { page } from "$app/stores";
	import { reviewItemTypeEnum, reviewStatusEnum } from "types";
	import type { PageData } from "./$types";
	import { toast } from "svelte-sonner";

	let { data }: { data: PageData } = $props();

	const reviewTypes = [
		{
			value: reviewItemTypeEnum.PENDING_PUZZLE,
			label: "Pending Puzzles",
		},
		{
			value: reviewItemTypeEnum.REPORTED_PUZZLE,
			label: "Reported Puzzles",
		},
		{
			value: reviewItemTypeEnum.REPORTED_USER,
			label: "Reported Users",
		},
		{
			value: reviewItemTypeEnum.REPORTED_COMMENT,
			label: "Reported Comments",
		},
	];

	function changeType(newType: string) {
		const url = new URL($page.url);
		url.searchParams.set("type", newType);
		url.searchParams.set("page", "1"); // Reset to first page
		goto(url.toString());
	}

	function formatDate(date: Date | string): string {
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	}

	async function handleApprove(id: string) {
		try {
			const response = await fetch(`/api/moderation/puzzle/${id}/approve`, {
				method: "POST",
			});

			if (!response.ok) {
				throw new Error("Failed to approve puzzle");
			}

			toast.success("Puzzle approved successfully");
			await invalidateAll();
		} catch (error) {
			console.error("Error approving puzzle:", error);
			toast.error("Failed to approve puzzle");
		}
	}

	async function handleRevise(id: string) {
		try {
			const response = await fetch(`/api/moderation/puzzle/${id}/revise`, {
				method: "POST",
			});

			if (!response.ok) {
				throw new Error("Failed to request revisions");
			}

			toast.success("Puzzle sent back for revisions");
			await invalidateAll();
		} catch (error) {
			console.error("Error requesting revisions:", error);
			toast.error("Failed to request revisions");
		}
	}

	async function handleResolve(id: string, status: "resolved" | "rejected") {
		try {
			const response = await fetch(`/api/moderation/report/${id}/resolve`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ status }),
			});

			if (!response.ok) {
				throw new Error("Failed to resolve report");
			}

			toast.success(`Report ${status} successfully`);
			await invalidateAll();
		} catch (error) {
			console.error("Error resolving report:", error);
			toast.error("Failed to resolve report");
		}
	}
</script>

<div class="container mx-auto p-6">
	<h1 class="mb-6 text-3xl font-bold">Moderation Dashboard</h1>

	<!-- Type Selector -->
	<div class="mb-6">
		<label for="review-type" class="mb-2 block text-sm font-medium">
			Review Type
		</label>
		<select
			id="review-type"
			class="w-full max-w-md rounded-md border border-gray-300 bg-white px-4 py-2 dark:border-gray-600 dark:bg-gray-800"
			value={data.currentType}
			onchange={(e) => changeType(e.currentTarget.value)}
		>
			{#each reviewTypes as type}
				<option value={type.value}>{type.label}</option>
			{/each}
		</select>
	</div>

	<!-- Error Message -->
	{#if data.error}
		<div class="mb-4 rounded-md bg-red-100 p-4 text-red-700 dark:bg-red-900 dark:text-red-200">
			{data.error}
		</div>
	{/if}

	<!-- Review Items Table -->
	<div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
		<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
			<thead class="bg-gray-50 dark:bg-gray-800">
				<tr>
					<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
						Title
					</th>
					<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
						{data.currentType === reviewItemTypeEnum.PENDING_PUZZLE ? "Author" : "Reported By"}
					</th>
					<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
						Date
					</th>
					<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
						Actions
					</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
				{#if data.reviewItems.data.length === 0}
					<tr>
						<td colspan="4" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
							No items to review
						</td>
					</tr>
				{:else}
					{#each data.reviewItems.data as item}
						<tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
							<td class="px-6 py-4">
								<div class="text-sm font-medium text-gray-900 dark:text-gray-100">
									{item.title}
								</div>
								{#if item.description}
									<div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
										{item.description.substring(0, 100)}
										{item.description.length > 100 ? "..." : ""}
									</div>
								{/if}
								{#if item.reportExplanation}
									<div class="mt-2 text-sm italic text-orange-600 dark:text-orange-400">
										Report: {item.reportExplanation}
									</div>
								{/if}
							</td>
							<td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
								{item.authorName || item.reportedBy || "Unknown"}
							</td>
							<td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
								{formatDate(item.createdAt)}
							</td>
							<td class="px-6 py-4 text-sm">
								{#if data.currentType === reviewItemTypeEnum.PENDING_PUZZLE}
									<div class="flex gap-2">
										<button
											onclick={() => handleApprove(item.id)}
											class="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
										>
											Approve
										</button>
										<button
											onclick={() => handleRevise(item.id)}
											class="rounded bg-yellow-600 px-3 py-1 text-white hover:bg-yellow-700"
										>
											Revise
										</button>
									</div>
								{:else}
									<div class="flex gap-2">
										<button
											onclick={() => handleResolve(item.id, "resolved")}
											class="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
										>
											Resolve
										</button>
										<button
											onclick={() => handleResolve(item.id, "rejected")}
											class="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
										>
											Reject
										</button>
									</div>
								{/if}
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>

	<!-- Pagination -->
	{#if data.reviewItems.pagination.totalPages > 1}
		<div class="mt-6 flex items-center justify-center gap-2">
			{#if data.reviewItems.pagination.page > 1}
				<button
					onclick={() => {
						const url = new URL($page.url);
						url.searchParams.set("page", String(data.reviewItems.pagination.page - 1));
						goto(url.toString());
					}}
					class="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
				>
					Previous
				</button>
			{/if}

			<span class="px-4 py-2">
				Page {data.reviewItems.pagination.page} of {data.reviewItems.pagination.totalPages}
			</span>

			{#if data.reviewItems.pagination.page < data.reviewItems.pagination.totalPages}
				<button
					onclick={() => {
						const url = new URL($page.url);
						url.searchParams.set("page", String(data.reviewItems.pagination.page + 1));
						goto(url.toString());
					}}
					class="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
				>
					Next
				</button>
			{/if}
		</div>
	{/if}
</div>
