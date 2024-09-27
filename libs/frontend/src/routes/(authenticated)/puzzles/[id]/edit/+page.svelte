<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import EditPuzzleForm from "@/features/puzzles/components/edit-puzzle-form.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import { deletePuzzle } from "@/features/puzzles/api/delete-puzzle";
	import { authenticatedUserInfo, isAuthenticated } from "@/stores";
	import { isAuthor, type PuzzleDto } from "types";
	import { page } from "$app/stores";
	import * as Menubar from "@/components/ui/menubar";
	import { Settings } from "lucide-svelte";
	import Error from "@/components/error/error.svelte";

	export let data;

	const puzzle: PuzzleDto = data.form.data;

	const puzzleAuthorId =
		typeof puzzle.authorId === "string" ? puzzle.authorId : puzzle.authorId._id;
</script>

{#if $isAuthenticated && $authenticatedUserInfo != null && puzzleAuthorId && isAuthor(puzzleAuthorId, $authenticatedUserInfo?.userId)}
	<Container class="h-full gap-4">
		<div class="flex items-center justify-between">
			<H1>Edit your puzzle</H1>

			<Menubar.Root>
				<Menubar.Menu closeOnItemClick={false}>
					<Menubar.Trigger><Settings class="h-4 w-4" /></Menubar.Trigger>
					<Menubar.Content>
						<Menubar.Item>
							<Button
								type="button"
								on:click={() => deletePuzzle($page.params.id)}
								variant="destructive"
							>
								Delete Puzzle
							</Button>
						</Menubar.Item>
					</Menubar.Content>
				</Menubar.Menu>
			</Menubar.Root>
		</div>

		<EditPuzzleForm {data}></EditPuzzleForm>
	</Container>
{:else}
	<Error status={401} />
{/if}
