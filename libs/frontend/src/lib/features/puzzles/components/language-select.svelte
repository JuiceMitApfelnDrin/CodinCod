<script lang="ts">
	import * as Select from "$lib/components/ui/select";
	import { ScrollArea } from "@/components/ui/scroll-area";
	import { testIds } from "@/config/test-ids";
	import { preferences } from "@/stores/preferences";
	import { DEFAULT_LANGUAGE } from "types";

	export let language: string = "";
	export let languages: string[] = [];
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

	if (!language) {
		if ($preferences?.preferredLanguage && languages.includes($preferences.preferredLanguage)) {
			language = $preferences.preferredLanguage;
		} else if (languages.includes(DEFAULT_LANGUAGE)) {
			language = DEFAULT_LANGUAGE;
		} else {
			language = languages[0];
		}
	}
</script>

<Select.Root
	selected={{ label: language, value: language }}
	onSelectedChange={(v) => {
		if (v) {
			language = v.value;
		}
	}}
>
	<Select.Trigger
		class="w-[180px]"
		{...formAttributes}
		data-testid={testIds.LANGUAGE_SELECT_BUTTON_OPEN_LANGUAGE_SELECT}
	>
		<Select.Value placeholder="Select a language" />
	</Select.Trigger>

	<Select.Content>
		<ScrollArea class="h-40">
			<Select.Label class="text-lg">Language</Select.Label>
			<Select.Separator />

			<Select.Group>
				{#each languages as language}
					<Select.Item
						value={language}
						label={language}
						data-testid={testIds.LANGUAGE_SELECT_OPTION_LANGUAGE}
					/>
				{/each}
			</Select.Group>
		</ScrollArea>
	</Select.Content>
	<Select.Input bind:value={language} name={formAttributes?.name} />
</Select.Root>
