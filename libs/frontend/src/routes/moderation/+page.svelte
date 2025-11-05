<script lang="ts">
	import { goto, invalidateAll } from "$app/navigation";
	import {
		showErrorNotification,
		showSuccessNotification
	} from "$lib/api/notifications";
	import {
		reviewItemTypeEnum,
		banTypeEnum,
		reviewStatusEnum,
		BAN_CONFIG
	} from "$lib/types";
	import type { PageData } from "./$types";
	import { toast } from "svelte-sonner";
	import {
		codincodApiWebModerationControllerReviewContent,
		codincodApiWebModerationControllerResolveReport,
		codincodApiWebModerationControllerBanUser,
		codincodApiWebModerationControllerUnbanUser
	} from "@/api/generated/moderation/moderation";
	import * as Table from "$lib/components/ui/table";
	import * as Select from "$lib/components/ui/select";
	import * as Dialog from "$lib/components/ui/dialog";
	import { Textarea } from "$lib/components/ui/textarea";
	import { Label } from "$lib/components/ui/label";
	import { Input } from "$lib/components/ui/input";
	import Container from "#/ui/container/container.svelte";
	import H1 from "#/typography/h1.svelte";
	import { Button } from "#/ui/button";
	import { page } from "$app/state";
	import { formattedDateYearMonthDay } from "@/utils/date-functions";
	import { testIds } from "$lib/types";
	import Pagination from "#/nav/pagination.svelte";

	let { data }: { data: PageData } = $props();

	// Derived values for easier access
	const reviewItems = $derived(data.reviewItems);
	const reviews = $derived(reviewItems.reviews ?? []);
	const reviewCount = $derived(reviewItems.count ?? 0);

	let reviseDialogOpen = $state(false);
	let selectedPuzzleId = $state("");
	let revisionReason = $state("");

	let banDialogOpen = $state(false);
	let selectedUserId = $state("");
	let selectedUserName = $state("");
	let banReason = $state("");
	let banDuration = $state(1);
	let banType = $state<
		typeof banTypeEnum.TEMPORARY | typeof banTypeEnum.PERMANENT
	>(banTypeEnum.TEMPORARY);

	let banHistoryDialogOpen = $state(false);
	let banHistory = $state<
		Array<{
			banType: string;
			reason: string;
			startDate: string | Date;
			endDate?: string | Date | null;
			isActive: boolean;
		}>
	>([]);
	let loadingBanHistory = $state(false);

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
		},
		{
			value: reviewItemTypeEnum.REPORTED_GAME_CHAT,
			label: "Reported game chat"
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
			await codincodApiWebModerationControllerReviewContent(id, {
				status: "approved"
			});
			showSuccessNotification("Puzzle approved successfully");
			await invalidateAll();
		} catch (error) {
			showErrorNotification(error, { title: "Failed to Approve Puzzle" });
		}
	}

	function openReviseDialog(id: string) {
		selectedPuzzleId = id;
		revisionReason = "";
		reviseDialogOpen = true;
	}

	async function submitRevision() {
		if (
			!revisionReason ||
			revisionReason.length < BAN_CONFIG.reasonValidation.MIN_LENGTH
		) {
			toast.error(
				`Please provide a reason (at least ${BAN_CONFIG.reasonValidation.MIN_LENGTH} characters)`
			);
			return;
		}

		try {
			await codincodApiWebModerationControllerReviewContent(selectedPuzzleId, {
				status: "rejected",
				reviewerNotes: revisionReason
			});

			showSuccessNotification("Puzzle sent back for revisions");
			reviseDialogOpen = false;
			await invalidateAll();
		} catch (error) {
			showErrorNotification(error, { title: "Failed to Request Revisions" });
		}
	}

	async function handleResolve(
		id: string,
		status: typeof reviewStatusEnum.RESOLVED | typeof reviewStatusEnum.REJECTED
	) {
		try {
			await codincodApiWebModerationControllerResolveReport(id, {
				status: status === reviewStatusEnum.RESOLVED ? "resolved" : "dismissed"
			});

			showSuccessNotification(`Report ${status} successfully`);
			await invalidateAll();
		} catch (error) {
			showErrorNotification(error, { title: "Failed to Resolve Report" });
		}
	}

	function openBanDialog(userId: string, userName: string) {
		selectedUserId = userId;
		selectedUserName = userName;
		banReason = "";
		banDuration = 1;
		banType = banTypeEnum.TEMPORARY;
		banDialogOpen = true;
	}

	async function submitBan() {
		if (
			!banReason ||
			banReason.length < BAN_CONFIG.reasonValidation.MIN_LENGTH
		) {
			toast.error(
				`Please provide a reason (at least ${BAN_CONFIG.reasonValidation.MIN_LENGTH} characters)`
			);
			return;
		}

		try {
			await codincodApiWebModerationControllerBanUser(selectedUserId, {
				...(banType === banTypeEnum.TEMPORARY && { durationDays: banDuration }),
				reason: banReason
			});

			showSuccessNotification(
				`User ${banType === banTypeEnum.TEMPORARY ? `banned for ${banDuration} day(s)` : "permanently banned"}`
			);
			banDialogOpen = false;
			await invalidateAll();
		} catch (error) {
			showErrorNotification(error, { title: "Failed to Ban User" });
		}
	}

	async function handleUnban(userId: string, userName: string) {
		if (!confirm(`Are you sure you want to unban ${userName}?`)) {
			return;
		}

		try {
			await codincodApiWebModerationControllerUnbanUser(userId);

			showSuccessNotification("User unbanned successfully");
			await invalidateAll();
		} catch (error) {
			showErrorNotification(error, { title: "Failed to Unban User" });
		}
	}

	async function openBanHistoryDialog(userId: string, userName: string) {
		selectedUserId = userId;
		selectedUserName = userName;
		loadingBanHistory = true;
		banHistoryDialogOpen = true;

		try {
			// TODO: Implement ban history endpoint in backend
			// const data = await getBanHistory(userId);
			// banHistory = data.bans || [];
			banHistory = [];
			toast.info("Ban history feature not yet implemented in backend");
		} catch (error) {
			showErrorNotification(error, { title: "Failed to Load Ban History" });
			banHistory = [];
		} finally {
			loadingBanHistory = false;
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
			value={data.currentType ?? ""}
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
	<!-- Note: error property removed from PageData type as it's not part of the schema -->

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
				{#if reviews.length === 0}
					<Table.Row>
						<Table.Cell
							colspan={4}
							class="text-muted-foreground py-8 text-center"
						>
							No items to review
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each reviews as item}
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
								{#if data.currentType === reviewItemTypeEnum.REPORTED_GAME_CHAT && item.contextMessages}
									<div class="bg-muted/30 mt-3 rounded-lg border p-3">
										<p class="text-muted-foreground mb-2 text-xs font-semibold">
											Chat Context ({item.contextMessages.length} messages)
										</p>
										<div class="max-h-48 space-y-1 overflow-y-auto">
											{#each item.contextMessages as contextMsg}
												<div
													class={`rounded p-2 text-sm ${
														contextMsg._id === item.reportedMessageId
															? "border border-red-300 bg-red-100 dark:border-red-700 dark:bg-red-900/30"
															: "bg-background"
													}`}
												>
													<div class="flex items-baseline gap-2">
														<span class="text-xs font-medium">
															{contextMsg.username}:
														</span>
														<span
															class={contextMsg._id === item.reportedMessageId
																? "font-semibold text-red-700 dark:text-red-300"
																: ""}
														>
															{contextMsg.message}
														</span>
													</div>
												</div>
											{/each}
										</div>
										{#if item.gameId}
											<a
												href={`/game/${item.gameId}`}
												target="_blank"
												class="mt-2 inline-block text-xs text-blue-600 hover:underline dark:text-blue-400"
											>
												View Game →
											</a>
										{/if}
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
											onclick={() => handleApprove(item.id ?? "")}
											variant="default"
											size="sm"
											class="bg-green-600 hover:bg-green-700"
											data-testid={testIds.MODERATION_PAGE_BUTTON_APPROVE_PUZZLE}
										>
											Approve
										</Button>
										<Button
											onclick={() => openReviseDialog(item.id ?? "")}
											variant="default"
											size="sm"
											class="bg-yellow-600 hover:bg-yellow-700"
											data-testid={testIds.MODERATION_PAGE_BUTTON_REVISE_PUZZLE}
										>
											Revise
										</Button>
									</div>
								{:else}
									<div class="flex flex-col gap-2">
										<div class="flex gap-2">
											<Button
												onclick={() =>
													handleResolve(
														item.id ?? "",
														reviewStatusEnum.RESOLVED
													)}
												variant="default"
												size="sm"
												class="bg-blue-600 hover:bg-blue-700"
												data-testid={testIds.MODERATION_PAGE_BUTTON_RESOLVE_REPORT}
											>
												Resolve
											</Button>
											<Button
												onclick={() =>
													handleResolve(
														item.id ?? "",
														reviewStatusEnum.REJECTED
													)}
												variant="destructive"
												size="sm"
												data-testid={testIds.MODERATION_PAGE_BUTTON_REJECT_REPORT}
											>
												Reject
											</Button>
										</div>
										{#if (data.currentType === reviewItemTypeEnum.REPORTED_USER || data.currentType === reviewItemTypeEnum.REPORTED_GAME_CHAT) && item.reportedUserId}
											<div class="flex gap-2">
												<Button
													onclick={() =>
														openBanDialog(
															item.reportedUserId!,
															item.reportedUserName || "User"
														)}
													variant="default"
													size="sm"
													class="bg-orange-600 hover:bg-orange-700"
													data-testid={testIds.MODERATION_PAGE_BUTTON_BAN_USER}
												>
													Ban User
												</Button>
												<Button
													onclick={() =>
														openBanHistoryDialog(
															item.reportedUserId!,
															item.reportedUserName || "User"
														)}
													variant="outline"
													size="sm"
													data-testid={testIds.MODERATION_PAGE_BUTTON_BAN_HISTORY}
												>
													Ban History
												</Button>
											</div>
										{/if}
									</div>
								{/if}
							</Table.Cell>
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>

	<!-- Pagination removed: ReviewsListResponse doesn't include pagination data -->
	<!-- Total count display -->
	{#if reviewCount > 0}
		<div class="text-muted-foreground text-sm">
			Showing {reviewCount} review{reviewCount === 1 ? "" : "s"}
		</div>
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
					{revisionReason.length}/{BAN_CONFIG.reasonValidation.MAX_LENGTH} characters
					(minimum {BAN_CONFIG.reasonValidation.MIN_LENGTH})
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
				disabled={revisionReason.length <
					BAN_CONFIG.reasonValidation.MIN_LENGTH ||
					revisionReason.length > BAN_CONFIG.reasonValidation.MAX_LENGTH}
				data-testid={testIds.MODERATION_PAGE_BUTTON_SUBMIT_REVISION}
			>
				Submit Revision Request
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={banDialogOpen}>
	<Dialog.Content class="sm:max-w-[525px]">
		<Dialog.Header>
			<Dialog.Title>Ban User: {selectedUserName}</Dialog.Title>
			<Dialog.Description>
				Apply a ban to this user. The user will not be able to access games or
				chat while banned.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="ban-type">Ban Type</Label>
				<Select.Root
					type="single"
					value={banType}
					onValueChange={(v) => {
						if (v === banTypeEnum.TEMPORARY || v === banTypeEnum.PERMANENT) {
							banType = v;
						}
					}}
				>
					<Select.Trigger id="ban-type">
						{banType}
					</Select.Trigger>
					<Select.Content>
						{#each Object.values(banTypeEnum) as banType}
							<Select.Item value={banType}>{banType}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			{#if banType === banTypeEnum.TEMPORARY}
				<div class="grid gap-2">
					<Label for="ban-duration">Duration (days)</Label>
					<Input
						id="ban-duration"
						type="number"
						min="1"
						max="365"
						bind:value={banDuration}
					/>
					<p class="text-muted-foreground text-sm">
						Common durations: 1, 3, 7, 30 days
					</p>
				</div>
			{/if}

			<div class="grid gap-2">
				<Label for="ban-reason">Reason for ban</Label>
				<Textarea
					id="ban-reason"
					bind:value={banReason}
					placeholder="Explain why this user is being banned..."
					class="min-h-[100px]"
				/>
				<p class="text-muted-foreground text-sm">
					{banReason.length}/{BAN_CONFIG.reasonValidation.MAX_LENGTH} characters
					(minimum {BAN_CONFIG.reasonValidation.MIN_LENGTH})
				</p>
			</div>
		</div>
		<Dialog.Footer>
			<Button
				variant="outline"
				onclick={() => (banDialogOpen = false)}
				data-testid={testIds.MODERATION_PAGE_BUTTON_CANCEL_BAN}
			>
				Cancel
			</Button>
			<Button
				onclick={submitBan}
				disabled={banReason.length < BAN_CONFIG.reasonValidation.MIN_LENGTH ||
					banReason.length > BAN_CONFIG.reasonValidation.MAX_LENGTH}
				class="bg-orange-600 hover:bg-orange-700"
				data-testid={testIds.MODERATION_PAGE_BUTTON_SUBMIT_BAN}
			>
				{banType === banTypeEnum.TEMPORARY
					? `Ban for ${banDuration} day(s)`
					: "Permanently Ban"}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={banHistoryDialogOpen}>
	<Dialog.Content class="sm:max-w-[725px]">
		<Dialog.Header>
			<Dialog.Title>Ban History: {selectedUserName}</Dialog.Title>
			<Dialog.Description>
				View all bans and unbans for this user.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			{#if loadingBanHistory}
				<p class="text-muted-foreground text-center">Loading...</p>
			{:else if banHistory.length === 0}
				<p class="text-muted-foreground text-center">No ban history found</p>
			{:else}
				<div class="rounded-lg border">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Type</Table.Head>
								<Table.Head>Reason</Table.Head>
								<Table.Head>Start Date</Table.Head>
								<Table.Head>End Date</Table.Head>
								<Table.Head>Status</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each banHistory as ban}
								<Table.Row>
									<Table.Cell class="font-medium">{ban.banType}</Table.Cell>
									<Table.Cell>
										<div class="max-w-xs truncate" title={ban.reason}>
											{ban.reason}
										</div>
									</Table.Cell>
									<Table.Cell class="text-muted-foreground">
										{formattedDateYearMonthDay(ban.startDate)}
									</Table.Cell>
									<Table.Cell class="text-muted-foreground">
										{ban.endDate
											? formattedDateYearMonthDay(ban.endDate)
											: "Never"}
									</Table.Cell>
									<Table.Cell>
										{#if ban.isActive}
											<span class="font-medium text-red-600">Active</span>
										{:else}
											<span class="text-muted-foreground">Inactive</span>
										{/if}
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			{/if}
		</div>
		<Dialog.Footer>
			<Button
				variant="outline"
				onclick={() => (banHistoryDialogOpen = false)}
				data-testid={testIds.MODERATION_PAGE_BUTTON_CLOSE_HISTORY}
			>
				Close
			</Button>
			{#if banHistory.some((ban) => ban.isActive)}
				<Button
					onclick={() => {
						banHistoryDialogOpen = false;
						handleUnban(selectedUserId, selectedUserName);
					}}
					class="bg-green-600 hover:bg-green-700"
					data-testid={testIds.MODERATION_PAGE_BUTTON_UNBAN_USER}
				>
					Unban User
				</Button>
			{/if}
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
