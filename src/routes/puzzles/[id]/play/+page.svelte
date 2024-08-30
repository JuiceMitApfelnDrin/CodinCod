<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import CodeMirror from "@/features/game/components/codemirror.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import P from "@/components/typography/p.svelte";
	import Error from "@/components/error/error.svelte";
	import * as Select from "$lib/components/ui/select";
	import {
		DEFAULT_LANGUAGE,
		languageToLabelMap,
		type Language,
		languages
	} from "@/config/languages.js";
	import Button from "@/components/ui/button/button.svelte";

	export let data;

	const puzzle = data.puzzle;

	$: console.log(data);
	let code = "";
	let language: Language = DEFAULT_LANGUAGE;
</script>

{#if puzzle}
	<Container class="flex flex-1 flex-col gap-2">
		<H1>
			{puzzle.title}
		</H1>
		<P>puzzle was created on: {puzzle.createdAt}, and last update happened on: {puzzle.updatedAt}</P
		>

		<Select.Root selected={{ value: language, label: languageToLabelMap[language] }}>
			<Select.Trigger class="w-[180px]">
				<Select.Value placeholder="Select a language" />
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.Label class="text-lg">Language</Select.Label>
					{#each languages as language}
						<Select.Item value={language} label={languageToLabelMap[language]} />
					{/each}
				</Select.Group>
			</Select.Content>
			<Select.Input bind:value={language} />
		</Select.Root>

		<CodeMirror {language} value={code} />

		<div class="flex flex-row justify-end gap-2">
			<Button>Run code</Button>
			<Button>Submit code</Button>
		</div>
	</Container>
{:else}
	<Error status={data.status} message={data.data.error}></Error>
{/if}
