<script lang="ts">
	import UserHoverCard from "@/features/puzzles/components/user-hover-card.svelte";
	import { authenticatedUserInfo } from "@/stores";
	import { cn } from "@/utils/cn";
	import dayjs from "dayjs";
	import type { ChatMessage } from "types";

	interface Props {
		chatMessage: ChatMessage;
	}

	let { chatMessage }: Props = $props();

	let highlight = $state(false);
	if ($authenticatedUserInfo) {
		highlight = chatMessage.message.includes("@" + $authenticatedUserInfo.username);
	}

	function scrollIntoView(element: HTMLElement) {
		element.scrollIntoView({ block: "nearest" });
	}
</script>

<li
	class={cn("chat-message w-full rounded-lg px-2 py-1", highlight && "highlight")}
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
		<!-- <EllipsisVertical
class="inline"
/> report player button -->
	</dl>
</li>

<style lang="postcss">
	.highlight {
		@apply bg-red-500 bg-opacity-25;
	}
</style>
