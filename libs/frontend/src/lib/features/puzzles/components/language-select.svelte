<script lang="ts">
	import * as Select from "$lib/components/ui/select";
	import { ScrollArea } from "@/components/ui/scroll-area";
	import SelectGroupHeading from "@/components/ui/select/select-group-heading.svelte";
	import { preferences } from "@/stores/preferences.store";
	import type { CodincodApiWebProgrammingLanguageControllerIndex200Item } from "@/api/generated/schemas";
	import { DEFAULT_LANGUAGE } from "$lib/types/core/game/config/game-config.js";

	let {
		formAttributes = undefined,
		selectedProgrammingLanguageId = $bindable(),
		selectableProgrammingLanguages = []
	}: {
		selectedProgrammingLanguageId: string;
		selectableProgrammingLanguages: CodincodApiWebProgrammingLanguageControllerIndex200Item[];
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

	const validLanguages = $derived(
		selectableProgrammingLanguages.filter(
			(
				lang
			): lang is Required<CodincodApiWebProgrammingLanguageControllerIndex200Item> =>
				Boolean(lang.id) && Boolean(lang.language) && Boolean(lang.version)
		)
	);

	$effect(() => {
		if (!selectedProgrammingLanguageId) {
			if (
				$preferences?.preferredLanguage &&
				validLanguages.some(
					(lang) => lang.id === $preferences.preferredLanguage
				)
			) {
				selectedProgrammingLanguageId = $preferences.preferredLanguage;
			} else if (validLanguages.some((lang) => lang.id === DEFAULT_LANGUAGE)) {
				selectedProgrammingLanguageId = DEFAULT_LANGUAGE;
			} else if (validLanguages.length > 0) {
				selectedProgrammingLanguageId = validLanguages[0].id;
			}
		}
	});

	const triggerContent = $derived(
		selectedProgrammingLanguageId ?? "Select a language"
	);
</script>

<Select.Root
	type="single"
	bind:value={selectedProgrammingLanguageId}
	{...formAttributes}
>
	<Select.Trigger class="w-[180px]" {...formAttributes}>
		{triggerContent}
	</Select.Trigger>

	<Select.Content>
		<ScrollArea class="h-40">
			<Select.Group>
				<SelectGroupHeading class="text-lg">Language</SelectGroupHeading>
				<Select.Separator />

				{#each validLanguages as language}
					<Select.Item
						value={language.id}
						label={`${language.language} ${language.version}`}
					/>
				{/each}
			</Select.Group>
		</ScrollArea>
	</Select.Content>
</Select.Root>
