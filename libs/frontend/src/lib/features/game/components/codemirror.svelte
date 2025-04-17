<script lang="ts">
	import CodeMirror from "svelte-codemirror-editor";
	import { oneDark } from "@codemirror/theme-one-dark";
	import { keymap, type EditorPreferences, type PreferencesDto, type PuzzleLanguage } from "types";
	import {
		bracketMatching,
		defaultHighlightStyle,
		foldGutter,
		foldKeymap,
		indentOnInput,
		StreamLanguage,
		syntaxHighlighting
	} from "@codemirror/language";
	import { basicSetup } from "codemirror";
	import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
	import { lintKeymap } from "@codemirror/lint";
	import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
	import {
		autocompletion,
		completionKeymap,
		closeBrackets,
		closeBracketsKeymap
	} from "@codemirror/autocomplete";
	import { EditorState, type Extension } from "@codemirror/state";
	import { preferences } from "@/stores/preferences";
	import {
		keymap as codemirrorKeymap,
		crosshairCursor,
		drawSelection,
		dropCursor,
		highlightActiveLine,
		highlightActiveLineGutter,
		highlightSpecialChars,
		lineNumbers,
		rectangularSelection
	} from "@codemirror/view";
	import { testClasses } from "@/config/test-classes";

	export let readonly = false;
	export let value = "";
	export let language: PuzzleLanguage = "";

	function createBasicExtensions(editorPreferences: EditorPreferences): Extension[] {
		const extensions: Extension[] = [];

		function add(condition: boolean, ext: Extension) {
			if (condition) extensions.push(ext);
		}

		// Add all extensions from basicSetup with conditional checks
		add(editorPreferences.lineNumbers, lineNumbers());
		add(editorPreferences.highlightActiveLineGutter, highlightActiveLineGutter());
		add(editorPreferences.highlightSpecialChars, highlightSpecialChars());
		add(editorPreferences.history, history());
		add(editorPreferences.foldGutter, foldGutter());
		add(editorPreferences.drawSelection, drawSelection());
		add(editorPreferences.dropCursor, dropCursor());
		add(editorPreferences.allowMultipleSelections, EditorState.allowMultipleSelections.of(true));
		add(editorPreferences.indentOnInput, indentOnInput());
		add(true, syntaxHighlighting(defaultHighlightStyle, { fallback: true }));
		add(editorPreferences.bracketMatching, bracketMatching());
		add(editorPreferences.closeBrackets, closeBrackets());
		add(editorPreferences.autocompletion, autocompletion());
		add(editorPreferences.rectangularSelection, rectangularSelection());
		add(editorPreferences.crosshairCursor, crosshairCursor());
		add(editorPreferences.highlightActiveLine, highlightActiveLine());
		add(editorPreferences.highlightSelectionMatches, highlightSelectionMatches());

		// Keymaps
		const keymaps = [];
		if (editorPreferences.defaultKeymap) keymaps.push(...defaultKeymap);
		if (editorPreferences.searchKeymap) keymaps.push(...searchKeymap);
		if (editorPreferences.foldKeymap) keymaps.push(...foldKeymap);
		if (editorPreferences.completionKeymap) keymaps.push(...completionKeymap);
		if (editorPreferences.lintKeymap) keymaps.push(...lintKeymap);
		if (editorPreferences.closeBrackets) keymaps.push(...closeBracketsKeymap);
		if (editorPreferences.history) keymaps.push(...historyKeymap);

		extensions.push(codemirrorKeymap.of(keymaps));

		return extensions;
	}

	async function getEditorConfig(language: string, preferences: PreferencesDto | null) {
		let defaultConfiguration = [basicSetup];

		if (preferences?.editor) {
			defaultConfiguration = createBasicExtensions(preferences?.editor);
		}

		const languageExtensions = await getLanguageExtensions(language);

		return {
			extensions: [
				...defaultConfiguration,
				oneDark,
				await getKeymapExtensions(preferences?.editor?.keymap),
				...languageExtensions
			],
			tabSize: (() => {
				switch (language) {
					case "javascript":
					case "typescript":
					case "dart":
					case "ruby":
					case "crystal":
					case "nim":
					case "elixir":
					case "lua":
						return 2;
					default:
						return 4;
				}
			})(),
			useTab: language === "go"
		};
	}

	async function getLanguageExtensions(
		language: PuzzleLanguage
	): Promise<Extension[] | StreamLanguage<unknown>[]> {
		let chosenLanguageExtension: Extension[] = [];

		switch (language) {
			case "javascript": {
				return [(await import("@codemirror/lang-javascript")).javascript()];
			}
			case "python": {
				return [(await import("@codemirror/lang-python")).python()];
			}
			case "typescript": {
				return [
					(await import("@codemirror/lang-javascript")).javascript({
						typescript: true
					})
				];
			}
			case "rust": {
				return [(await import("@codemirror/lang-rust")).rust()];
			}
			case "c++": {
				return [(await import("@codemirror/lang-cpp")).cpp()];
			}
			case "elixir": {
				return [(await import("codemirror-lang-elixir")).elixir()];
			}
			case "prolog": {
				return [(await import("codemirror-lang-prolog")).prolog()];
			}
			case "ruby": {
				const { ruby } = await import("@codemirror/legacy-modes/mode/ruby");
				return [StreamLanguage.define(ruby)];
			}
			case "brainfuck": {
				const { brainfuck } = await import("@codemirror/legacy-modes/mode/brainfuck");
				return [StreamLanguage.define(brainfuck)];
			}
			case "dart": {
				const { dart } = await import("@codemirror/legacy-modes/mode/clike");
				return [StreamLanguage.define(dart)];
			}
			case "c": {
				const { c } = await import("@codemirror/legacy-modes/mode/clike");
				return [StreamLanguage.define(c)];
			}
			case "crystal": {
				const { crystal } = await import("@codemirror/legacy-modes/mode/crystal");
				return [StreamLanguage.define(crystal)];
			}
			case "lua": {
				const { lua } = await import("@codemirror/legacy-modes/mode/lua");
				return [StreamLanguage.define(lua)];
			}
			case "go": {
				const { go } = await import("@codemirror/legacy-modes/mode/go");
				return [StreamLanguage.define(go)];
			}
			case "cobol": {
				const { cobol } = await import("@codemirror/legacy-modes/mode/cobol");
				return [StreamLanguage.define(cobol)];
			}
			case "d": {
				const { d } = await import("@codemirror/legacy-modes/mode/d");
				return [StreamLanguage.define(d)];
			}
			case "fortran": {
				const { fortran } = await import("@codemirror/legacy-modes/mode/fortran");
				return [StreamLanguage.define(fortran)];
			}
			case "haskell": {
				const { haskell } = await import("@codemirror/legacy-modes/mode/haskell");
				return [StreamLanguage.define(haskell)];
			}
			case "julia": {
				const { julia } = await import("@codemirror/legacy-modes/mode/julia");
				return [StreamLanguage.define(julia)];
			}

			case "lisp": {
				const { commonLisp } = await import("@codemirror/legacy-modes/mode/commonlisp");
				return [StreamLanguage.define(commonLisp)];
			}

			case "perl": {
				const { perl } = await import("@codemirror/legacy-modes/mode/perl");
				return [StreamLanguage.define(perl)];
			}

			case "awk": {
				// awk - No legacy mode available
				break;
			}
			case "raku": {
				// raku - No legacy mode available
				// @code-golf has a raku implementation - https://github.com/code-golf/code-golf/blob/master/js/vendor/codemirror-raku.js
				break;
			}
		}

		return chosenLanguageExtension;
	}

	async function getKeymapExtensions(requestedKeymap?: string): Promise<Extension> {
		switch (requestedKeymap) {
			case keymap.EMACS: {
				const { emacs } = await import("@replit/codemirror-emacs");
				return emacs();
			}
			case keymap.VIM: {
				const { vim } = await import("@replit/codemirror-vim");
				return vim();
			}
			default: {
				const { vscodeKeymap } = await import("@replit/codemirror-vscode-keymap");
				return codemirrorKeymap.of(vscodeKeymap);
			}
		}
	}
</script>

{#await getEditorConfig(language, $preferences)}
	<p>loading the editor...</p>
{:then editorConfig}
	<CodeMirror
		class={testClasses.CODEMIRROR_INSTANCE}
		bind:value
		theme={oneDark}
		{readonly}
		{...editorConfig}
		basic={false}
		styles={{
			".cm-content": { maxWidth: "90vw" },
			".cm-editor": {
				display: "flex",
				height: "100%"
			},
			".cm-scroller, .cm-gutters": { height: "35vh", minHeight: "300px", overflow: "auto" }
			// TODO: fix this fr fr, since setting maxWidth can only be a temporary solution
		}}
	/>
{/await}
