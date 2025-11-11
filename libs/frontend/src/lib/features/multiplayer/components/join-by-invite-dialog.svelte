<script lang="ts">
	import { Button } from "@/components/ui/button";
	import * as Dialog from "@/components/ui/dialog";
	import { Input } from "@/components/ui/input";
	import { Label } from "@/components/ui/label";
	import { testIds } from "@codincod/shared/constants/test-ids";

	let {
		open = $bindable(false),
		onJoin
	}: {
		open?: boolean;
		onJoin: (inviteCode: string) => void;
	} = $props();

	let inviteCode = $state("");

	function handleJoin() {
		const code = inviteCode.trim().toUpperCase();
		if (code.length !== 6) {
			return;
		}
		onJoin(code);
		open = false;
		inviteCode = "";
	}

	function handleInputChange(e: Event) {
		const target = e.target as HTMLInputElement;
		// Only allow uppercase letters and numbers
		inviteCode = target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[400px]">
		<Dialog.Header>
			<Dialog.Title>Join Private Game</Dialog.Title>
			<Dialog.Description>
				Enter the 6-character invite code to join a private game.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="invite-code">Invite Code</Label>
				<Input
					id="invite-code"
					type="text"
					placeholder="ABC123"
					value={inviteCode}
					oninput={handleInputChange}
					maxlength={6}
					class="text-center font-mono text-2xl tracking-widest uppercase"
				/>
				<p class="text-muted-foreground text-sm">
					Code must be exactly 6 characters
				</p>
			</div>
		</div>

		<Dialog.Footer>
			<Button
				data-testid={testIds.JOIN_BY_INVITE_DIALOG_BUTTON_CANCEL}
				variant="outline"
				onclick={() => {
					open = false;
					inviteCode = "";
				}}
			>
				Cancel
			</Button>
			<Button
				data-testid={testIds.JOIN_BY_INVITE_DIALOG_BUTTON_JOIN}
				onclick={handleJoin}
				disabled={inviteCode.length !== 6}
			>
				Join Room
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
