<script lang="ts">
	import Instructions from "../../lib/components/instructions.svelte";
	import MonacoEditor from "../../lib/components/monacoEditor.svelte";
	import Tests from "../../lib/components/tests.svelte";

	function runTests(e: MouseEvent): void {
		throw new Error("Function not implemented.");
	}
	function submit(e: MouseEvent): void {
		throw new Error("Function not implemented.");
	}

	const tabs = {
		instructions: "instructions",
		tests: "test"
	};

	let currentTab = tabs.instructions;
</script>

<div class="container m-auto flex flex-col pt-5">
	<div class="flex flex-col gap-5 md:flex-row">
		<div class="w-full">
			<ul class="tabs">
				{#each Object.values(tabs) as tab}
					<li>
						<button class="button" on:click={() => (currentTab = tab)}>{tab}</button>
					</li>
				{/each}
			</ul>

			<!-- {#if currentTab === tabs.instructions}
				<Instructions {puzzle} />
			{:else if currentTab === tabs.tests}
				<Tests validators={puzzle.validators} />
			{/if} -->
		</div>

		<!-- TODO: make the 2 here adjustable in size -->

		<div class="flex w-full flex-col gap-5">
			<MonacoEditor />

			<!-- not sure if the run tests and the submit will remain here, but put them here for now -->
			<div class="flex flex-row gap-5">
				<button class="button" on:click={runTests}>run tests</button>
				<button class="button" on:click={submit}>submit</button>
			</div>
		</div>
	</div>
</div>
