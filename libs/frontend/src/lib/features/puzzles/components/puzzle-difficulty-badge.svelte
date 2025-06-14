<script lang="ts">
	import { Badge, type BadgeVariant } from "@/components/ui/badge";
	import { DifficultyEnum, type Difficulty } from "types";

	interface Props {
		difficulty?: Difficulty;
	}

	let { difficulty = DifficultyEnum.INTERMEDIATE }: Props = $props();

	const variantMap: Record<Difficulty, BadgeVariant> = {
		[DifficultyEnum.BEGINNER]: "success",
		[DifficultyEnum.INTERMEDIATE]: "default",
		[DifficultyEnum.ADVANCED]: "destructive",
		[DifficultyEnum.EXPERT]: "destructive"
	};

	let variant = $derived(variantMap[difficulty] ?? "default");
</script>

<Badge {variant}>{difficulty}</Badge>
