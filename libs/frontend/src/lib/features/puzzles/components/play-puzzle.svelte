<script lang="ts">
	import CodeMirror from "@/features/game/components/codemirror.svelte";
	import {
		httpRequestMethod,
		isSubmissionDto,
		type PuzzleDto,
		type PuzzleLanguage,
		type CodeSubmissionParams,
		type ValidatorEntity,
		type CodeExecutionResponse,
		isCodeExecutionSuccessResponse,
		PuzzleResultEnum,
		httpResponseCodes
	} from "types";
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
	import { apiUrls } from "@/config/api";
	import OutputBox from "./output-box.svelte";
	import LanguageSelect from "./language-select.svelte";
	import { authenticatedUserInfo, isAuthenticated } from "@/stores";
	import { languages } from "@/stores/languages";
	import { toast } from "svelte-sonner";
	import { calculatePercentage } from "@/utils/calculate-percentage";
	import { testIds } from "@/config/test-ids";

	interface Props {
		puzzle: PuzzleDto;
		onPlayerSubmitCode?: (submissionId: string) => void;
		onPlayerChangeLanguage?: (language: string) => void;
		endDate: Date | undefined;
	}

	let {
		endDate,
		onPlayerChangeLanguage = () => {},
		onPlayerSubmitCode = () => {},
		puzzle
	}: Props = $props();

	let code: string = $state("");
	let language: PuzzleLanguage = $state("");
	let isExecutingTests = $state(false);
	let isSubmittingCode = $state(false);
	let testResults: Record<number, CodeExecutionResponse> = $state({});

	async function executeCode(
		itemInList: number,
		testInput: string,
		testOutput: string
	) {
		const response = await fetch(apiUrls.EXECUTE_CODE, {
			body: JSON.stringify({
				code,
				language,
				testInput,
				testOutput
			}),
			method: httpRequestMethod.POST
		});

		// Handle rate limiting
		if (response.status === httpResponseCodes.CLIENT_ERROR.TOO_MANY_REQUESTS) {
			const errorData = await response.json();
			toast.error(
				errorData.message ||
					`Rate limit exceeded. Please wait ${errorData.retryAfter || "a moment"} before trying again.`
			);
			return;
		}

		const testResult: CodeExecutionResponse = await response.json();

		testResults = {
			...testResults,
			[itemInList]: testResult
		};
	}

	async function runSingularTestItem(
		itemInList: number,
		testInput: string,
		testOutput: string
	) {
		await executeCode(itemInList, testInput, testOutput);

		const testResult = testResults[itemInList];

		if (isCodeExecutionSuccessResponse(testResult)) {
			const successPercentage = testResult.puzzleResultInformation.successRate;
			showToastWhenTestRan(successPercentage);
		} else {
			showToastWhenTestRan(0);
		}
	}

	async function patience() {
		// little timeout has never hurt anyone, also indicates better that something actually happened, system is too fast otherwise
		return new Promise((resolve) => setTimeout(resolve, 500));
	}

	function showToastWhenTestRan(
		successPercentage: number,
		isMultipleTests: boolean = false
	) {
		const formattedSuccessPercentage = new Intl.NumberFormat("en", {
			roundingMode: "halfCeil",
			style: "percent"
		}).format(successPercentage);

		if (isMultipleTests) {
			if (successPercentage === 1) {
				toast.success("All tests passed!");
			} else if (successPercentage >= 0.35) {
				toast.warning(`${formattedSuccessPercentage} of the tests passed`);
			} else if (successPercentage >= 0) {
				toast.error(`${formattedSuccessPercentage} of the tests passed`);
			} else {
				toast.error("Invalid success percentage");
			}
		} else {
			if (successPercentage === 1) {
				toast.success("Test passed!");
			} else {
				toast.error("Test failed!");
			}
		}
	}

	async function runAllTests() {
		if (puzzle.validators) {
			const isMultipleTests = true;
			isExecutingTests = true;

			const convertToPromises = puzzle.validators.map(
				(validator: ValidatorEntity, index: number) => {
					return executeCode(index, validator.input, validator.output);
				}
			);

			await Promise.all([...convertToPromises, patience()]).then(() => {
				isExecutingTests = false;
			});

			const totalTests = Object.keys(testResults).length;
			const combinedSuccessRate = Object.values(testResults).reduce(
				(sum, res) => {
					if (isCodeExecutionSuccessResponse(res)) {
						return sum + res.puzzleResultInformation.successRate;
					}

					return sum;
				},
				0
			);

			const successPercentage = calculatePercentage(
				0,
				totalTests,
				combinedSuccessRate
			);
			showToastWhenTestRan(successPercentage, isMultipleTests);
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
			puzzleId: puzzle._id,
			userId: $authenticatedUserInfo.userId
		};

		const response = await fetch(apiUrls.SUBMIT_CODE, {
			body: JSON.stringify(submissionParams),
			method: httpRequestMethod.POST
		});

		const submission = await response.json();

		if (isSubmissionDto(submission)) {
			onPlayerSubmitCode(submission._id);
		}

		await patience();

		isSubmittingCode = false;
	}

	let endedGame = $state(false);
	$effect(() => {
		if (!endedGame && endDate && dayjs(endDate).isBefore($currentTime)) {
			endPuzzleGame();
			endedGame = true;
		}
	});

	let openTests = $state(true);
	function openTestsAccordion() {
		openTests = true;
	}

	$effect(() => {
		onPlayerChangeLanguage(language);
	});

	let puzzleValidators = $derived(puzzle.validators ?? []);
