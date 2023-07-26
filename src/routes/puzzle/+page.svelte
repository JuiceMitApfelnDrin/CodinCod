<script lang="ts">
	import Instructions from '$components/Instructions.svelte';
	import MonacoEditor from '$components/MonacoEditor.svelte';
	import Tests from '$components/Tests.svelte';
	import { puzzle } from './mockpuzzledata';

	function runTests(e: MouseEvent): void {
		throw new Error('Function not implemented.');
	}
	function submit(e: MouseEvent): void {
		throw new Error('Function not implemented.');
	}

	const tabs = {
		instructions: 'instructions',
		tests: 'test'
	};

	let currentTab = tabs.instructions;
</script>

<div class="flex flex-col container m-auto pt-5">
	<div class="flex flex-col md:flex-row gap-5">
		<div class="w-full">
			<ul class="tabs">
				{#each Object.values(tabs) as tab}
					<li>
						<button class="button" on:click={() => (currentTab = tab)}>{tab}</button>
					</li>
				{/each}
			</ul>

			{#if currentTab === tabs.instructions}
				<Instructions {puzzle} />
			{:else if currentTab === tabs.tests}
				<Tests validators={puzzle.validators} />
			{/if}
		</div>

		<!-- TODO: make the 2 here adjustable in size -->

		<div class="flex flex-col gap-5 w-full">
			<MonacoEditor />

			<!-- not sure if the run tests and the submit will remain here, but put them here for now -->
			<div class="flex flex-row gap-5">
				<button class="button" on:click={runTests}>run tests</button>
				<button class="button" on:click={submit}>submit</button>
			</div>
		</div>
	</div>
</div>
