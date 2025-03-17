<script lang="ts">
	import { cn } from "@/utils/cn";
	import Toggle from "./toggle.svelte";
	import { CheckIcon } from "lucide-svelte";

	export let checked: boolean;
	export let onChecked: () => void;
</script>

<Toggle
	pressed={checked}
	onPressedChange={onChecked}
	class={cn("border border-white", checked ? "" : "border-opacity-50")}
>
	<CheckIcon class={cn(!checked && "invisible")} aria-hidden="true" />
</Toggle>
