<script lang="ts">
	import { preventDefault } from "svelte/legacy";

	import H2 from "@/components/typography/h2.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import Input from "@/components/ui/input/input.svelte";
	import Label from "@/components/ui/label/label.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import * as ScrollArea from "@/components/ui/scroll-area";
	import { CHAT_MESSAGE_CONFIG, type ChatMessage } from "types";
	import Message from "./chat-message.svelte";
	import { testIds } from "@/config/test-ids";

	interface Props {
		chatMessages?: ChatMessage[];
		sendMessage: (message: string) => void;
	}

	let { chatMessages = [], sendMessage }: Props = $props();

	function executeSend() {
		sendMessage(composedMessage);
		composedMessage = "";
	}

	let composedMessage: string = $state("");
</script>

<LogicalUnit class="flex h-full flex-col gap-4">
	<H2>Chat</H2>

	<ScrollArea.Root class="h-[33vh]">
		{#if chatMessages.length > 0}
			<ol class="flex h-full flex-col gap-1 rounded-lg">
				{#each chatMessages as chatMessage}
					<Message {chatMessage} />
				{/each}
			</ol>
		{/if}
	</ScrollArea.Root>

	<form class="flex flex-col justify-end gap-2 px-1" onsubmit={preventDefault(executeSend)}>
		<Label class="sr-only" for="msg-compose">Compose message</Label>
		<Input
			maxlength={CHAT_MESSAGE_CONFIG.maxChatMessageLength}
			minlength={CHAT_MESSAGE_CONFIG.minChatMessageLength}
			placeholder="message"
			id="msg-compose"
			bind:value={composedMessage}
			type="text"
		/>

		<Button
			data-testid={testIds.CHAT_COMPONENT_BUTTON_SEND_MESSAGE}
			type="submit"
			variant="outline"
			class="self-end">Send message</Button
		>
	</form>
</LogicalUnit>
