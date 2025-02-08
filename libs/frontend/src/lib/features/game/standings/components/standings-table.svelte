<script lang="ts">
	import * as Table from "$lib/components/ui/table";
	import dayjs from "dayjs";
	import { isSubmissionDto, isUserDto, type GameDto, type SubmissionDto } from "types";
	import duration from "dayjs/plugin/duration";
	import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";
	import { apiUrls, buildApiUrl } from "@/config/api";
	import { Button } from "@/components/ui/button";
	dayjs.extend(duration);

	export let game: GameDto;

	let playerSubmissions: SubmissionDto[];
	$: playerSubmissions = game.playerSubmissions.filter((submission) => isSubmissionDto(submission));

	$: console.log({ playerSubmissions });

	let somecode;
	async function something(id: string) {
		console.log(buildApiUrl(apiUrls.SUBMISSION_BY_ID, { id }));
		const response = await fetchWithAuthenticationCookie(
			buildApiUrl(apiUrls.SUBMISSION_BY_ID, { id })
		);
		const { code } = await response.json();
		console.log(code);
		somecode = code;
	}
</script>

<div class="rounded-md border">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>User</Table.Head>
				<Table.Head>Language</Table.Head>
				<Table.Head>Time to solve</Table.Head>
				<Table.Head>Result</Table.Head>
				<Table.Head>Code</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each playerSubmissions as { user, language, createdAt, result, _id }}
				{#if isUserDto(user)}
					<Table.Row>
						<Table.Cell>{user.username}</Table.Cell>
						<Table.Cell>{language}</Table.Cell>
						<Table.Cell>
							<!-- todo: make this more readable for screen readers somehow -->
							{dayjs.duration(dayjs(createdAt).diff(game.startTime)).format("HH:mm:ss")}
						</Table.Cell>
						<Table.Cell>{result}</Table.Cell>
						<Table.Cell
							><Button
								on:click={() => {
									if (_id) something(_id);
								}}
							>
								{somecode}
							</Button></Table.Cell
						>
					</Table.Row>
				{/if}
			{/each}
		</Table.Body>
	</Table.Root>
</div>
