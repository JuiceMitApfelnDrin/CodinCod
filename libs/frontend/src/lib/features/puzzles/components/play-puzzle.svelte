<script lang="ts">
	import CodeMirror from "@/features/game/components/codemirror.svelte";
	import {
		httpRequestMethod,
		isSubmissionDto,
		type PuzzleDto,
		type PuzzleLanguage,
		type CodeSubmissionParams,
		type ValidatorEntity
	} from "types";
	import * as Select from "$lib/components/ui/select";
	import Button from "@/components/ui/button/button.svelte";
	import { cn } from "@/utils/cn.js";
	import { calculatePuzzleResultColor } from "@/features/puzzles/utils/calculate-puzzle-result-color.js";
	import TestProgressBar from "@/features/puzzles/components/test-progress-bar.svelte";
	import ValidatorStatus from "@/features/puzzles/components/validator-status.svelte";
	import Accordion from "@/components/ui/accordion/accordion.svelte";
	import PuzzleMetaInfo from "@/features/puzzles/components/puzzle-meta-info.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import CountdownTimer from "@/components/ui/countdown-timer/countdown-timer.svelte";
	import { currentTime } from "@/stores/current-time";
	import dayjs from "dayjs";
	import Markdown from "@/components/typography/markdown.svelte";
	import { apiUrls, buildApiUrl } from "@/config/api";
	import { authenticatedUserInfo, isAuthenticated } from "@/stores";
	import { fetchSupportedLanguages } from "@/utils/fetch-supported-languages";
	import { onMount } from "svelte";
	import ScrollArea from "@/components/ui/scroll-area/scroll-area.svelte";

	export let puzzle: PuzzleDto;
	export let puzzleId: string;
	export let onPlayerSubmitCode: (submissionId: string) => void = () => {};
	export let endDate: Date | undefined;

	let languages: PuzzleLanguage[] = [];
	let code: string = "";
	let language: PuzzleLanguage = "";
	let isExecutingTests = false;
	let isSubmittingCode = false;

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

	async function patience() {
		// little timeout has never hurt anyone, also indicates better that something actually happened, system is too fast otherwise
		return new Promise((resolve) => setTimeout(resolve, 500));
	}

	async function runAllTests() {
		if (puzzle.validators) {
			isExecutingTests = true;

			const convertToPromises = puzzle.validators.map(
				(validator: ValidatorEntity, index: number) => {
					runSingularTestItem(index, validator.input, validator.output);
				}
			);

			await Promise.all([...convertToPromises, patience()]).then(() => {
				isExecutingTests = false;
			});
		}
	}

	async function endPuzzleGame() {
		if (!isAuthenticated || !$authenticatedUserInfo) {
			return;
		}

		isSubmittingCode = true;

		const submissionParams: CodeSubmissionParams = {
			code,
			language,
			puzzleId,
			userId: $authenticatedUserInfo.userId
		};

		const response = await fetch(buildApiUrl(apiUrls.SUBMIT_CODE), {
			body: JSON.stringify(submissionParams),
			method: httpRequestMethod.POST
		});

		const submission = await response.json();

		if (isSubmissionDto(submission) && submission._id) {
			onPlayerSubmitCode(submission._id);
		}

		await patience();

		isSubmittingCode = false;
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

	async function fetchLanguages() {
		languages = await fetchSupportedLanguages();

		const defaultLanguage = languages[0];
		language = defaultLanguage;
	}

	onMount(() => {
		fetchLanguages();
	});
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
				<ScrollArea class="h-40">
					<Select.Label class="text-lg">Language</Select.Label>
					<Select.Separator />

					<Select.Group>
						{#each languages as language}
							<Select.Item value={language} label={language} />
						{/each}
					</Select.Group>
				</ScrollArea>
			</Select.Content>
			<Select.Input bind:value={language} />
		</Select.Root>

		<CountdownTimer {endDate} />
	</LogicalUnit>

	<CodeMirror {language} bind:value={code} />

	<div class="flex flex-row justify-end gap-2">
		{#if puzzle.validators}
			<Button
				variant="secondary"
				aria-live="polite"
				on:click={runAllTests}
				disabled={isExecutingTests || isSubmittingCode}
				class={cn((isExecutingTests || isSubmittingCode) && "animate-pulse")}
			>
				Run all tests
			</Button>
		{/if}

		<Button
			variant="secondary"
			disabled={isSubmittingCode}
			class={cn(isSubmittingCode && "animate-pulse")}
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
								"w-full space-y-4 rounded-lg border-2 p-4 md:p-8 lg:space-y-8"
							)}
							id={`validator-${index}`}
						>
							<div class="flex flex-col gap-4 lg:flex-row lg:gap-8">
								<LogicalUnit class="w-full space-y-2 lg:max-w-[50%]">
									<h3 class="text-lg font-semibold">Input</h3>

									<div class="max-h-[20vh] w-full overflow-scroll rounded-lg border p-4">
										<pre><code>{validator.input.trimEnd()}</code></pre>
									</div>
								</LogicalUnit>

								<LogicalUnit class="w-full space-y-2 lg:max-w-[50%]">
									<h3 class="text-lg font-semibold">Expected output</h3>

									<div class="max-h-[20vh] w-full overflow-scroll rounded-lg border p-4">
										<pre><code>{validator.output.trimEnd()}</code></pre>
									</div>
								</LogicalUnit>
							</div>

							{#if validator.testResult}
								<div class="flex flex-col gap-4 lg:gap-6">
									<h3 class="text-xl font-semibold">Latest result</h3>

									<LogicalUnit class="w-full space-y-2">
										<h4 class="font-bold">Stdout:</h4>

										<div
											class="max-h-[20vh] w-full overflow-scroll rounded-lg border p-4 lg:max-w-full"
										>
											<pre><code>{validator.testResult?.run.stdout}</code></pre>
										</div>
									</LogicalUnit>

									<LogicalUnit class="w-full space-y-2">
										<h4 class="font-bold">Stderr:</h4>

										<div
											class="max-h-[20vh] w-full overflow-scroll rounded-lg border p-4 lg:max-w-full"
										>
											<pre><code>{validator.testResult?.run.stderr}</code></pre>
										</div>
									</LogicalUnit>
								</div>
							{/if}

							<Button
								variant="secondary"
								aria-live="polite"
								disabled={isExecutingTests || isSubmittingCode}
								class={cn((isExecutingTests || isSubmittingCode) && "animate-pulse")}
								on:click={() => {
									isExecutingTests = true;

									Promise.all([
										runSingularTestItem(index, validator.input, validator.output),
										patience()
									]).then(() => {
										isExecutingTests = false;
									});
								}}
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
	h2 {
		@apply inline text-xl underline;
	}
</style>
