<script lang="ts">
	import * as Table from "$lib/components/ui/table";
	import dayjs from "dayjs";
	import { isSubmissionDto, isUserDto, type GameDto, type SubmissionDto } from "types";
	import duration from "dayjs/plugin/duration";
	dayjs.extend(duration);

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
				<Table.Head>Time to solve</Table.Head>
				<Table.Head>Result</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each playerSubmissions as { user, language, createdAt, result }}
				{#if isUserDto(user)}
					<Table.Row>
						<Table.Cell>{user.username}</Table.Cell>
						<Table.Cell>{language}</Table.Cell>
						<Table.Cell>
							<!-- todo: make this more readable for screen readers somehow -->
							{dayjs.duration(dayjs(createdAt).diff(game.startTime)).format("HH:mm:ss")}
						</Table.Cell>
						<Table.Cell>{result}</Table.Cell>
					</Table.Row>
				{/if}
			{/each}
		</Table.Body>
	</Table.Root>
</div>
