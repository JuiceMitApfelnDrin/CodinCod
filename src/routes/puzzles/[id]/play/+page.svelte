<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import CodeMirror from "@/features/game/components/codemirror.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import P from "@/components/typography/p.svelte";
	import { buildBackendUrl } from "@/config/backend.js";
	import { backendUrls, DEFAULT_LANGUAGE, languageLabels, POST, type LanguageLabel } from "types";
	import * as Select from "$lib/components/ui/select";
	import Button from "@/components/ui/button/button.svelte";
	import { page } from "$app/stores";
	import { fetchWithAuthenticationCookie } from "@/utils/fetch-with-authentication-cookie.js";

	let puzzleId = $page.params.id;

	export let data;

	let puzzle = data.puzzle;

	let code: string = "";
	let language: LanguageLabel = DEFAULT_LANGUAGE;

	async function executeCode(itemInlist: number, testInput: string) {
		const response = await fetchWithAuthenticationCookie(buildBackendUrl(backendUrls.EXECUTE), {
			method: POST,
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				language,
				code,
				testInput
			})
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
		const response = await fetchWithAuthenticationCookie(buildBackendUrl(backendUrls.SUBMISSION), {
			method: POST,
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				code,
				language,
				puzzleId
			})
		});
	}
</script>

<!-- {#if puzzle} -->
<Container class="flex flex-1 flex-col gap-2">
	<H1>
		{puzzle.title}
	</H1>
	<P>puzzle was created on: {puzzle.createdAt}, and last update happened on: {puzzle.updatedAt}</P>

	<P>
		{puzzle.constraints}
	</P>
	<P>
		{puzzle.statement}
	</P>

	<Select.Root
		selected={{ value: language, label: language }}
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
		<Button on:click={submitCode}>Submit code</Button>
	</div>

	{#if puzzle.validators}
		<ul>
			{#each puzzle.validators as validator, index}
				<li>
					<pre>
						{validator.input}
					</pre>
					<pre>
						{validator.output}
					</pre>
					<Button on:click={() => executeCode(index, validator.input)}>Run code</Button>

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
	{/if}
</Container>
<!-- {:else}
	<Error status={data.status} message={data.data.error}></Error>
{/if} -->
