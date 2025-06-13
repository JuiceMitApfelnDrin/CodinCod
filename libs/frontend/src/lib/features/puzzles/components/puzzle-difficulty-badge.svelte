<script lang="ts">
	import { run } from 'svelte/legacy';

	import { Badge, type Variant } from "@/components/ui/badge";
	import { DifficultyEnum, type Difficulty } from "types";

	interface Props {
		difficulty?: Difficulty;
	}

	let { difficulty = DifficultyEnum.INTERMEDIATE }: Props = $props();

	let variant: Variant = $state("default");

	run(() => {
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
	});
</script>

<Badge {variant}>{difficulty}</Badge>
