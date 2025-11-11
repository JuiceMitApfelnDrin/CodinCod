<script lang="ts">
	import { Badge, type BadgeVariant } from "@/components/ui/badge";
	import type { PuzzleVisibility } from "$lib/types/core/puzzle/schema/puzzle-visibility.schema.js";
	import { puzzleVisibilityEnum } from "$lib/types/core/puzzle/enum/puzzle-visibility-enum.js";

	let {
		visibility = puzzleVisibilityEnum.DRAFT
	}: {
		visibility?: PuzzleVisibility;
	} = $props();

	const variantMap: Record<PuzzleVisibility, BadgeVariant> = {
		[puzzleVisibilityEnum.APPROVED]: "success",
		[puzzleVisibilityEnum.REVIEW]: "default",
		[puzzleVisibilityEnum.DRAFT]: "destructive",
		[puzzleVisibilityEnum.REVISE]: "default",
		[puzzleVisibilityEnum.INACTIVE]: "default",
		[puzzleVisibilityEnum.ARCHIVED]: "default",
		[puzzleVisibilityEnum.READY]: "default"
	};

	let variant = $derived(variantMap[visibility] ?? "default");
</script>

<Badge {variant}>{visibility}</Badge>
