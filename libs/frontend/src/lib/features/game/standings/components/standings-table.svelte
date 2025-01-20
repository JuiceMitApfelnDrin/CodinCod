<script lang="ts">
	import type { SubmissionDto } from "types";
	import * as Table from "$lib/components/ui/table";
	import dayjs from "dayjs";

	export let playerSubmissions: SubmissionDto[];
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
			{#each playerSubmissions as submission, i (i)}
				<Table.Row>
					<Table.Cell>{submission.userId}</Table.Cell>
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
