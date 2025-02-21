<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import SideNavigationSettings from "@/features/settings/components/side-navigation-settings.svelte";
	import LanguageSelect from "@/features/puzzles/components/language-select.svelte";
	import H2 from "@/components/typography/h2.svelte";
	import { preferences } from "@/stores/preferences";
	import * as Select from "@/components/ui/select";
	import { ScrollArea } from "@/components/ui/scroll-area";
	import { DEFAULT_LANGUAGE, keymap, keymaps, type PuzzleLanguage } from "types";
	import Codemirror from "@/features/game/components/codemirror.svelte";

	let language: PuzzleLanguage = $preferences?.preferredLanguage ?? DEFAULT_LANGUAGE;
	let preferredKeymap: string = $preferences?.editor?.keymap ?? keymap.VSCODE;
	let code: string = 'print("Hello, World!")';

	function updatePreferredLanguage(newPreferredLanguage: string) {
		if (newPreferredLanguage != $preferences?.preferredLanguage) {
			preferences.updatePreferences({
				preferredLanguage: newPreferredLanguage
			});
			language = newPreferredLanguage;
		}
	}
</script>

<h1 class="sr-only">Preferences</h1>

<Container class="flex md:flex-row">
	<SideNavigationSettings />

	<LogicalUnit class="flex w-full flex-col gap-8">
		<LogicalUnit class="flex flex-col gap-4">
			<H2>Preferred programming language</H2>

			<LanguageSelect {language} setLanguage={updatePreferredLanguage} fetchOnMount={false} />
			<p class="text-sm text-muted-foreground">
				This is your default language when joining a game.
			</p>
		</LogicalUnit>

		<LogicalUnit class="flex flex-col gap-4">
			<H2>Editor configuration</H2>

			<Select.Root
				selected={{ label: preferredKeymap, value: preferredKeymap }}
				onSelectedChange={(v) => {
					if (v) {
						preferences.updatePreferences({
							editor: {
								...$preferences?.editor,
								keymap: v.value
							}
						});
						preferredKeymap = v.value;
					}
				}}
			>
				<Select.Trigger class="w-[180px]">
					<Select.Value placeholder="Select editor keymap" />
				</Select.Trigger>

				<Select.Content>
					<ScrollArea class="h-40">
						<Select.Label class="text-lg">Keymap</Select.Label>
						<Select.Separator />

						<Select.Group>
							{#each keymaps as keymap}
								<Select.Item value={keymap} label={keymap} />
							{/each}
						</Select.Group>
					</ScrollArea>
				</Select.Content>
				<Select.Input bind:value={preferredKeymap} />
			</Select.Root>

			<p class="text-sm text-muted-foreground">
				Choose your preferred keymap to customize keyboard shortcuts for a smoother coding
				experience in the editor.
			</p>
		</LogicalUnit>

		<LogicalUnit class="flex flex-col gap-4">
			<H2>Try out your configuration</H2>

			<p class="text-sm text-muted-foreground">
				All your changes will be reflected in this code editor
			</p>

			<Codemirror {language} bind:value={code} />
		</LogicalUnit>
	</LogicalUnit>
</Container>
