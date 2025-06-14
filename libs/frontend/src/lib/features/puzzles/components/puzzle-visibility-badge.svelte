<script lang="ts">
	import { Badge, type BadgeVariant } from "@/components/ui/badge";
	import { puzzleVisibilityEnum, type PuzzleVisibility } from "types";

	interface Props {
		visibility?: PuzzleVisibility;
	}

	let { visibility = puzzleVisibilityEnum.DRAFT }: Props = $props();

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
