<script lang="ts">
	import { run } from "svelte/legacy";

	import { Badge, type Variant } from "@/components/ui/badge";
	import { puzzleVisibilityEnum, type PuzzleVisibility } from "types";

	interface Props {
		visibility?: PuzzleVisibility;
	}

	let { visibility = puzzleVisibilityEnum.DRAFT }: Props = $props();

	let variant: Variant = $state("default");

	run(() => {
		switch (visibility) {
			case puzzleVisibilityEnum.APPROVED:
				variant = "success";
				break;
			case puzzleVisibilityEnum.REVIEW:
				variant = "default";
				break;
			case puzzleVisibilityEnum.DRAFT:
				variant = "destructive";
				break;
			case puzzleVisibilityEnum.REVISE:
				variant = "default";
				break;
			case puzzleVisibilityEnum.INACTIVE:
				variant = "default";
				break;
			case puzzleVisibilityEnum.ARCHIVED:
				variant = "default";
				break;
		}
	});
</script>

<Badge {variant}>{visibility}</Badge>
