<script lang="ts">
	import CodeMirror from "@/features/game/components/codemirror.svelte";
	import {
		DEFAULT_LANGUAGE,
		httpRequestMethod,
		isSubmissionDto,
		languageLabels,
		type LanguageLabel,
		type PuzzleDto,
		type ValidatorEntity
	} from "types";
	import * as Select from "$lib/components/ui/select";
	import Button from "@/components/ui/button/button.svelte";
	import { cn } from "@/utils/cn.js";
	import { calculatePuzzleResultColor } from "@/utils/calculate-puzzle-result-color.js";
	import TestProgressBar from "@/features/puzzles/components/test-progress-bar.svelte";
	import ValidatorStatus from "@/features/puzzles/components/validator-status.svelte";
	import Accordion from "@/components/ui/accordion/accordion.svelte";
	import PuzzleMetaInfo from "@/features/puzzles/components/puzzle-meta-info.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import CountdownTimer from "@/components/ui/countdown-timer/countdown-timer.svelte";
	import { currentTime } from "@/stores/current-time";
	import dayjs from "dayjs";
	import Markdown from "@/components/typography/markdown.svelte";
	import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";
	import { apiUrls, buildApiUrl } from "@/config/api";
	import { authenticatedUserInfo, isAuthenticated } from "@/stores";

	export let puzzle: PuzzleDto;
	export let puzzleId: string;
	export let onPlayerSubmitCode: (submissionId: string) => void = () => {};
	export let endDate: Date | undefined;

	let code: string = "";
	let language: LanguageLabel = DEFAULT_LANGUAGE;

	async function runSingularTestItem(itemInList: number, testInput: string, testOutput: string) {
		const response = await fetch(buildApiUrl(apiUrls.EXECUTE_CODE), {
			body: JSON.stringify({
				code,
				language,
				testInput,
				testOutput
			}),
			method: httpRequestMethod.POST
		});
		const testResult = await response.json();

		const validator = puzzle.validators?.[itemInList];

		if (validator) {
			validator.testResult = testResult;
		}

		// necessary since svelte has a weird way to do reactivity, you have to set the object that changed again, this ensures that
		puzzle = puzzle;
	}

	async function runAllTests() {
		if (puzzle.validators) {
			puzzle.validators.forEach((validator: ValidatorEntity, index: number) => {
				runSingularTestItem(index, validator.input, validator.output);
			});
		}
	}

	// let amountCorrectTests = 0;
	// $: {
	// 	amountCorrectTests = (puzzle.validators ?? []).reduce((accumulator, currentValidator) => {
	// 		return (
	// 			accumulator + Number(currentValidator.testResult?.run.result === PuzzleResultEnum.SUCCESS)
	// 		);
	// 	}, 0);
	// }

	async function endPuzzleGame() {
		if (!isAuthenticated || !$authenticatedUserInfo) {
			return;
		}

		const response = await fetch(buildApiUrl(apiUrls.SUBMIT_CODE), {
			body: JSON.stringify({
				code,
				language,
				puzzleId,
				userId: $authenticatedUserInfo.userId
			}),
			method: httpRequestMethod.POST
		});

		const submission = await response.json();

		console.log({ submission });

		if (isSubmissionDto(submission) && submission._id) {
			onPlayerSubmitCode(submission._id);
		}
	}

	let endedGame = false;
	$: {
		if (!endedGame && endDate && dayjs(endDate).isBefore($currentTime)) {
			endPuzzleGame();
			endedGame = true;
		}
	}

	let openTests = true;

	function openTestsAccordion() {
		openTests = true;
	}
</script>

<PuzzleMetaInfo {puzzle} />

<LogicalUnit>
	<Accordion open={true} id="statement">
		<h2 slot="title">Statement</h2>
		<div slot="content">
			<Markdown markdown={puzzle.statement} fallbackText="No constraints" />
		</div>
	</Accordion>

	<Accordion open={true} id="constraints">
		<h2 slot="title">Constraints</h2>
		<div slot="content">
			<Markdown markdown={puzzle.constraints} fallbackText="No constraints" />
		</div>
	</Accordion>
</LogicalUnit>

<LogicalUnit class="space-y-4">
	<LogicalUnit class="flex flex-col justify-between gap-2 md:flex-row">
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

		<CountdownTimer {endDate} />
	</LogicalUnit>

	<CodeMirror {language} bind:value={code} />

	<div class="flex flex-row justify-end gap-2">
		{#if puzzle.validators}
			<Button variant="secondary" on:click={runAllTests}
				>Run all tests
				<!-- {#if amountCorrectTests > 0}
					{`- ${amountCorrectTests}/${puzzle.validators.length} passed`}
				{/if} -->
			</Button>
		{/if}

		<Button
			variant="secondary"
			on:click={async () => {
				endPuzzleGame();
			}}
		>
			Submit code
		</Button>
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
								on:click={() => runSingularTestItem(index, validator.input, validator.output)}
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

<style lang="postcss">
	pre {
		@apply whitespace-pre-line;
	}

	h2 {
		@apply inline text-xl underline;
	}
</style>
