<script lang="ts">
	import * as Select from "$lib/components/ui/select";
	import { ScrollArea } from "@/components/ui/scroll-area";
	import SelectGroupHeading from "@/components/ui/select/select-group-heading.svelte";
	import { preferences } from "@/stores/preferences";
	import { DEFAULT_LANGUAGE } from "types";

	let {
		formAttributes = undefined,
		language = $bindable(),
		languages = []
	}: {
		language: string;
		languages?: string[];
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

	if (!language) {
		if (
			$preferences?.preferredLanguage &&
			languages.includes($preferences.preferredLanguage)
		) {
			language = $preferences.preferredLanguage;
		} else if (languages.includes(DEFAULT_LANGUAGE)) {
			language = DEFAULT_LANGUAGE;
		} else {
			language = languages[0];
		}
	}

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

				{#each languages as language}
					<Select.Item value={language} label={language} />
				{/each}
			</Select.Group>
		</ScrollArea>
	</Select.Content>
</Select.Root>
