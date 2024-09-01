<script lang="ts">
	import CodeMirror from "svelte-codemirror-editor";
	import { javascript } from "@codemirror/lang-javascript";
	import { python } from "@codemirror/lang-python";
	// import { html } from "@codemirror/lang-html";
	// import { css } from "@codemirror/lang-css";
	import { oneDark } from "@codemirror/theme-one-dark";
	import { DEFAULT_LANGUAGE, type LanguageLabel } from "types";

	export let value = "";
	export let language = DEFAULT_LANGUAGE;

	let lang;

	$: lang = codeMirrorLanguageSupport(language);

	function codeMirrorLanguageSupport(language: LanguageLabel) {
		switch (language) {
			case "javascript":
				return javascript();
			case "typescript":
				return javascript({ typescript: true });
			case "python":
				return python();
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
			height: "100%",
			display: "flex"
		},
		".cm-scroller, .cm-gutters": { minHeight: "300px", overflow: "auto", height: "70vh" }
	}}
/>
