<script lang="ts">
	import * as Table from "$lib/components/ui/table";
	import dayjs from "dayjs";
	import { isSubmissionDto, isUserDto, type GameDto, type SubmissionDto } from "types";

	export let game: GameDto;

	let playerSubmissions: SubmissionDto[];
	$: playerSubmissions = game.playerSubmissions.filter((submission) => isSubmissionDto(submission));
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
				{#if isUserDto(submission.user)}
					<Table.Row>
						<Table.Cell>{submission.user.username}</Table.Cell>
						<Table.Cell>{submission.language}</Table.Cell>
						<Table.Cell>
							{new Intl.DateTimeFormat("en-uk").format(dayjs(submission.createdAt).toDate())}
						</Table.Cell>
						<Table.Cell>{submission.result}</Table.Cell>
					</Table.Row>
				{/if}
			{/each}
		</Table.Body>
	</Table.Root>
</div>
