<script lang="ts">
	import { Badge, type BadgeVariant } from "@/components/ui/badge";
	import type { Difficulty } from "$lib/types/core/puzzle/schema/difficulty.schema.js";
	import { DifficultyEnum } from "$lib/types/core/puzzle/enum/difficulty-enum.js";

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
