<script lang="ts">
	import { buttonVariants } from "@/components/ui/button";
	import Button from "@/components/ui/button/button.svelte";
	import * as Dialog from "@/components/ui/dialog";
	import { authenticatedUserInfo } from "@/stores";
	import { GameEventEnum } from "types";

	export let socket: WebSocket;
	export let gameId: string;
</script>

<Dialog.Root>
	<Dialog.Trigger type="button" class={buttonVariants({ variant: "outline" })}>
		Would you like to join this ongoing game?
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Are you absolutely sure?</Dialog.Title>
			<Dialog.Description>
				Upon joining this rated game, you may potentially lose elo.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button
				on:click={() =>
					socket.send(
						JSON.stringify({
							event: GameEventEnum.JOIN_GAME,
							gameId: gameId,
							username: $authenticatedUserInfo?.username,
							userId: $authenticatedUserInfo?.userId
						})
					)}
			>
				Join game
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
