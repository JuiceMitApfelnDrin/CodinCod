<script lang="ts">
	import CodeMirror from "svelte-codemirror-editor";
	import { oneDark } from "@codemirror/theme-one-dark";
	import { keymap, type PuzzleLanguage } from "types";
	import { StreamLanguage } from "@codemirror/language";
	import { type Extension } from "@codemirror/state";
	import { preferences } from "@/stores/preferences";
	import { keymap as codemirrorKeymap } from "@codemirror/view";

	export let value = "";
	export let language: PuzzleLanguage = "";

	let editorExtensions: Extension[] = [];

	$: {
		getEditorExtensions(language, $preferences?.editor?.keymap);
	}

	async function getEditorExtensions(language: string, keymapPreference?: string) {
		editorExtensions = [
			oneDark,
			await getKeymapExtensions(keymapPreference),
			...(await getLanguageExtensions(language))
		];
	}

	async function getLanguageExtensions(
		language: PuzzleLanguage
	): Promise<Extension[] | StreamLanguage<unknown>[]> {
		let chosenLanguageExtension: Extension[] = [];

		switch (language) {
			case "javascript":
				return [(await import("@codemirror/lang-javascript")).javascript()];

			case "python":
				return [(await import("@codemirror/lang-python")).python()];

			case "typescript":
				return [
					(await import("@codemirror/lang-javascript")).javascript({
						typescript: true
					})
				];

			case "rust":
				return [(await import("@codemirror/lang-rust")).rust()];

			case "c++":
				return [(await import("@codemirror/lang-cpp")).cpp()];

			case "elixir":
				return [(await import("codemirror-lang-elixir")).elixir()];

			case "prolog":
				return [(await import("codemirror-lang-prolog")).prolog()];

			case "ruby":
				const { ruby } = await import("@codemirror/legacy-modes/mode/ruby");
				return [StreamLanguage.define(ruby)];

			case "brainfuck":
				const { brainfuck } = await import("@codemirror/legacy-modes/mode/brainfuck");
				return [StreamLanguage.define(brainfuck)];

			case "dart":
				const { dart } = await import("@codemirror/legacy-modes/mode/clike");
				return [StreamLanguage.define(dart)];

			case "c":
				const { c } = await import("@codemirror/legacy-modes/mode/clike");
				return [StreamLanguage.define(c)];

			case "crystal":
				const { crystal } = await import("@codemirror/legacy-modes/mode/crystal");
				return [StreamLanguage.define(crystal)];

			case "lua":
				const { lua } = await import("@codemirror/legacy-modes/mode/lua");
				return [StreamLanguage.define(lua)];

			case "go":
				const { go } = await import("@codemirror/legacy-modes/mode/go");
				return [StreamLanguage.define(go)];

			case "cobol":
				const { cobol } = await import("@codemirror/legacy-modes/mode/cobol");
				return [StreamLanguage.define(cobol)];

			case "d":
				const { d } = await import("@codemirror/legacy-modes/mode/d");
				return [StreamLanguage.define(d)];

			case "fortran":
				const { fortran } = await import("@codemirror/legacy-modes/mode/fortran");
				return [StreamLanguage.define(fortran)];

			case "haskell":
				const { haskell } = await import("@codemirror/legacy-modes/mode/haskell");
				return [StreamLanguage.define(haskell)];

			case "julia":
				const { julia } = await import("@codemirror/legacy-modes/mode/julia");
				return [StreamLanguage.define(julia)];

			case "lisp":
				const { commonLisp } = await import("@codemirror/legacy-modes/mode/commonlisp");
				return [StreamLanguage.define(commonLisp)];

			case "perl":
				const { perl } = await import("@codemirror/legacy-modes/mode/perl");
				return [StreamLanguage.define(perl)];

			case "awk":
				// awk - No legacy mode available
				break;
			case "raku":
				// raku - No legacy mode available
				// @code-golf has a raku implementation - https://github.com/code-golf/code-golf/blob/master/js/vendor/codemirror-raku.js
				break;
		}

		return chosenLanguageExtension;
	}

	async function getKeymapExtensions(requestedKeymap?: string): Promise<Extension> {
		switch (requestedKeymap) {
			case keymap.EMACS:
				const { emacs } = await import("@replit/codemirror-emacs");
				return emacs();

			case keymap.VIM:
				const { vim } = await import("@replit/codemirror-vim");
				return vim();

			default:
				const { vscodeKeymap } = await import("@replit/codemirror-vscode-keymap");
				return codemirrorKeymap.of(vscodeKeymap);
		}
	}
</script>

<CodeMirror
	bind:value
	theme={oneDark}
	extensions={editorExtensions}
	basic={true}
	styles={{
		".cm-editor": {
			display: "flex",
			height: "100%"
		},
		".cm-scroller, .cm-gutters": { height: "35vh", minHeight: "300px", overflow: "auto" }
	}}
/>
