<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog";
	import { Textarea } from "$lib/components/ui/textarea";
	import { Label } from "$lib/components/ui/label";
	import { Button } from "$lib/components/ui/button";
	import { toast } from "svelte-sonner";
	import { httpRequestMethod, REPORT_CONFIG, ProblemTypeEnum } from "types";
	import { buildBackendUrl } from "@/config/backend";
	import { backendUrls } from "types";
	import { testIds } from "types";
	import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";
	import type { ChatMessage } from "types";

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
			const response = await fetchWithAuthenticationCookie(
				buildBackendUrl(backendUrls.REPORT),
				{
					method: httpRequestMethod.POST,
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify({
						problematicIdentifier: chatMessageId,
						problemType: ProblemTypeEnum.GAME_CHAT,
						explanation: reportReason
					})
				}
			);

			if (!response.ok) {
				throw new Error("Failed to submit report");
			}

			toast.success(
				"Report submitted successfully. Moderators will review it."
			);
			reportReason = "";
			onClose();
		} catch (error) {
			console.error("Error submitting report:", error);
			toast.error("Failed to submit report. Please try again.");
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
