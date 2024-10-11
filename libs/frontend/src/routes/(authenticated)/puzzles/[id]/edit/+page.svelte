<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import EditPuzzleForm from "@/features/puzzles/components/edit-puzzle-form.svelte";
	import { authenticatedUserInfo, isAuthenticated } from "@/stores";
	import { isAuthor, type PuzzleDto } from "types";
	import Error from "@/components/error/error.svelte";
	import DeletePuzzleConfirmationDialog from "@/features/puzzles/components/delete-puzzle-confirmation-dialog.svelte";
	import Separator from "@/components/ui/separator/separator.svelte";
	import { formattedDateYearMonthDay } from "@/utils/date-functions.js";

	export let data;

	const puzzle: PuzzleDto = data.form.data;

	const puzzleAuthorId =
		typeof puzzle.authorId === "string" ? puzzle.authorId : puzzle.authorId._id;
</script>

{#if $isAuthenticated && $authenticatedUserInfo != null && puzzleAuthorId && isAuthor(puzzleAuthorId, $authenticatedUserInfo?.userId)}
	<Container class="h-full gap-2">
		<div class="flex flex-col md:flex-row md:items-center md:justify-between">
			<div class="my-8 flex flex-col gap-2">
				<H1 class="pb-0">Edit your puzzle</H1>

				<dl class="flex gap-1 text-xs text-gray-400 lg:flex-row dark:text-gray-600">
					<dt class="font-semibold">Created on</dt>
					<dd>
						{formattedDateYearMonthDay(puzzle.createdAt)}
					</dd>

					{#if puzzle.updatedAt !== puzzle.createdAt}
						<Separator orientation="vertical" />

						<dt class="font-semibold">Updated on</dt>
						<dd>
							{formattedDateYearMonthDay(puzzle.updatedAt)}
						</dd>
					{/if}
				</dl>
			</div>

			{#if $isAuthenticated && $authenticatedUserInfo != null && puzzle.authorId._id && isAuthor(puzzle.authorId._id, $authenticatedUserInfo?.userId)}
				<div class="flex flex-col gap-2 md:flex-row md:gap-4">
					<DeletePuzzleConfirmationDialog />
				</div>
			{/if}
		</div>

		<EditPuzzleForm {data}></EditPuzzleForm>
	</Container>
{:else}
	<Error status={401} />
{/if}
