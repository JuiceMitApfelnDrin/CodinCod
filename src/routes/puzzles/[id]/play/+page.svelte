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
	import * as Accordion from "$lib/components/ui/accordion";
	import { cn } from "@/utils/cn.js";
	import { calculatePuzzleResultColor } from "@/utils/calculate-puzzle-result-color.js";
	import { buildFrontendUrl } from "@/config/frontend";
	import Separator from "@/components/ui/separator/separator.svelte";

	let puzzleId = $page.params.id;

	export let data;

	let puzzle = data.puzzle;

	let code: string = "";
	let language: LanguageLabel = DEFAULT_LANGUAGE;

	async function executeCode(itemInlist: number, testInput: string, testOutput: string) {
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

		const validator = puzzle.validators?.[itemInlist];

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

	// needed to open the item by default
	let statementAccordion = "statement";
	let constraintsAccordion = "constraints";
	let testsAccordion = "tests";
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
		<Accordion.Root bind:value={statementAccordion}>
			<Accordion.Item value="statement">
				<Accordion.Trigger><h2>Statement</h2></Accordion.Trigger>
				<Accordion.Content class="pl-4">{puzzle.statement}</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>

		<Accordion.Root bind:value={constraintsAccordion}>
			<Accordion.Item value="constraints">
				<Accordion.Trigger><h2>Constraints</h2></Accordion.Trigger>
				<Accordion.Content class="pl-4">{puzzle.constraints}</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
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
			<Button on:click={runAllTests}>Run all tests</Button>
		{/if}
		<Button on:click={submitCode}>Submit code</Button>
	</div>

	{#if puzzle.validators}
		<Accordion.Root bind:value={testsAccordion}>
			<Accordion.Item value="tests">
				<Accordion.Trigger><h2>Tests</h2></Accordion.Trigger>
				<Accordion.Content>
					<ul class="flex flex-col gap-8">
						{#each puzzle.validators as validator, index}
							<li
								class={cn(calculatePuzzleResultColor(validator.testResult?.run.result), "w-full")}
							>
								<div class="lg:flex">
									<div class="lg:w-1/2">
										<h3 class="font-semibold">Input</h3>
										<pre>
											{validator.input.trim()}
										</pre>
									</div>
									<div class="lg:w-1/2">
										<h3 class="font-semibold">Output</h3>
										<pre>
											{validator.output}
										</pre>
									</div>
								</div>

								<Button on:click={() => executeCode(index, validator.input, validator.output)}>
									Run code
								</Button>

								{#if validator.testResult}
									<p>Lastest result:</p>
									output:
									<pre>{validator.testResult?.run.output}</pre>
									stdout:
									<pre>{validator.testResult?.run.stdout}</pre>
									stderr:
									<pre>{validator.testResult?.run.stderr}</pre>
								{/if}
							</li>
						{/each}
					</ul>
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	{/if}
</Container>

<!-- {:else}
	<Error status={data.status} message={data.data.error}></Error>
{/if} -->

<style>
	pre {
		white-space: pre-line;
	}
</style>
