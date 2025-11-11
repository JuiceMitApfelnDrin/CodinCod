<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog";
	import { Textarea } from "$lib/components/ui/textarea";
	import { Label } from "$lib/components/ui/label";
	import { Button } from "$lib/components/ui/button";
	import { toast } from "svelte-sonner";
	import { REPORT_CONFIG } from "$lib/types/core/moderation/config/report-config";
	import { codincodApiWebModerationControllerCreateReport } from "@/api/generated/moderation/moderation";
	import { CreateReportRequestContentType } from "@/api/generated/schemas/createReportRequestContentType";
	import { CreateReportRequestProblemType } from "@/api/generated/schemas/createReportRequestProblemType";
	import { testIds } from "@codincod/shared/constants/test-ids";
	import type { ChatMessage } from "$lib/types/core/chat/schema/chat-message.schema";

	let {
		chatMessage,
		chatMessageId,
		gameId,
		open,
		onClose
	}: {
		chatMessage: ChatMessage | null;
		chatMessageId: string | null;
		gameId: string;
		open: boolean;
		onClose: () => void;
	} = $props();

	let reportReason = $state("");
	let isSubmitting = $state(false);

	async function submitReport() {
		if (!chatMessageId) {
			toast.error("No message selected");
			return;
		}

		if (
			!reportReason ||
			reportReason.length < REPORT_CONFIG.minLengthExplanation
		) {
			toast.error(
				`Please provide a reason (at least ${REPORT_CONFIG.minLengthExplanation} characters)`
			);
			return;
		}

		if (reportReason.length > REPORT_CONFIG.maxLengthExplanation) {
			toast.error(
				`Reason too long (max ${REPORT_CONFIG.maxLengthExplanation} characters)`
			);
			return;
		}

		isSubmitting = true;

		try {
			await codincodApiWebModerationControllerCreateReport({
				contentType: CreateReportRequestContentType.comment,
				contentId: chatMessageId,
				problemType: CreateReportRequestProblemType.inappropriate,
				description: reportReason
			});

			toast.success("Report submitted successfully");
			onClose();
			reportReason = "";
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to submit report";
			toast.error(errorMessage);
		} finally {
			isSubmitting = false;
		}
	}

	function handleClose() {
		reportReason = "";
		onClose();
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[525px]">
		<Dialog.Header>
			<Dialog.Title>Report Chat Message</Dialog.Title>
			<Dialog.Description>
				Report inappropriate or offensive chat messages. Moderators will review
				your report.
			</Dialog.Description>
		</Dialog.Header>

		{#if chatMessage}
			<div class="bg-muted rounded-md p-3">
				<div class="text-sm">
					<span class="font-semibold">{chatMessage.username}:</span>
					<span class="ml-1">{chatMessage.message}</span>
				</div>
			</div>
		{/if}

		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="report-reason">Reason for report</Label>
				<Textarea
					id="report-reason"
					bind:value={reportReason}
					placeholder="Describe why this message is inappropriate..."
					class="min-h-[100px]"
					disabled={isSubmitting}
				/>
				<p class="text-muted-foreground text-sm">
					{reportReason.length}/{REPORT_CONFIG.maxLengthExplanation} characters (minimum
					{REPORT_CONFIG.minLengthExplanation})
				</p>
			</div>
		</div>

		<Dialog.Footer>
			<Button
				variant="outline"
				onclick={handleClose}
				disabled={isSubmitting}
				data-testid={testIds.REPORT_CHAT_DIALOG_BUTTON_CANCEL}
			>
				Cancel
			</Button>
			<Button
				onclick={submitReport}
				disabled={isSubmitting ||
					reportReason.length < REPORT_CONFIG.minLengthExplanation ||
					reportReason.length > REPORT_CONFIG.maxLengthExplanation}
				data-testid={testIds.REPORT_CHAT_DIALOG_BUTTON_SUBMIT}
			>
				{isSubmitting ? "Submitting..." : "Submit Report"}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
