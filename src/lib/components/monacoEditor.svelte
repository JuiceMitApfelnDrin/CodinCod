<script lang="ts">
	import loader from "@monaco-editor/loader";
	import type monaco from "monaco-editor";
	import { onDestroy, onMount } from "svelte";
	import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
	import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
	import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
	import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
	import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

	let editorContainer: HTMLDivElement | null = null;
	let editor: monaco.editor.IStandaloneCodeEditor;
	let monaco;

	onMount(async () => {
		// @ts-ignore
		self.MonacoEnvironment = {
			getWorker: function (_moduleId: any, label: string) {
				if (label === "json") {
					return new jsonWorker();
				}
				if (label === "css" || label === "scss" || label === "less") {
					return new cssWorker();
				}
				if (label === "html" || label === "handlebars" || label === "razor") {
					return new htmlWorker();
				}
				if (label === "typescript" || label === "javascript") {
					return new tsWorker();
				}
				return new editorWorker();
			}
		};

		const monacoEditor = await import("monaco-editor");
		loader.config({ monaco: monacoEditor.default });

		monaco = await loader.init();

		if (editorContainer instanceof HTMLDivElement) {
			editor = monaco.editor.create(editorContainer, {
				value: ["function x() {", '\tconsole.log("Hello world!");', "}"].join("\n"),
				language: "javascript",
				minimap: {
					enabled: false // Disable the code preview (minimap)
				},
				automaticLayout: true // Enable automatic layout
			});

			monaco.editor.setTheme("vs-dark");
		}

		return () => {
			if (editor) editor.dispose();
		};
	});

	onDestroy(() => {
		if (editor) editor.dispose();
	});
</script>

<div class="ding max-w-screen z-0 max-h-screen" bind:this={editorContainer} />

<style>
	.ding {
		height: 500px;
		widows: 500px;
	}
</style>
