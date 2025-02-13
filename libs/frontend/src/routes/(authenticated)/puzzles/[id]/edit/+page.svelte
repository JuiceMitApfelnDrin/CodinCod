<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import EditPuzzleForm from "@/features/puzzles/components/edit-puzzle-form.svelte";
	import { authenticatedUserInfo, isAuthenticated } from "@/stores";
	import { getUserIdFromUser, isAuthor, type PuzzleDto } from "types";
	import DeletePuzzleConfirmationDialog from "@/features/puzzles/components/delete-puzzle-confirmation-dialog.svelte";
	import PuzzleMetaInfo from "@/features/puzzles/components/puzzle-meta-info.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import DisplayError from "@/components/error/display-error.svelte";

	export let data;

	const { deletePuzzle: deletePuzzleFormData, form: formData } = data;
	const puzzle: PuzzleDto = formData.data;

	let isPuzzleAuthor = false;

	const puzzleAuthorId = getUserIdFromUser(puzzle.author);

	if ($isAuthenticated && $authenticatedUserInfo != null) {
		isPuzzleAuthor = isAuthor(puzzleAuthorId, $authenticatedUserInfo.userId);
	}
</script>

{#if isPuzzleAuthor}
	<Container>
		<LogicalUnit class="flex flex-col md:flex-row md:items-center md:justify-between">
			<PuzzleMetaInfo {puzzle} />

			<DeletePuzzleConfirmationDialog data={deletePuzzleFormData} />
		</LogicalUnit>

		<EditPuzzleForm data={formData}></EditPuzzleForm>
	</Container>
{:else}
	<DisplayError status={401} />
{/if}
