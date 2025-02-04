<script lang="ts">
	import * as Table from "$lib/components/ui/table";
	import dayjs from "dayjs";
	import { isSubmissionDto, isUserDto, type GameDto } from "types";

	export let game: GameDto;

	let playerSubmissions;
	$: playerSubmissions =
		game.playerSubmissions?.filter((submission) => isSubmissionDto(submission)) ?? [];
</script>

<div class="rounded-md border">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>User</Table.Head>
				<Table.Head>Language</Table.Head>
				<Table.Head>Submitted at</Table.Head>
				<Table.Head>Result</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each playerSubmissions as submission}
				<Table.Row>
					<Table.Cell
						>{isUserDto(submission.userId)
							? submission.userId.username
							: submission.userId}</Table.Cell
					>
					<Table.Cell>{submission.language}</Table.Cell>
					<Table.Cell>
						{new Intl.DateTimeFormat("en-uk").format(dayjs(submission.createdAt).toDate())}
					</Table.Cell>
					<Table.Cell>{submission.result}</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
