<script lang="ts">
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import LanguageSelect from "@/features/puzzles/components/language-select.svelte";
	import H2 from "@/components/typography/h2.svelte";
	import { preferences } from "@/stores/preferences.store";
	import * as Select from "@/components/ui/select";
	import { ScrollArea } from "@/components/ui/scroll-area";
	import {
		DEFAULT_LANGUAGE,
		keymaps,
		type EditorPreferences,
		type PuzzleLanguage
	} from "types";
	import Codemirror from "@/features/game/components/codemirror.svelte";
	import { languages } from "@/stores/languages.store";
	import Checkbox from "@/components/ui/toggle/checkbox.svelte";

	let language: PuzzleLanguage = $state(
		$preferences?.preferredLanguage ?? DEFAULT_LANGUAGE
	);
	let code: string = $state('print("Hello, World!")');

	function updatePreferredLanguage(newPreferredLanguage: string) {
		if (newPreferredLanguage != $preferences?.preferredLanguage) {
			preferences.updatePreferences({
				preferredLanguage: newPreferredLanguage
			});
		}
	}

	$effect(() => {
		updatePreferredLanguage(language);
	});

	function CheckboxEditorPreference<K extends keyof EditorPreferences>(key: K) {
		if ($preferences?.editor) {
			preferences.updatePreferences({
				editor: {
					...$preferences?.editor,
					[key]: !$preferences?.editor[key]
				}
			});
		}
	}

	let triggerContent = $derived(
		$preferences?.editor?.keymap ?? "Select an editor keymap"
	);
</script>

<svelte:head>
	<title>Preferences settings | CodinCod</title>
	<meta
		name="description"
		content="Tweak your coding battleground—adjust themes, notifications, and community preferences to match your style."
	/>
	<meta name="author" content="CodinCod contributors" />
</svelte:head>

<h1 class="sr-only">Preferences</h1>

