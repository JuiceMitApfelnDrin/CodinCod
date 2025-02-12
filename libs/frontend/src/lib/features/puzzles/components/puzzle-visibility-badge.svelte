<script lang="ts">
	import { Badge, type Variant } from "@/components/ui/badge";
	import { PuzzleVisibilityEnum, type PuzzleVisibility } from "types";

	export let visibility: PuzzleVisibility = PuzzleVisibilityEnum.DRAFT;

	let variant: Variant = "default";

	$: {
		switch (visibility) {
			case PuzzleVisibilityEnum.APPROVED:
				variant = "success";
				break;
			case PuzzleVisibilityEnum.REVIEW:
				variant = "default";
				break;
			case PuzzleVisibilityEnum.DRAFT:
				variant = "destructive";
				break;
			case PuzzleVisibilityEnum.REVISE:
				variant = "default";
				break;
			case PuzzleVisibilityEnum.INACTIVE:
				variant = "default";
				break;
			case PuzzleVisibilityEnum.ARCHIVED:
				variant = "default";
				break;
		}
	}
</script>

<Badge {variant}>{visibility}</Badge>
