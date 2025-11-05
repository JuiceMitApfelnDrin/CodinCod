<script lang="ts">
	import { Badge, type BadgeVariant } from "@/components/ui/badge";
	import { DifficultyEnum, type Difficulty } from "$lib/types";

	let {
		difficulty = DifficultyEnum.INTERMEDIATE
	}: {
		difficulty?: Difficulty;
	} = $props();

	const variantMap: Record<Difficulty, BadgeVariant> = {
		[DifficultyEnum.BEGINNER]: "success",
		[DifficultyEnum.INTERMEDIATE]: "default",
		[DifficultyEnum.ADVANCED]: "destructive",
		[DifficultyEnum.EXPERT]: "destructive"
	};

	let variant = $derived(variantMap[difficulty] ?? "default");
</script>

<Badge {variant}>{difficulty}</Badge>
