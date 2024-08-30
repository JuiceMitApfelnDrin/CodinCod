<script lang="ts">
	import CodeMirror from "svelte-codemirror-editor";
	import { javascript } from "@codemirror/lang-javascript";
	import { python } from "@codemirror/lang-python";
	// import { html } from "@codemirror/lang-html";
	// import { css } from "@codemirror/lang-css";
	import { oneDark } from "@codemirror/theme-one-dark";
	import { DEFAULT_LANGUAGE, languageKeys, type Language } from "@/config/languages";

	export let value = "";
	export let language: Language = DEFAULT_LANGUAGE;

	let lang;

	$: lang = languageFunction();

	function languageFunction() {
		switch (language) {
			case languageKeys.js:
				return javascript();
			case languageKeys.ts:
				return javascript({ typescript: true });
			case languageKeys.py:
				return python();
			default:
				return javascript();
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
