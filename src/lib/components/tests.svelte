<script lang="ts">
	import type { Validator } from "../models/puzzle.model";

	export let validators: Validator[];
</script>

<H1>Test results</H1>
{#if validators.length > 0}
	<table>
		<tr>
			<th>Input</th>
			<th>Output</th>
		</tr>
		{#each validators as validator}
			<tr>
				<td>{validator.input}</td>
				<td>{validator.output}</td>
			</tr>
		{/each}
	</table>
{:else}
	<div>Run the tests first to see some the results here!</div>
{/if}
