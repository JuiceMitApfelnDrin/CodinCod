<script lang="ts">
	import { cn } from "@/utils/cn";
	import Toggle from "./toggle.svelte";
	import { CheckIcon } from "lucide-svelte";

	interface Props {
		checked: boolean;
		onChecked: () => void;
	}

	let { checked, onChecked }: Props = $props();
</script>

<Toggle
	pressed={checked}
	onPressedChange={onChecked}
	class={cn(
		"border-2 border-black dark:border-white",
		checked ? "border-opacity-75" : "border-opacity-25"
	)}
>
	<CheckIcon class={cn("size-4", !checked && "invisible")} aria-hidden="true" />
</Toggle>
