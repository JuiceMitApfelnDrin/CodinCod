<script lang="ts">
	import { Badge, type Variant } from "@/components/ui/badge";
	import { PuzzleResultEnum, type PuzzleResult } from "types";

	export let result: PuzzleResult = PuzzleResultEnum.UNKNOWN;

	let variant: Variant = "default";

	$: {
		switch (result) {
			case PuzzleResultEnum.SUCCESS:
				variant = "success";
				break;
			case PuzzleResultEnum.ERROR:
				variant = "destructive";
				break;
			case PuzzleResultEnum.UNKNOWN:
				variant = "default";
				break;
		}
	}
</script>

<Badge {variant}>{result}</Badge>
