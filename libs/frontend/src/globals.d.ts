declare module "*.md" {
	import type { Component } from "svelte";

	export default class Comp extends Component {}

	export const metadata: Record<string, unknown>;

	declare const __APP_VERSION__: string;
}