<LogicalUnit class="flex w-full flex-col gap-8">
	<LogicalUnit class="flex flex-col gap-4">
		<H2>Preferred programming language</H2>

		<div class="flex flex-col gap-2">
			<p class="text-muted-foreground text-sm">
				This is your default language when joining a game.
			</p>
			<LanguageSelect bind:language languages={$languages ?? []} />
		</div>
	</LogicalUnit>

	{#if $preferences && $preferences.editor}
		<LogicalUnit class="flex flex-col gap-4">
			<H2>Editor configuration</H2>

			<!-- Keymap Selection -->
			<div class="flex flex-col gap-2">
				<p class="text-muted-foreground text-sm">
					Choose between different keyboard shortcut presets (VSCode, Vim,
					Emacs). Affects navigation, selection, and editing shortcuts.
				</p>

				<!-- TODO: check if it works without it, otherwise put it back
				 
				onValueChange={(v) => {
						if (v && $preferences.editor) {
							preferences.updatePreferences({
								editor: {
									...$preferences.editor,
									keymap: v
								}
							});
						}
					}}
				-->

				<Select.Root type="single" bind:value={$preferences.editor.keymap}>
					<Select.Trigger class="w-[180px]">
						{triggerContent}
					</Select.Trigger>
					<Select.Content>
						<ScrollArea class="h-40">
							<Select.Group>
								<Select.GroupHeading>Keybindings</Select.GroupHeading>
								{#each keymaps as keymap}
									<Select.Item value={keymap} label={keymap} />
								{/each}
							</Select.Group>
						</ScrollArea>
					</Select.Content>
				</Select.Root>
			</div>
		</LogicalUnit>

		<LogicalUnit class="flex flex-col gap-8">
			<H2>Editor Features</H2>

			<div class="flex flex-col gap-4">
				<h3 class="text-lg font-bold">Display & Layout</h3>

				<div class="flex items-center justify-between gap-4">
					<div>
						<h4 class="text-sm font-medium underline">Line Numbers</h4>
						<p class="text-muted-foreground text-sm">
							Show numbered lines in the gutter for easy reference and
							navigation
						</p>
					</div>
					<Checkbox
						checked={$preferences.editor.lineNumbers}
						onChecked={() => CheckboxEditorPreference("lineNumbers")}
					/>
				</div>

				<div class="flex items-center justify-between gap-4">
					<div>
						<h4 class="text-sm font-medium underline">Active Line Highlight</h4>
						<p class="text-muted-foreground text-sm">
							Highlight the background of the line containing the cursor
						</p>
					</div>
					<Checkbox
						checked={$preferences.editor.highlightActiveLine}
						onChecked={() => CheckboxEditorPreference("highlightActiveLine")}
					/>
				</div>

				<div class="flex items-center justify-between gap-4">
					<div>
						<h4 class="text-sm font-medium underline">Gutter Highlights</h4>
						<p class="text-muted-foreground text-sm">
							Highlight line number gutter for the current active line
						</p>
					</div>
					<Checkbox
						checked={$preferences.editor.highlightActiveLineGutter}
						onChecked={() =>
							CheckboxEditorPreference("highlightActiveLineGutter")}
					/>
				</div>
			</div>

			<div class="flex flex-col gap-4">
				<h3 class="text-lg font-bold">Code Editing</h3>

				<div class="flex items-center justify-between gap-4">
					<div>
						<h4 class="text-sm font-medium underline">Bracket Matching</h4>
						<p class="text-muted-foreground text-sm">
							Automatically highlight matching brackets and parentheses
						</p>
					</div>
					<Checkbox
						checked={$preferences.editor.bracketMatching}
						onChecked={() => CheckboxEditorPreference("bracketMatching")}
					/>
				</div>

				<div class="flex items-center justify-between gap-4">
					<div>
						<h4 class="text-sm font-medium underline">Auto-Close Brackets</h4>
						<p class="text-muted-foreground text-sm">
							Automatically close brackets, quotes, and other paired characters
						</p>
					</div>
					<Checkbox
						checked={$preferences.editor.closeBrackets}
						onChecked={() => CheckboxEditorPreference("closeBrackets")}
					/>
				</div>

				<div class="flex items-center justify-between gap-4">
					<div>
						<h4 class="text-sm font-medium underline">Smart Indentation</h4>
						<p class="text-muted-foreground text-sm">
							Automatically adjust indentation when creating new lines
						</p>
					</div>
					<Checkbox
						checked={$preferences.editor.indentOnInput}
						onChecked={() => CheckboxEditorPreference("indentOnInput")}
					/>
				</div>
			</div>

			<div class="flex flex-col gap-4">
				<h3 class="text-lg font-bold">Visual Aids</h3>

				<div class="flex items-center justify-between gap-4">
					<div>
						<h4 class="text-sm font-medium underline">Special Characters</h4>
						<p class="text-muted-foreground text-sm">
							Show invisible characters like spaces, tabs, and line breaks
						</p>
					</div>
					<Checkbox
						checked={$preferences.editor.highlightSpecialChars}
						onChecked={() => CheckboxEditorPreference("highlightSpecialChars")}
					/>
				</div>

				<div class="flex items-center justify-between gap-4">
					<div>
						<h4 class="text-sm font-medium underline">Selection Matching</h4>
						<p class="text-muted-foreground text-sm">
							Highlight other occurrences of selected text in the document
						</p>
					</div>
					<Checkbox
						checked={$preferences.editor.highlightSelectionMatches}
						onChecked={() =>
							CheckboxEditorPreference("highlightSelectionMatches")}
					/>
				</div>

				<div class="flex items-center justify-between gap-4">
					<div>
						<h4 class="text-sm font-medium underline">Crosshair Cursor</h4>
						<p class="text-muted-foreground text-sm">
							Show horizontal and vertical lines extending from the cursor
						</p>
					</div>
					<Checkbox
						checked={$preferences.editor.crosshairCursor}
						onChecked={() => CheckboxEditorPreference("crosshairCursor")}
					/>
				</div>
			</div>

			<div class="flex flex-col gap-4">
				<h3 class="text-lg font-bold">Advanced Editing</h3>

				<div class="flex items-center justify-between gap-4">
					<div>
						<h4 class="text-sm font-medium underline">Multiple Selections</h4>
						<p class="text-muted-foreground text-sm">
							Allow creating multiple cursors for simultaneous editing
						</p>
					</div>
					<Checkbox
						checked={$preferences.editor.allowMultipleSelections}
						onChecked={() =>
							CheckboxEditorPreference("allowMultipleSelections")}
					/>
				</div>

				<div class="flex items-center justify-between gap-4">
					<div>
						<h4 class="text-sm font-medium underline">Rectangular Selection</h4>
						<p class="text-muted-foreground text-sm">
							Enable column-based text selection (Alt+drag)
						</p>
					</div>
					<Checkbox
						checked={$preferences.editor.rectangularSelection}
						onChecked={() => CheckboxEditorPreference("rectangularSelection")}
					/>
				</div>

				<div class="flex items-center justify-between gap-4">
					<div>
						<h4 class="text-sm font-medium underline">Drag-and-Drop</h4>
						<p class="text-muted-foreground text-sm">
							Show visual indicator when dragging text
						</p>
					</div>
					<Checkbox
						checked={$preferences.editor.dropCursor}
						onChecked={() => CheckboxEditorPreference("dropCursor")}
					/>
				</div>
			</div>

			<div class="flex flex-col gap-4">
				<h3 class="text-lg font-bold">History & Navigation</h3>

				<div class="flex items-center justify-between gap-4">
					<div>
						<h4 class="text-sm font-medium underline">Edit History</h4>
						<p class="text-muted-foreground text-sm">
							Maintain undo/redo history for document changes
						</p>
					</div>
					<Checkbox
						checked={$preferences.editor.history}
						onChecked={() => CheckboxEditorPreference("history")}
					/>
				</div>

				<div class="flex items-center justify-between gap-4">
					<div>
						<h4 class="text-sm font-medium underline">Code Folding</h4>
						<p class="text-muted-foreground text-sm">
							Show controls for collapsing/expanding code blocks
						</p>
					</div>
					<Checkbox
						checked={$preferences.editor.foldGutter}
						onChecked={() => CheckboxEditorPreference("foldGutter")}
					/>
				</div>
			</div>

			<div class="flex flex-col gap-4">
				<h3 class="text-lg font-bold">Code Assistance</h3>

				<div class="flex items-center justify-between gap-4">
					<div>
						<h4 class="text-sm font-medium underline">Auto-completion</h4>
						<p class="text-muted-foreground text-sm">
							Show intelligent code suggestions while typing
						</p>
					</div>
					<Checkbox
						checked={$preferences.editor.autocompletion}
						onChecked={() => CheckboxEditorPreference("autocompletion")}
					/>
				</div>

				<div class="flex items-center justify-between gap-4">
					<div>
						<h4 class="text-sm font-medium underline">Linting</h4>
						<p class="text-muted-foreground text-sm">
							Enable real-time code analysis and error checking
						</p>
					</div>
					<Checkbox
						checked={$preferences.editor.lintKeymap}
						onChecked={() => CheckboxEditorPreference("lintKeymap")}
					/>
				</div>
			</div>
		</LogicalUnit>
	{/if}

	<LogicalUnit class="flex flex-col gap-4">
		<H2>Try out your configuration</H2>

		<p class="text-muted-foreground text-sm">
			All your changes will be reflected in this code editor
		</p>

		<Codemirror {language} bind:value={code} />
	</LogicalUnit>
</LogicalUnit>
