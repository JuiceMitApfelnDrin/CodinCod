<script lang="ts">
	import { goto, invalidateAll } from "$app/navigation";
	import { httpRequestMethod, reviewItemTypeEnum } from "types";
	import type { PageData } from "./$types";
	import { toast } from "svelte-sonner";
	import * as Table from "$lib/components/ui/table";
	import * as Select from "$lib/components/ui/select";
	import * as Dialog from "$lib/components/ui/dialog";
	import { Textarea } from "$lib/components/ui/textarea";
	import { Label } from "$lib/components/ui/label";
	import Pagination from "$lib/components/nav/pagination.svelte";
	import Container from "#/ui/container/container.svelte";
	import H1 from "#/typography/h1.svelte";
	import { Button } from "#/ui/button";
	import { page } from "$app/state";
	import { formattedDateYearMonthDay } from "@/utils/date-functions";
	import { testIds } from "@/config/test-ids";
	import { apiUrls } from "@/config/api";

	let { data }: { data: PageData } = $props();

	let reviseDialogOpen = $state(false);
	let selectedPuzzleId = $state("");
	let revisionReason = $state("");

	const reviewTypes = [
		{
			value: reviewItemTypeEnum.PENDING_PUZZLE,
			label: "Pending puzzles"
		},
		{
			value: reviewItemTypeEnum.REPORTED_PUZZLE,
			label: "Reported puzzles"
		},
		{
			value: reviewItemTypeEnum.REPORTED_USER,
			label: "Reported users"
		},
		{
			value: reviewItemTypeEnum.REPORTED_COMMENT,
			label: "Reported comments"
		}
	];

	function changeType(newType: string | undefined) {
		if (!newType) return;

		const url = new URL(page.url);

		url.searchParams.set("type", newType);
		url.searchParams.set("page", "1"); // Reset to first page

		goto(url.toString());
	}

	async function handleApprove(id: string) {
		try {
			const response = await fetch(apiUrls.moderationPuzzleByIdApprove(id), {
				method: httpRequestMethod.POST
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

	function openReviseDialog(id: string) {
		selectedPuzzleId = id;
		revisionReason = "";
		reviseDialogOpen = true;
	}

	async function submitRevision() {
		if (!revisionReason || revisionReason.length < 10) {
			toast.error("Please provide a reason (at least 10 characters)");
			return;
		}

		try {
			const response = await fetch(
				apiUrls.moderationPuzzleByIdRevise(selectedPuzzleId),
				{
					method: httpRequestMethod.POST,
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify({ reason: revisionReason })
				}
			);

			if (!response.ok) {
				throw new Error("Failed to request revisions");
			}

			toast.success("Puzzle sent back for revisions");
			reviseDialogOpen = false;
			await invalidateAll();
		} catch (error) {
			console.error("Error requesting revisions:", error);
			toast.error("Failed to request revisions");
		}
	}

	async function handleResolve(id: string, status: "resolved" | "rejected") {
		try {
			const response = await fetch(apiUrls.moderationReportByIdResolve(id), {
				method: httpRequestMethod.POST,
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ status })
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

<Container>
	<H1>Moderation Dashboard</H1>

	<div>
		<Label for="review-type" class="mb-2 block text-sm font-medium">
			Review Type
		</Label>

		<Select.Root
			type="single"
			value={data.currentType}
			onValueChange={(v: string | undefined) => changeType(v)}
		>
			<Select.Trigger class="w-full max-w-md">
				{reviewTypes.find((t) => t.value === data.currentType)?.label ??
					"Select review type"}
			</Select.Trigger>
			<Select.Content>
				{#each reviewTypes as type}
					<Select.Item value={type.value}>{type.label}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	</div>

	<!-- Error Message -->
	{#if data.error}
		<div
			class="mb-4 rounded-md bg-red-100 p-4 text-red-700 dark:bg-red-900 dark:text-red-200"
		>
			{data.error}
		</div>
	{/if}

	<!-- Review Items Table -->
	<div class="rounded-lg border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Title</Table.Head>
					<Table.Head>
						{data.currentType === reviewItemTypeEnum.PENDING_PUZZLE
							? "Author"
							: "Reported By"}
					</Table.Head>
					<Table.Head>Date</Table.Head>
					<Table.Head>Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if data.reviewItems.data.length === 0}
					<Table.Row>
						<Table.Cell
							colspan={4}
							class="text-muted-foreground py-8 text-center"
						>
							No items to review
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each data.reviewItems.data as item}
						<Table.Row>
							<Table.Cell>
								<div class="font-medium">
									{item.title}
								</div>
								{#if item.description}
									<div class="text-muted-foreground mt-1 text-sm">
										{item.description.substring(0, 100)}
										{item.description.length > 100 ? "..." : ""}
									</div>
								{/if}
								{#if item.reportExplanation}
									<div
										class="mt-2 text-sm text-orange-600 italic dark:text-orange-400"
									>
										Report: {item.reportExplanation}
									</div>
								{/if}
							</Table.Cell>
							<Table.Cell class="text-muted-foreground">
								{item.authorName || item.reportedBy || "Unknown"}
							</Table.Cell>
							<Table.Cell class="text-muted-foreground">
								{formattedDateYearMonthDay(item.createdAt)}
							</Table.Cell>
							<Table.Cell>
								{#if data.currentType === reviewItemTypeEnum.PENDING_PUZZLE}
									<div class="flex gap-2">
										<Button
											onclick={() => handleApprove(item.id)}
											variant="default"
											size="sm"
											class="bg-green-600 hover:bg-green-700"
											data-testid={testIds.MODERATION_PAGE_BUTTON_APPROVE_PUZZLE}
										>
											Approve
										</Button>
										<Button
											onclick={() => openReviseDialog(item.id)}
											variant="default"
											size="sm"
											class="bg-yellow-600 hover:bg-yellow-700"
											data-testid={testIds.MODERATION_PAGE_BUTTON_REVISE_PUZZLE}
										>
											Revise
										</Button>
									</div>
								{:else}
									<div class="flex gap-2">
										<Button
											onclick={() => handleResolve(item.id, "resolved")}
											variant="default"
											size="sm"
											class="bg-blue-600 hover:bg-blue-700"
											data-testid={testIds.MODERATION_PAGE_BUTTON_RESOLVE_REPORT}
										>
											Resolve
										</Button>
										<Button
											onclick={() => handleResolve(item.id, "rejected")}
											variant="destructive"
											size="sm"
											data-testid={testIds.MODERATION_PAGE_BUTTON_REJECT_REPORT}
										>
											Reject
										</Button>
									</div>
								{/if}
							</Table.Cell>
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>

	<!-- Pagination -->
	{#if data.reviewItems.pagination.totalPages > 1}
		<Pagination
			currentPage={data.reviewItems.pagination.page}
			totalPages={data.reviewItems.pagination.totalPages}
		/>
	{/if}
</Container>

<Dialog.Root bind:open={reviseDialogOpen}>
	<Dialog.Content class="sm:max-w-[525px]">
		<Dialog.Header>
			<Dialog.Title>Request Revisions</Dialog.Title>
			<Dialog.Description>
				Please provide a reason for requesting revisions. The puzzle author will
				see this feedback.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="revision-reason">Reason for revision</Label>
				<Textarea
					id="revision-reason"
					bind:value={revisionReason}
					placeholder="Explain what needs to be improved..."
					class="min-h-[100px]"
				/>
				<p class="text-muted-foreground text-sm">
					{revisionReason.length}/500 characters (minimum 10)
				</p>
			</div>
		</div>
		<Dialog.Footer>
			<Button
				variant="outline"
				onclick={() => (reviseDialogOpen = false)}
				data-testid={testIds.MODERATION_PAGE_BUTTON_CANCEL_REVISION}
			>
				Cancel
			</Button>
			<Button
				onclick={submitRevision}
				disabled={revisionReason.length < 10 || revisionReason.length > 500}
				data-testid={testIds.MODERATION_PAGE_BUTTON_SUBMIT_REVISION}
			>
				Submit Revision Request
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