</script>

<PuzzleMetaInfo {puzzle} />

<LogicalUnit>
	<Accordion open={true} id="statement">
		{#snippet title()}
			<h2>Statement</h2>
		{/snippet}
		{#snippet content()}
			<div>
				<Markdown markdown={puzzle.statement} fallbackText="No statement" />
			</div>
		{/snippet}
	</Accordion>

	<Accordion open={true} id="constraints">
		{#snippet title()}
			<h2>Constraints</h2>
		{/snippet}
		{#snippet content()}
			<div>
				<Markdown markdown={puzzle.constraints} fallbackText="No constraints" />
			</div>
		{/snippet}
	</Accordion>
</LogicalUnit>

<LogicalUnit class="space-y-4">
	<LogicalUnit class="flex flex-col justify-between gap-2 md:flex-row">
		<LanguageSelect bind:language languages={$languages ?? []} />

		<CountdownTimer {endDate} />
	</LogicalUnit>

	<CodeMirror {language} bind:value={code} />

	<div class="flex flex-row justify-end gap-2">
		{#if puzzle.validators}
			<Button
				data-testid={testIds.PLAY_PUZZLE_COMPONENT_BUTTON_RUN_ALL_TESTS}
				variant="secondary"
				aria-live="polite"
				onclick={runAllTests}
				disabled={isExecutingTests || isSubmittingCode}
				class={cn((isExecutingTests || isSubmittingCode) && "animate-pulse")}
			>
				Run all tests
			</Button>
		{/if}

		<Button
			data-testid={testIds.PLAY_PUZZLE_COMPONENT_BUTTON_SUBMIT_CODE}
			variant="secondary"
			disabled={isSubmittingCode}
			class={cn(isSubmittingCode && "animate-pulse")}
			onclick={async () => {
				endPuzzleGame();
			}}
		>
			Submit code
		</Button>
	</div>
</LogicalUnit>

{#if puzzle.validators}
	<LogicalUnit>
		<TestProgressBar
			{openTestsAccordion}
			puzzleResults={puzzle.validators.map((_, index) => {
				const testResult = testResults[index];
				if (testResult === undefined) {
					return undefined;
				}
				if (!isCodeExecutionSuccessResponse(testResult)) {
					return PuzzleResultEnum.ERROR;
				}

				return testResult.puzzleResultInformation.result;
			})}
			class="my-7"
		/>

		<Accordion bind:open={openTests} id="tests">
			{#snippet title()}
				<h2>Tests</h2>
			{/snippet}

			{#snippet content()}
				<ul class="flex flex-col gap-10">
					{#each puzzleValidators as validator, index}
						<li class="relative">
							<div
								class={cn(
									isCodeExecutionSuccessResponse(testResults[index]) &&
										calculatePuzzleResultColor(
											testResults[index].puzzleResultInformation.result
										),
									"w-full space-y-4 rounded-lg border-2 p-4 md:p-8 lg:space-y-8"
								)}
								id={`validator-${index}`}
							>
								<div class="flex flex-col gap-4 lg:flex-row lg:gap-8">
									<LogicalUnit class="w-full space-y-2 lg:max-w-[50%]">
										<OutputBox title="Input"
											>{validator.input.trimEnd()}</OutputBox
										>
									</LogicalUnit>

									<LogicalUnit class="w-full space-y-2 lg:max-w-[50%]">
										<OutputBox title="Expected output"
											>{validator.output.trimEnd()}</OutputBox
										>
									</LogicalUnit>
								</div>

								{#if isCodeExecutionSuccessResponse(testResults[index])}
									<div class="flex flex-col gap-4 lg:gap-6">
										<h3 class="text-xl font-semibold">Actual output</h3>

										<LogicalUnit class="w-full space-y-2">
											<OutputBox title="Stdout:"
												>{testResults[index].run.stdout}</OutputBox
											>
										</LogicalUnit>
										{#if testResults[index].run.stderr}
											<LogicalUnit class="w-full space-y-2">
												<OutputBox title="Stderr:"
													>{testResults[index].run.stderr}</OutputBox
												>
											</LogicalUnit>
										{/if}
									</div>
								{/if}

								<Button
									data-testid={testIds.PLAY_PUZZLE_COMPONENT_BUTTON_RUN_CODE}
									variant="secondary"
									aria-live="polite"
									disabled={isExecutingTests || isSubmittingCode}
									class={cn(
										(isExecutingTests || isSubmittingCode) && "animate-pulse"
									)}
									onclick={() => {
										isExecutingTests = true;

										Promise.all([
											runSingularTestItem(
												index,
												validator.input,
												validator.output
											),
											patience()
										]).then(() => {
											isExecutingTests = false;
										});
									}}
								>
									Run code
								</Button>
							</div>

							{#if isCodeExecutionSuccessResponse(testResults[index])}
								<ValidatorStatus
									class="absolute top-0 right-0 mt-4 mr-4 p-0"
									puzzleResult={testResults[index].puzzleResultInformation
										.result}
								/>
							{/if}
						</li>
					{/each}
				</ul>
			{/snippet}
		</Accordion>
	</LogicalUnit>
{/if}

<style lang="postcss">
	@reference "tailwindcss";

	h2 {
		@apply inline text-xl underline;
	}
</style>
