<script lang="ts">
	import H1 from "@/components/typography/h1.svelte";
	import type { ValidatorEntity } from "types";

	interface Props {
		validators: ValidatorEntity[];
	}

	let { validators }: Props = $props();
</script>

<H1>Test results</H1>

{#if validators.length > 0}
	<table>
		<thead>
			<tr>
				<th>Input</th>
				<th>Output</th>
			</tr>
		</thead>
		<tbody>
			{#each validators as validator}
				<tr>
					<td>{validator.input}</td>
					<td>{validator.output}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<div>Run the tests first to see some the results here!</div>
{/if}
