<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import EditPuzzleForm from "@/features/puzzles/components/edit-puzzle-form.svelte";
	import { authenticatedUserInfo } from "@/stores/auth.store";
	import { getUserIdFromUser, isAuthor, isUserDto } from "$lib/types";
	import DeletePuzzleConfirmationDialog from "@/features/puzzles/components/delete-puzzle-confirmation-dialog.svelte";
	import PuzzleMetaInfo from "@/features/puzzles/components/puzzle-meta-info.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import DisplayError from "@/components/error/display-error.svelte";

	let { data } = $props();

	const { deletePuzzle: deletePuzzleFormData, form: formData } = data;
	const puzzle = formData.data;

	const puzzleAuthorId = getUserIdFromUser(puzzle.author);

	let isPuzzleAuthor = $derived(
		$authenticatedUserInfo
			? isAuthor(puzzleAuthorId, $authenticatedUserInfo.userId)
			: false
	);
</script>

<svelte:head>
	<title>Edit {puzzle.title} | CodinCod</title>
	<meta
		name="description"
		content="Build and share your coding puzzles with the world. Get feedback, iterate, and earn recognition in our developer community."
	/>
	{#if isUserDto(puzzle.author)}
		<meta name="author" content={`${puzzle.author.username}`} />
	{:else}
		<meta name="author" content="CodinCod contributors" />
	{/if}
</svelte:head>

{#if isPuzzleAuthor}
	<Container>
		<LogicalUnit
			class="flex flex-col md:flex-row md:items-center md:justify-between"
		>
			<PuzzleMetaInfo {puzzle} />

			<DeletePuzzleConfirmationDialog data={deletePuzzleFormData} />
		</LogicalUnit>

		<EditPuzzleForm data={formData}></EditPuzzleForm>
	</Container>
{:else}
	<DisplayError status={401} />
{/if}
