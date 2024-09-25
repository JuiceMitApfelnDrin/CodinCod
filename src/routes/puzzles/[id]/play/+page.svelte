<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import CodeMirror from "@/features/game/components/codemirror.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import { buildBackendUrl } from "@/config/backend.js";
	import {
		backendUrls,
		DEFAULT_LANGUAGE,
		frontendUrls,
		isUserDto,
		languageLabels,
		POST,
		type LanguageLabel
	} from "types";
	import * as Select from "$lib/components/ui/select";
	import Button from "@/components/ui/button/button.svelte";
	import { page } from "$app/stores";
	import { fetchWithAuthenticationCookie } from "@/utils/fetch-with-authentication-cookie.js";
	import { formattedDateYearMonthDay } from "@/utils/date-functions.js";
	import { cn } from "@/utils/cn.js";
	import { calculatePuzzleResultColor } from "@/utils/calculate-puzzle-result-color.js";
	import { buildFrontendUrl } from "@/config/frontend";
	import Separator from "@/components/ui/separator/separator.svelte";
	import TestProgressBar from "@/features/puzzles/components/test-progress-bar.svelte";
	import ValidatorStatus from "@/features/puzzles/components/validator-status.svelte";
	import Accordion from "@/components/ui/accordion/accordion.svelte";

	let puzzleId = $page.params.id;

	export let data;

	let puzzle = data.puzzle;

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
<Container class="flex flex-1 flex-col gap-2">
	<H1>
		{puzzle.title}
	</H1>

	<dl class="flex flex-col gap-1 text-xs text-gray-400 lg:flex-row dark:text-gray-600">
		{#if isUserDto(puzzle.authorId)}
			<dt class="font-semibold">Created by</dt>
			<dd>
				{#if puzzle.authorId._id}
					<!-- TODO: on hover, show the user info https://www.shadcn-svelte.com/docs/components/hover-card -->
					<a
						href={buildFrontendUrl(frontendUrls.USER_PROFILE_BY_ID, {
							id: puzzle.authorId._id
						})}
					>
						{puzzle.authorId.username}
					</a>
				{:else}
					{puzzle.authorId.username}
				{/if}
			</dd>
		{/if}

		<Separator orientation="vertical" />

		<dt class="font-semibold">Created on</dt>
		<dd>
			{formattedDateYearMonthDay(puzzle.createdAt)}
		</dd>

		{#if puzzle.updatedAt !== puzzle.createdAt}
			<Separator orientation="vertical" />

			<dt class="font-semibold">Updated on</dt>
			<dd>
				{formattedDateYearMonthDay(puzzle.updatedAt)}
			</dd>
		{/if}
	</dl>

	<div class="mb-8">
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
	</div>

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

	{#if puzzle.validators}
		<TestProgressBar {openTestsAccordion} validators={puzzle.validators} class="my-7" />
	{/if}

	{#if puzzle.validators}
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
