<script lang="ts">
	import { preventDefault } from "svelte/legacy";

	import H2 from "@/components/typography/h2.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import Input from "@/components/ui/input/input.svelte";
	import Label from "@/components/ui/label/label.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import * as ScrollArea from "@/components/ui/scroll-area";
	import type { ChatMessage } from "$lib/types/core/chat/schema/chat-message.schema.js";
	import { testIds } from "@codincod/shared/constants/test-ids";
	import { CHAT_MESSAGE_CONFIG } from "$lib/types/core/chat/config/chat-message-config.js";
	import Message from "./chat-message.svelte";
	import ReportChatDialog from "./report-chat-dialog.svelte";

	let {
		chatMessages = [],
		sendMessage,
		gameId
	}: {
		chatMessages?: ChatMessage[];
		sendMessage: (message: string) => void;
		gameId: string;
	} = $props();

	function executeSend() {
		sendMessage(composedMessage);
		composedMessage = "";
	}

	let composedMessage: string = $state("");

	// Report dialog state
	let reportDialogOpen = $state(false);
	let selectedMessage: ChatMessage | null = $state(null);

	function handleReportMessage(message: ChatMessage) {
		selectedMessage = message;
		reportDialogOpen = true;
	}

	function closeReportDialog() {
		reportDialogOpen = false;
		selectedMessage = null;
	}
</script>

<LogicalUnit class="flex h-full flex-col gap-4">
	<H2>Chat</H2>

	<ScrollArea.Root
		class="h-[33vh]"
		data-testid={testIds.CHAT_COMPONENT_MESSAGES_CONTAINER}
	>
		{#if chatMessages.length > 0}
			<ol class="flex h-full flex-col gap-1 rounded-lg">
				{#each chatMessages as chatMessage}
					<Message {chatMessage} onReport={handleReportMessage} />
				{/each}
			</ol>
		{/if}
	</ScrollArea.Root>

	<form
		class="flex flex-col justify-end gap-2 px-1"
		onsubmit={preventDefault(executeSend)}
	>
		<Label class="sr-only" for="msg-compose">Compose message</Label>
		<Input
			maxlength={CHAT_MESSAGE_CONFIG.maxChatMessageLength}
			minlength={CHAT_MESSAGE_CONFIG.minChatMessageLength}
			placeholder="message"
			id="msg-compose"
			bind:value={composedMessage}
			type="text"
			data-testid={testIds.CHAT_COMPONENT_INPUT_MESSAGE}
		/>

		<Button
			data-testid={testIds.CHAT_COMPONENT_BUTTON_SEND_MESSAGE}
			type="submit"
			variant="outline"
			class="self-end">Send message</Button
		>
	</form>
</LogicalUnit>

<ReportChatDialog
	chatMessage={selectedMessage}
	chatMessageId={selectedMessage?._id || null}
	{gameId}
	open={reportDialogOpen}
	onClose={closeReportDialog}
/>
