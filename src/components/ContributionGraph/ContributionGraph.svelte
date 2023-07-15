<script lang="ts">
	import type { Submission } from '$models/submission.model';
	import { calculatePercentage } from '$utils/calculatePercentage';

	export let solvedPuzzles: Submission[] = [];

	// create the thing first, then use it
	let days: number[] = [];

	const currentDate = new Date();

	// go from back to front, since submissions are added always at the back
	let currentIndexItemInSolvedPuzzles = solvedPuzzles.length - 1;

	// go over the previous 365 days
	for (let i = 0; i < 365; i++) {
		let solutionsThisDay = 0;
		// Calculate the date for the current iteration
		const pastDate = new Date();
		pastDate.setDate(currentDate.getDate() - i);

		while (
			currentIndexItemInSolvedPuzzles >= 0 &&
			pastDate < new Date(solvedPuzzles[currentIndexItemInSolvedPuzzles]?.submitted_at)
		) {
			currentIndexItemInSolvedPuzzles -= 1;
			solutionsThisDay += 1;
		}

		days.push(solutionsThisDay);
	}

	const min: number = Math.min(...days);
	const max: number = Math.max(...days);

	const dayIndexToFormattedDate = (index: number): string => {
		const date = new Date();
		return new Date(date.setDate(date.getDate() - index)).toLocaleString(undefined, {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};
</script>

<div class="w-full h-full rounded calendar border border-primary-200 bg-black p-10">
	{#each days as day, index}
		<div
			class="day rounded shadow-sm shadow-neutral-700 w-4 h-4"
			style="--opacity: {calculatePercentage(min, max, day) + 0.15};"
			title="solved {day} puzzles on {dayIndexToFormattedDate(index)}"
		/>
	{/each}
</div>

<style>
	.calendar {
		display: grid;
		grid: repeat(7, 25px) / auto-flow 25px;

		overflow: hidden;
	}

	.day {
		background: rgba(217, 70, 239, var(--opacity));
	}
</style>
