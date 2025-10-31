<script lang="ts">
	import { keymap, type PreferencesDto, type PuzzleLanguage } from "types";
	import { preferences } from "@/stores/preferences";
	import type CodemirrorWrapperType from "#/external-wrapper/codemirror-wrapper.svelte";

	const CodemirrorWrapper = import(
		"#/external-wrapper/codemirror-wrapper.svelte"
	) as Promise<{
		default: typeof CodemirrorWrapperType;
	}>;

	let {
		language = "",
		readonly = false,
		value = $bindable("")
	}: {
		readonly?: boolean;
		value?: string | undefined;
		language?: PuzzleLanguage | undefined;
	} = $props();

	async function getEditorTheme() {
		const { oneDark } = await import("@codemirror/theme-one-dark");
		return oneDark;
	}

	async function getEditorConfig(
		language: string,
		preferences: PreferencesDto | null
	) {
		const languageExtensions = await getLanguageExtensions(language);
		const keymapExtension = await getKeymapExtensions(
			preferences?.editor?.keymap
		);

		return {
			drawSelection: preferences?.editor?.drawSelection ?? true,
			dropCursor: preferences?.editor?.dropCursor ?? true,
			extensions: [...languageExtensions, keymapExtension],
			bracketMatching: preferences?.editor?.bracketMatching ?? true,
			foldGutter: preferences?.editor?.foldGutter ?? true,
			autocompletion: preferences?.editor?.autocompletion ?? true,
			highlight: {
				activeLine: preferences?.editor?.highlightActiveLine ?? true,
				activeLineGutter:
					preferences?.editor?.highlightActiveLineGutter ?? true,
				selectionMatches:
					preferences?.editor?.highlightSelectionMatches ?? true,
				specialChars: preferences?.editor?.highlightSpecialChars ?? true
			},
			closeBrackets: preferences?.editor?.closeBrackets ?? true,
			lineNumbers: preferences?.editor?.lineNumbers ?? true,
			allowMultiSelect: preferences?.editor?.allowMultipleSelections ?? true,
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
			crosshairCursor: preferences?.editor?.crosshairCursor ?? true,
			useTab: language === "go",
			history: preferences?.editor?.history ?? true,
			indentOnInput: preferences?.editor?.indentOnInput ?? true,
			rectangularSelection: preferences?.editor?.rectangularSelection ?? true
		};
	}

	async function getLanguageExtensions(
		language: PuzzleLanguage
	): Promise<any[]> {
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
				const { StreamLanguage } = await import("@codemirror/language");
				return [StreamLanguage.define(ruby)];
			}

			case "brainfuck": {
				const { brainfuck } = await import(
					"@codemirror/legacy-modes/mode/brainfuck"
				);
				const { StreamLanguage } = await import("@codemirror/language");
				return [StreamLanguage.define(brainfuck)];
			}

			case "dart": {
				const { dart } = await import("@codemirror/legacy-modes/mode/clike");
				const { StreamLanguage } = await import("@codemirror/language");
				return [StreamLanguage.define(dart)];
			}

			case "c": {
				const { c } = await import("@codemirror/legacy-modes/mode/clike");
				const { StreamLanguage } = await import("@codemirror/language");
				return [StreamLanguage.define(c)];
			}

			case "crystal": {
				const { crystal } = await import(
					"@codemirror/legacy-modes/mode/crystal"
				);
				const { StreamLanguage } = await import("@codemirror/language");
				return [StreamLanguage.define(crystal)];
			}

			case "lua": {
				const { lua } = await import("@codemirror/legacy-modes/mode/lua");
				const { StreamLanguage } = await import("@codemirror/language");
				return [StreamLanguage.define(lua)];
			}

			case "go": {
				const { go } = await import("@codemirror/legacy-modes/mode/go");
				const { StreamLanguage } = await import("@codemirror/language");
				return [StreamLanguage.define(go)];
			}

			case "cobol": {
				const { cobol } = await import("@codemirror/legacy-modes/mode/cobol");
				const { StreamLanguage } = await import("@codemirror/language");
				return [StreamLanguage.define(cobol)];
			}

			case "d": {
				const { d } = await import("@codemirror/legacy-modes/mode/d");
				const { StreamLanguage } = await import("@codemirror/language");
				return [StreamLanguage.define(d)];
			}

			case "fortran": {
				const { fortran } = await import(
					"@codemirror/legacy-modes/mode/fortran"
				);
				const { StreamLanguage } = await import("@codemirror/language");
				return [StreamLanguage.define(fortran)];
			}

			case "haskell": {
				const { haskell } = await import(
					"@codemirror/legacy-modes/mode/haskell"
				);
				const { StreamLanguage } = await import("@codemirror/language");
				return [StreamLanguage.define(haskell)];
			}

			case "julia": {
				const { julia } = await import("@codemirror/legacy-modes/mode/julia");
				const { StreamLanguage } = await import("@codemirror/language");
				return [StreamLanguage.define(julia)];
			}

			case "lisp": {
				const { commonLisp } = await import(
					"@codemirror/legacy-modes/mode/commonlisp"
				);
				const { StreamLanguage } = await import("@codemirror/language");
				return [StreamLanguage.define(commonLisp)];
			}

			case "perl": {
				const { perl } = await import("@codemirror/legacy-modes/mode/perl");
				const { StreamLanguage } = await import("@codemirror/language");
				return [StreamLanguage.define(perl)];
			}
			default:
				return [];
		}
	}

	async function getKeymapExtensions(requestedKeymap?: string) {
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
				const { vscodeKeymap } = await import(
					"@replit/codemirror-vscode-keymap"
				);
				const { keymap: codemirrorKeymap } = await import("@codemirror/view");
				return codemirrorKeymap.of(vscodeKeymap);
			}
		}
	}
</script>

{#await Promise.all( [CodemirrorWrapper, getEditorTheme(), getEditorConfig(language, $preferences)] )}
	<div class="flex min-h-[300px] items-center justify-center">
		<p>Loading editor...</p>
	</div>
{:then [{ default: Wrapper }, theme, editorConfig]}
	<Wrapper
		bind:value
		{theme}
		{readonly}
		{...editorConfig}
		styles={{
			".cm-content": { maxWidth: "90vw" },
			".cm-editor": {
				display: "flex",
				height: "100%"
			},
			".cm-scroller, .cm-gutters": {
				height: "35vh",
				minHeight: "300px",
				overflow: "auto"
			}
		}}
	/>
{:catch error}
	<div class="min-h-[300px] p-4 text-red-700 dark:text-red-300">
		Failed to load editor: {error.message}
	</div>
{/await}
