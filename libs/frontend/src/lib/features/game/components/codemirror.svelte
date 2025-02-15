<script lang="ts">
	import CodeMirror from "svelte-codemirror-editor";
	import { oneDark } from "@codemirror/theme-one-dark";
	import { type PuzzleLanguage } from "types";
	import { StreamLanguage, type LanguageSupport } from "@codemirror/language";
	import type { Extension } from "@codemirror/state";

	export let value = "";
	export let language: PuzzleLanguage = "";

	let lang: LanguageSupport | null = null;
	let extensions: Extension[] = [];

	$: loadLanguageSupport(language);

	async function loadLanguageSupport(language: PuzzleLanguage) {
		let newExtensions: Extension[] = [];

		switch (language) {
			// awk         - No legacy mode available
			// raku        - No legacy mode available
			case "javascript":
				lang = (await import("@codemirror/lang-javascript")).javascript();
				break;

			case "python":
				lang = (await import("@codemirror/lang-python")).python();
				break;

			case "typescript":
				lang = (await import("@codemirror/lang-javascript")).javascript({ typescript: true });
				break;

			case "rust":
				lang = (await import("@codemirror/lang-rust")).rust();
				break;

			case "c++":
				lang = (await import("@codemirror/lang-cpp")).cpp();
				break;

			case "elixir":
				lang = (await import("codemirror-lang-elixir")).elixir();
				break;

			case "ruby":
				const { ruby } = await import("@codemirror/legacy-modes/mode/ruby");
				newExtensions.push(StreamLanguage.define(ruby));
				lang = null;
				break;
			case "brainfuck":
				const { brainfuck } = await import("@codemirror/legacy-modes/mode/brainfuck");
				newExtensions.push(StreamLanguage.define(brainfuck));
				lang = null;
				break;

			case "dart":
				const { dart } = await import("@codemirror/legacy-modes/mode/clike");
				newExtensions.push(StreamLanguage.define(dart));
				break;

			case "c":
				const { c } = await import("@codemirror/legacy-modes/mode/clike");
				newExtensions.push(StreamLanguage.define(c));
				break;

			case "d":
				const { d } = await import("@codemirror/legacy-modes/mode/d");
				newExtensions.push(StreamLanguage.define(d));
				break;

			case "fortran":
				const { fortran } = await import("@codemirror/legacy-modes/mode/fortran");
				newExtensions.push(StreamLanguage.define(fortran));
				break;

			case "haskell":
				const { haskell } = await import("@codemirror/legacy-modes/mode/haskell");
				newExtensions.push(StreamLanguage.define(haskell));
				break;

			case "julia":
				const { julia } = await import("@codemirror/legacy-modes/mode/julia");
				newExtensions.push(StreamLanguage.define(julia));
				break;

			case "lisp":
				const { commonLisp } = await import("@codemirror/legacy-modes/mode/commonlisp");
				newExtensions.push(StreamLanguage.define(commonLisp));
				break;

			case "perl":
				const { perl } = await import("@codemirror/legacy-modes/mode/perl");
				newExtensions.push(StreamLanguage.define(perl));
				break;

			default:
				lang = null;
		}

		extensions = newExtensions;
	}
</script>

<CodeMirror
	bind:value
	{lang}
	theme={oneDark}
	{extensions}
	basic={true}
	styles={{
		".cm-editor": {
			display: "flex",
			height: "100%"
		},
		".cm-scroller, .cm-gutters": { height: "35vh", minHeight: "300px", overflow: "auto" }
	}}
	class="h-[35vh] min-h-[300px]"
/>
