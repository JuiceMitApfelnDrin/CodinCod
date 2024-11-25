<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import EditPuzzleForm from "@/features/puzzles/components/edit-puzzle-form.svelte";
	import { authenticatedUserInfo, isAuthenticated } from "@/stores";
	import { isAuthor, type PuzzleDto } from "types";
	import Error from "@/components/error/error.svelte";
	import DeletePuzzleConfirmationDialog from "@/features/puzzles/components/delete-puzzle-confirmation-dialog.svelte";
	import PuzzleMetaInfo from "@/features/puzzles/components/puzzle-meta-info.svelte";
	import { getUserIdFromUser } from "@/utils/get-user-id-from-user.js";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";

	export let data;

	const { form: formData } = data;
	const puzzle: PuzzleDto = formData.data;

	let isPuzzleAuthor = false;

	const puzzleAuthorId = getUserIdFromUser(puzzle.authorId);

	if ($isAuthenticated && $authenticatedUserInfo != null) {
		isPuzzleAuthor = isAuthor(puzzleAuthorId, $authenticatedUserInfo.userId);
	}
</script>

{#if isPuzzleAuthor}
	<Container>
		<LogicalUnit class="flex flex-col md:flex-row md:items-center md:justify-between">
			<PuzzleMetaInfo {puzzle} />

			<DeletePuzzleConfirmationDialog />
		</LogicalUnit>

		<EditPuzzleForm data={formData}></EditPuzzleForm>
	</Container>
{:else}
	<Error status={401} />
{/if}
