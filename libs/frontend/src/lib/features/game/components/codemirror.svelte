<script lang="ts">
	import CodeMirror from "svelte-codemirror-editor";
	import { javascript } from "@codemirror/lang-javascript";
	import { python } from "@codemirror/lang-python";
	// import { html } from "@codemirror/lang-html";
	// import { css } from "@codemirror/lang-css";
	import { oneDark } from "@codemirror/theme-one-dark";
	import { type PuzzleLanguage } from "types";

	export let value = "";
	export let language: PuzzleLanguage = "";

	let lang;

	$: lang = codeMirrorLanguageSupport(language);

	function codeMirrorLanguageSupport(language: PuzzleLanguage) {
		switch (language) {
			case "javascript":
				return javascript();
			case "python":
				return python();
			case "typescript":
				return javascript({ typescript: true });
			default:
				return null;
		}
	}
</script>

<CodeMirror
	bind:value
	{lang}
	theme={oneDark}
	styles={{
		".cm-editor": {
			display: "flex",
			height: "100%"
		},
		".cm-scroller, .cm-gutters": { height: "35vh", minHeight: "300px", overflow: "auto" }
	}}
	class="codemirror-default-height"
/>
