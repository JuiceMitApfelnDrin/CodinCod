<script lang="ts">
	import CodeMirror from "svelte-codemirror-editor";
	import { oneDark } from "@codemirror/theme-one-dark";
	import { type PuzzleLanguage } from "types";
	import { StreamLanguage } from "@codemirror/language";
	import { Compartment, type Extension } from "@codemirror/state";
	import { preferences } from "@/stores/preferences";
	import { keymap } from "@codemirror/view";

	export let value = "";
	export let language: PuzzleLanguage = "";

	let editorExtensions: Extension[] = [];

	const langCompartment = new Compartment();
	const keymapCompartment = new Compartment();

	$: getEditorExtensions(language, $preferences?.ide?.keyBinding);

	async function getEditorExtensions(language: string, keyBinding?: string) {
		const baseExtensions = [oneDark];

		editorExtensions = [
			...baseExtensions,
			...(await getLanguageExtensions(language)),
			...(await getKeyBindingExtensions(keyBinding))
		];
	}

	async function getLanguageExtensions(language: PuzzleLanguage) {
		let languageExtensions;

		switch (language) {
			case "javascript":
				languageExtensions = (await import("@codemirror/lang-javascript")).javascript();
				break;

			case "python":
				languageExtensions = (await import("@codemirror/lang-python")).python();
				break;

			case "typescript":
				languageExtensions = (await import("@codemirror/lang-javascript")).javascript({
					typescript: true
				});
				break;

			case "rust":
				languageExtensions = (await import("@codemirror/lang-rust")).rust();
				break;

			case "c++":
				languageExtensions = (await import("@codemirror/lang-cpp")).cpp();
				break;

			case "elixir":
				languageExtensions = (await import("codemirror-lang-elixir")).elixir();
				break;

			case "ruby":
				const { ruby } = await import("@codemirror/legacy-modes/mode/ruby");
				languageExtensions = StreamLanguage.define(ruby);
			case "brainfuck":
				const { brainfuck } = await import("@codemirror/legacy-modes/mode/brainfuck");
				languageExtensions = StreamLanguage.define(brainfuck);
				break;

			case "dart":
				const { dart } = await import("@codemirror/legacy-modes/mode/clike");
				languageExtensions = StreamLanguage.define(dart);
				break;

			case "c":
				const { c } = await import("@codemirror/legacy-modes/mode/clike");
				languageExtensions = StreamLanguage.define(c);
				break;

			case "d":
				const { d } = await import("@codemirror/legacy-modes/mode/d");
				languageExtensions = StreamLanguage.define(d);
				break;

			case "fortran":
				const { fortran } = await import("@codemirror/legacy-modes/mode/fortran");
				languageExtensions = StreamLanguage.define(fortran);
				break;

			case "haskell":
				const { haskell } = await import("@codemirror/legacy-modes/mode/haskell");
				languageExtensions = StreamLanguage.define(haskell);
				break;

			case "julia":
				const { julia } = await import("@codemirror/legacy-modes/mode/julia");
				languageExtensions = StreamLanguage.define(julia);
				break;

			case "lisp":
				const { commonLisp } = await import("@codemirror/legacy-modes/mode/commonlisp");
				languageExtensions = StreamLanguage.define(commonLisp);
				break;

			case "perl":
				const { perl } = await import("@codemirror/legacy-modes/mode/perl");
				languageExtensions = StreamLanguage.define(perl);
				break;

			case "awk":
				// awk         - No legacy mode available
				break;
			case "raku":
				// raku        - No legacy mode available
				break;
		}

		if (languageExtensions) {
			return [langCompartment.of(languageExtensions)];
		}

		return [];
	}

	async function getKeyBindingExtensions(keyBinding?: string) {
		let chosenKeyBinding;

		switch (keyBinding) {
			case "emacs":
				const { emacs } = await import("@replit/codemirror-emacs");
				chosenKeyBinding = emacs();

			case "vim":
				const { vim } = await import("@replit/codemirror-vim");
				chosenKeyBinding = vim();

			case "vscode":
				const { vscodeKeymap } = await import("@replit/codemirror-vscode-keymap");
				chosenKeyBinding = keymap.of(vscodeKeymap);
		}

		if (chosenKeyBinding) {
			return [keymapCompartment.of(chosenKeyBinding)];
		}

		return [];
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
	class="h-[35vh] min-h-[300px]"
/>
