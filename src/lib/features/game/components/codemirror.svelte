<script lang="ts">
	import CodeMirror from "svelte-codemirror-editor";
	import { javascript } from "@codemirror/lang-javascript";
	// import { typescript } from "@codemirror/lang-typescript";
	// import { python } from "@codemirror/lang-python";
	// import { html } from "@codemirror/lang-html";
	// import { css } from "@codemirror/lang-css";
	import type { Language } from "@/models/puzzle.model";

	export let value = "";
	export let language: Language | null = null;

	let lang;

	$: lang = languageFunction();

	function languageFunction() {
		switch (language) {
			case "javascript":
				return javascript();
			case "typescript":
				return javascript({ typescript: true });
			// case "python":
			// 	return python();
			// case "html":
			// 	return html();
			// case "css":
			// 	return css();
			default:
				return javascript();
		}
	}
</script>

<CodeMirror bind:value {lang} />
