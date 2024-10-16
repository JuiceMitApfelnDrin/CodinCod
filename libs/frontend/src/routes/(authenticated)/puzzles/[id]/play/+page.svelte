<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import CodeMirror from "@/features/game/components/codemirror.svelte";
	import { buildBackendUrl } from "@/config/backend.js";
	import { backendUrls, DEFAULT_LANGUAGE, languageLabels, POST, type LanguageLabel } from "types";
	import * as Select from "$lib/components/ui/select";
	import Button from "@/components/ui/button/button.svelte";
	import { page } from "$app/stores";
	import { cn } from "@/utils/cn.js";
	import { calculatePuzzleResultColor } from "@/utils/calculate-puzzle-result-color.js";
	import TestProgressBar from "@/features/puzzles/components/test-progress-bar.svelte";
	import ValidatorStatus from "@/features/puzzles/components/validator-status.svelte";
	import Accordion from "@/components/ui/accordion/accordion.svelte";
	import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie.js";
	import PuzzleMetaInfo from "@/features/puzzles/components/puzzle-meta-info.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";

	let puzzleId = $page.params.id;

	export let data;

	let { puzzle } = data;

	let code: string = "";
	let language: LanguageLabel = DEFAULT_LANGUAGE;

	async function executeCode(itemInList: number, testInput: string, testOutput: string) {
		const response = await fetchWithAuthenticationCookie(buildBackendUrl(backendUrls.EXECUTE), {
			body: JSON.stringify({
				code,
				language,
				testInput,
				testOutput
			}),
			headers: {
				"Content-Type": "application/json"
			},
			method: POST
		});
		const testResult = await response.json();

		const validator = puzzle.validators?.[itemInList];

		if (validator) {
			validator.testResult = testResult;
		}

		// necessary since svelte has a weird way to do reactivity, you have to set the object that changed again, this ensures that
		puzzle = puzzle;
	}

	async function submitCode() {
		await fetchWithAuthenticationCookie(buildBackendUrl(backendUrls.SUBMISSION), {
			body: JSON.stringify({
				code,
				language,
				puzzleId
			}),
			headers: {
				"Content-Type": "application/json"
			},
			method: POST
		});
	}

	async function runAllTests() {
		if (puzzle.validators) {
			puzzle.validators.forEach((validator, index) => {
				executeCode(index, validator.input, validator.output);
			});
		}
	}

	let openTests = true;

	function openTestsAccordion() {
		openTests = true;
	}
</script>

<!-- {#if puzzle} -->
<Container>
	<PuzzleMetaInfo {puzzle} />

	<LogicalUnit>
		<Accordion open={true} id="statement">
			<h2 slot="title">Statement</h2>
			<p slot="content">
				{puzzle.statement}
			</p>
		</Accordion>

		<Accordion open={true} id="constraints">
			<h2 slot="title">Constraints</h2>
			<p slot="content">
				{puzzle.constraints}
			</p>
		</Accordion>
	</LogicalUnit>

	<LogicalUnit class="space-y-4">
		<Select.Root
			selected={{ label: language, value: language }}
			onSelectedChange={(v) => {
				if (v) {
					language = v.value;
				}
			}}
		>
			<Select.Trigger class="w-[180px]">
				<Select.Value placeholder="Select a language" />
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.Label class="text-lg">Language</Select.Label>
					{#each languageLabels as language}
						<Select.Item value={language} label={language} />
					{/each}
				</Select.Group>
			</Select.Content>
			<Select.Input bind:value={language} />
		</Select.Root>

		<CodeMirror {language} bind:value={code} />

		<div class="flex flex-row justify-end gap-2">
			{#if puzzle.validators}
				<Button variant="secondary" on:click={runAllTests}>Run all tests</Button>
			{/if}
			<Button variant="secondary" on:click={submitCode}>Submit code</Button>
		</div>
	</LogicalUnit>

	{#if puzzle.validators}
		<LogicalUnit>
			<TestProgressBar {openTestsAccordion} validators={puzzle.validators} class="my-7" />

			<Accordion bind:open={openTests} id="tests">
				<h2 slot="title">Tests</h2>
				<ul class="flex flex-col gap-10" slot="content">
					{#each puzzle.validators as validator, index}
						<li class="relative">
							<div
								class={cn(
									calculatePuzzleResultColor(validator.testResult?.run.result),
									"w-full space-y-8 rounded-lg border-2 p-4"
								)}
								id={`validator-${index}`}
							>
								<div class="lg:flex">
									<div class="space-y-2 lg:w-1/2">
										<h3 class="text-lg font-semibold">Input</h3>
										<pre>
									{validator.input.trim()}
								</pre>
									</div>
									<div class="space-y-2 lg:w-1/2">
										<h3 class="text-lg font-semibold">Expected output</h3>
										<pre>
									{validator.output}
								</pre>
									</div>
								</div>

								{#if validator.testResult}
									<div class="space-y-2">
										<h3 class="text-lg font-semibold">Latest result</h3>
										<div class="lg:w-1/2">
											<h4 class="font-bold">Stdout:</h4>
											<pre>{validator.testResult?.run.stdout}</pre>
										</div>
										<div class="lg:w-1/2">
											<h4 class="font-bold">Stderr:</h4>
											<pre>{validator.testResult?.run.stderr}</pre>
										</div>
									</div>
								{/if}

								<Button
									variant="secondary"
									on:click={() => executeCode(index, validator.input, validator.output)}
								>
									Run code
								</Button>
							</div>

							{#if validator.testResult}
								<ValidatorStatus class="absolute right-0 top-0 mr-4 mt-4 p-0" {validator} />
							{/if}
						</li>
					{/each}
				</ul>
			</Accordion>
		</LogicalUnit>
	{/if}
</Container>

<style>
	pre {
		@apply whitespace-pre-line;
	}

	h2 {
		@apply inline text-xl underline;
	}
</style>
