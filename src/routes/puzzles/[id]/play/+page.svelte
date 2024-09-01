<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import CodeMirror from "@/features/game/components/codemirror.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import P from "@/components/typography/p.svelte";
	import Error from "@/components/error/error.svelte";
	import { buildBackendUrl } from "@/config/backend.js";
	import {
		backendUrls,
		DEFAULT_LANGUAGE,
		languageLabels,
		POST,
		type LanguageLabel,
		type ValidatorEntity
	} from "types";
	import * as Select from "$lib/components/ui/select";
	import Button from "@/components/ui/button/button.svelte";

	export let data;

	const puzzle = data.puzzle;

	let code = "";
	let language: LanguageLabel = DEFAULT_LANGUAGE;

	async function executeCode(testInput: string) {
		const res = await fetch(buildBackendUrl(backendUrls.EXECUTE), {
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

		console.log({ unjsonifiedresult: await res.json() });
	}

	$: console.log(language);
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
		<Button>Submit code</Button>
	</div>

	{#if puzzle.validators}
		<ul>
			{#each puzzle.validators as validator}
				<li>
					<pre>
						{validator.input}
					</pre>
					<pre>
						{validator.output}
					</pre>
					<Button on:click={() => executeCode(validator.input)}>Run code</Button>
				</li>
			{/each}
		</ul>
	{/if}
</Container>
<!-- {:else}
	<Error status={data.status} message={data.data.error}></Error>
{/if} -->
