<script lang="ts">
	import UserHoverCard from "@/features/puzzles/components/user-hover-card.svelte";
	import { authenticatedUserInfo, isAuthenticated } from "@/stores/auth.store";
	import { cn } from "@/utils/cn";
	import dayjs from "dayjs";
	import type { ChatMessage } from "$lib/types";
	import { Button } from "@/components/ui/button";
	import Flag from "@lucide/svelte/icons/flag";
	import { testIds } from "$lib/types";

	let {
		chatMessage,
		onReport
	}: {
		chatMessage: ChatMessage;
		onReport?: (message: ChatMessage) => void;
	} = $props();

	let highlight = $state(false);
	if ($authenticatedUserInfo) {
		highlight = chatMessage.message.includes(
			"@" + $authenticatedUserInfo.username
		);
	}

	function scrollIntoView(element: HTMLElement) {
		element.scrollIntoView({ block: "nearest" });
	}

	function handleReport() {
		if (onReport && chatMessage._id) {
			onReport(chatMessage);
		}
	}

	let canReport = $derived(
		$isAuthenticated &&
			$authenticatedUserInfo &&
			chatMessage._id &&
			chatMessage.username !== $authenticatedUserInfo.username
	);
</script>

<li
	class={cn(
		"chat-message group relative w-full rounded-lg px-2 py-1",
		highlight && "highlight"
	)}
	use:scrollIntoView
>
	<dl>
		<dt class="sr-only">Time send</dt>
		<dd class="mr-1 inline opacity-60">
			<time datetime={dayjs(chatMessage.createdAt).toISOString()}
				>{dayjs(chatMessage.createdAt).format("HH:mm")}</time
			>
		</dd>
		<dt class="sr-only">Sender</dt>
		<dd class="inline">
			<UserHoverCard class="font-bold" username={chatMessage.username} />:
		</dd>
		<dt class="sr-only">Message</dt>
		<dd class="inline">
			{chatMessage.message}
		</dd>
	</dl>

	{#if canReport}
		<Button
			variant="ghost"
			size="icon"
			class="absolute top-1 right-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
			onclick={handleReport}
			title="Report message"
			data-testid={testIds.CHAT_MESSAGE_COMPONENT_BUTTON_REPORT}
		>
			<Flag class="h-3 w-3" />
		</Button>
	{/if}
</li>

<style lang="postcss">
	@reference "tailwindcss";

	.highlight {
		@apply bg-red-500/25;
	}
</style>
