<script lang="ts">
	import { createTable, Render, Subscribe } from "svelte-headless-table";
	import { readable } from "svelte/store";
	import type { SubmissionDto } from "types";
	import * as Table from "$lib/components/ui/table";
	import dayjs from "dayjs";

	export let playerSubmissions: SubmissionDto[];

	const table = createTable(readable(playerSubmissions));

	const columns = table.createColumns([
		table.column({
			accessor: "userId",
			header: "User"
		}),
		table.column({
			accessor: "createdAt",
			header: "Submitted at",
			cell: ({ value }) => {
				return new Intl.DateTimeFormat("en-uk").format(dayjs(value).toDate());
			}
		}),
		table.column({
			accessor: "result",
			header: "Result"
		})
		// table.column({
		// 	accessor: ({ _id }) => _id,
		// 	header: ""
		// })
	]);

	console.log(playerSubmissions);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs } = table.createViewModel(columns);
</script>

<div class="rounded-md border">
	<Table.Root {...$tableAttrs}>
		<Table.Header>
			{#each $headerRows as headerRow}
				<Subscribe rowAttrs={headerRow.attrs()}>
					<Table.Row>
						{#each headerRow.cells as cell (cell.id)}
							<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()}>
								<Table.Head {...attrs}>
									<Render of={cell.render()} />
								</Table.Head>
							</Subscribe>
						{/each}
					</Table.Row>
				</Subscribe>
			{/each}
		</Table.Header>
		<Table.Body {...$tableBodyAttrs}>
			{#each $pageRows as row (row.id)}
				<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
					<Table.Row {...rowAttrs}>
						{#each row.cells as cell (cell.id)}
							<Subscribe attrs={cell.attrs()} let:attrs>
								<Table.Cell {...attrs}>
									<Render of={cell.render()} />
								</Table.Cell>
							</Subscribe>
						{/each}
					</Table.Row>
				</Subscribe>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
