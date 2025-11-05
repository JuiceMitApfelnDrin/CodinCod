<script lang="ts">
	import * as Select from "$lib/components/ui/select";
	import { ScrollArea } from "@/components/ui/scroll-area";
	import SelectGroupHeading from "@/components/ui/select/select-group-heading.svelte";
	import { preferences } from "@/stores/preferences.store";
	import { DEFAULT_LANGUAGE, type ProgrammingLanguageDto } from "types";

	let {
		formAttributes = undefined,
		language = $bindable(),
		languages = []
	}: {
		language: string;
		languages?: ProgrammingLanguageDto[];
		formAttributes?:
			| {
					name: string;
					id: string;
					"data-fs-error": string | undefined;
					"aria-describedby": string | undefined;
					"aria-invalid": "true" | undefined;
					"aria-required": "true" | undefined;
					"data-fs-control": string;
			  }
			| undefined;
	} = $props();

	// Extract unique language names
	const languageNames = $derived(
		Array.from(new Set(languages.map((l) => l.language))).sort()
	);

	// Initialize language if not set
	$effect(() => {
		if (!language) {
			if (
				$preferences?.preferredLanguage &&
				languageNames.includes($preferences.preferredLanguage)
			) {
				language = $preferences.preferredLanguage;
			} else if (languageNames.includes(DEFAULT_LANGUAGE)) {
				language = DEFAULT_LANGUAGE;
			} else if (languageNames.length > 0) {
				language = languageNames[0];
			}
		}
	});

	const triggerContent = $derived(language ?? "Select a language");
</script>

<!-- TODO: check if it works without it, otherwise put it back
 
onValueChange={(v) => {
		if (v) {
			language = v.value;
		}
	}}
		-->

<Select.Root type="single" bind:value={language} {...formAttributes}>
	<Select.Trigger class="w-[180px]" {...formAttributes}>
		{triggerContent}
	</Select.Trigger>

	<Select.Content>
		<ScrollArea class="h-40">
			<Select.Group>
				<SelectGroupHeading class="text-lg">Language</SelectGroupHeading>
				<Select.Separator />

				{#each languageNames as languageName}
					<Select.Item value={languageName} label={languageName} />
				{/each}
			</Select.Group>
		</ScrollArea>
	</Select.Content>
</Select.Root>
