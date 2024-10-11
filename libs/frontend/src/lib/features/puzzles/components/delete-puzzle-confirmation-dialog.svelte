<script>
	import { page } from "$app/stores";
	import { deletePuzzle } from "@/api/delete-puzzle";
	import { buttonVariants } from "@/components/ui/button";
	import Button from "@/components/ui/button/button.svelte";
	import * as Dialog from "@/components/ui/dialog";
</script>

<Dialog.Root>
	<Dialog.Trigger type="button" class={buttonVariants({ variant: "destructive" })}>
		Delete Puzzle
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Are you absolutely sure?</Dialog.Title>
			<Dialog.Description>
				This action cannot be undone. This will permanently delete your puzzle and remove this
				puzzle from our servers.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="secondary">Cancel action</Button>
			<Button variant="destructive" on:click={() => deletePuzzle($page.params.id)}>
				Delete puzzle
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
