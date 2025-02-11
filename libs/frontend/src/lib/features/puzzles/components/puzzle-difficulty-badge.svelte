<script lang="ts">
	import { Badge, type Variant } from "@/components/ui/badge";
	import { DifficultyEnum, type Difficulty } from "types";

	export let difficulty: Difficulty = DifficultyEnum.INTERMEDIATE;

	let variant: Variant = "default";

	$: {
		switch (difficulty) {
			case DifficultyEnum.ADVANCED:
				variant = "destructive";
				break;
			case DifficultyEnum.EXPERT:
				variant = "destructive";
				break;
			case DifficultyEnum.INTERMEDIATE:
				variant = "default";
				break;
			case DifficultyEnum.BEGINNER:
				variant = "success";
				break;
		}
	}
</script>

<Badge {variant}>{difficulty}</Badge>
