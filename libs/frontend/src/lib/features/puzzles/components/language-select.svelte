<script lang="ts">
	import * as Select from "$lib/components/ui/select";
	import { ScrollArea } from "@/components/ui/scroll-area";
	import { fetchSupportedLanguages } from "@/utils/fetch-supported-languages";
	import { onMount } from "svelte";
	import { DEFAULT_LANGUAGE, type PuzzleLanguage } from "types";

	export let language: string = "";
	export let setLanguage: (language: PuzzleLanguage) => void = () => {};
	export let formAttributes:
		| {
				name: string;
				id: string;
				"data-fs-error": string | undefined;
				"aria-describedby": string | undefined;
				"aria-invalid": "true" | undefined;
				"aria-required": "true" | undefined;
				"data-fs-control": string;
		  }
		| undefined = undefined;

	let languages: PuzzleLanguage[] = [];

	async function fetchLanguages() {
		languages = await fetchSupportedLanguages();

		const containsDefaultLanguage = languages.includes(DEFAULT_LANGUAGE);

		if (containsDefaultLanguage) {
			setLanguage(DEFAULT_LANGUAGE);
		} else {
			setLanguage(languages[0]);
		}
	}

	onMount(() => {
		fetchLanguages();
	});
</script>

<Select.Root
	selected={{ label: language, value: language }}
	onSelectedChange={(v) => {
		if (v) {
			setLanguage(v.value);
		}
	}}
>
	<Select.Trigger class="w-[180px]" {...formAttributes}>
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
	<Select.Input bind:value={language} name={formAttributes?.name} />
</Select.Root>
