<script lang="ts">
	import { preventDefault } from "svelte/legacy";
	import H2 from "@/components/typography/h2.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import Input from "@/components/ui/input/input.svelte";
	import Label from "@/components/ui/label/label.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import * as ScrollArea from "@/components/ui/scroll-area";
	import { testIds } from "@/config/test-ids";

	type ChatMessage = {
		username: string;
		message: string;
		timestamp: Date;
	};

	let {
		chatMessages = [],
		sendMessage,
		currentUsername
	}: {
		chatMessages?: ChatMessage[];
		sendMessage: (message: string) => void;
		currentUsername: string;
	} = $props();

	let composedMessage = $state("");

	function executeSend() {
		if (composedMessage.trim().length === 0) return;
		
		sendMessage(composedMessage.trim());
		composedMessage = "";
	}

	function formatTime(timestamp: Date): string {
		const date = new Date(timestamp);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
</script>

<LogicalUnit class="flex h-full flex-col gap-4">
	<H2>Chat</H2>

	<ScrollArea.Root class="h-[33vh] rounded-lg border bg-muted/30 p-3">
		{#if chatMessages.length > 0}
			<ol class="flex h-full flex-col gap-2">
				{#each chatMessages as chatMessage}
					<li
						class="flex flex-col gap-1 rounded-md px-2 py-1.5 {chatMessage.username === currentUsername
							? 'bg-primary/10'
							: 'bg-background/50'}"
					>
						<div class="flex items-baseline justify-between gap-2">
							<span class="text-sm font-semibold {chatMessage.username === currentUsername ? 'text-primary' : ''}">
								{chatMessage.username}
							</span>
							<span class="text-xs text-muted-foreground">
								{formatTime(chatMessage.timestamp)}
							</span>
						</div>
						<p class="text-sm break-words">{chatMessage.message}</p>
					</li>
				{/each}
			</ol>
		{:else}
			<div class="flex h-full items-center justify-center">
				<p class="text-sm text-muted-foreground">No messages yet. Start chatting!</p>
			</div>
		{/if}
	</ScrollArea.Root>

	<form
		class="flex flex-col justify-end gap-2 px-1"
		onsubmit={preventDefault(executeSend)}
	>
		<Label class="sr-only" for="msg-compose">Compose message</Label>
		<Input
			maxlength={500}
			minlength={1}
			placeholder="Type a message..."
			id="msg-compose"
			bind:value={composedMessage}
			type="text"
		/>

		<Button
			data-testid={testIds.WAITING_ROOM_CHAT_BUTTON_SEND}
			type="submit"
			variant="outline"
			class="self-end"
			disabled={composedMessage.trim().length === 0}
		>
			Send
		</Button>
	</form>
</LogicalUnit>
