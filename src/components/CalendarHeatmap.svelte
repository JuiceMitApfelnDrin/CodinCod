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
	for (let i = 0; i < 364; i++) {
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

	const minSolvedPuzzles: number = Math.min(...days);
	const maxSolvedPuzzles: number = Math.max(...days);

	const dayIndexToFormattedDate = (index: number): string => {
		const date = new Date();
		return new Date(date.setDate(date.getDate() - index)).toLocaleString(undefined, {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	const calcDayStyle = (solvedPuzzles: number): string => {
		if (solvedPuzzles > 0)
			return `background: rgba(217, 70, 239, ${
				calculatePercentage(minSolvedPuzzles, maxSolvedPuzzles, solvedPuzzles) + 0.15
			});`;

		return `background: rgba(64, 64, 64, 1)`;
	};

	const dayNames: string[] = Array.from({ length: 7 }).map((_, index) => {
		const date = new Date();
		return new Date(date.setDate(date.getDate() - index))
			.toLocaleDateString(undefined, {
				weekday: 'short'
			})
			.toUpperCase();
	});
</script>

<div
	class="flex items-center rounded-lg justify-center w-full h-full border bg-white dark:border-primary-500 border-primary-700 dark:bg-black"
>
	<!-- TODO: possibly make this a table instead, with a tooltips and sr-only text -->
	<div class="calendar py-10 px-5">
		{#each dayNames as dayName}
			<p
				class="day-header font-bold flex justify-center items-center dark:text-primary-300 text-primary-600 text-left w-full"
			>
				{dayName}
			</p>
		{/each}

		{#each days as solvedPuzzles, index}
			<div
				class="day rounded shadow-sm shadow-neutral-700"
				style={calcDayStyle(solvedPuzzles)}
				title="Solved {solvedPuzzles} puzzles on {dayIndexToFormattedDate(index)}"
			/>
		{/each}
	</div>
</div>

<style>
	:root {
		--square-size: 0.75rem;
	}

	.calendar {
		display: grid;
		grid: repeat(7, var(--square-size)) / auto repeat(53, var(--square-size));
		grid-auto-flow: column;
		gap: 0.4rem;
		overflow: hidden;
	}

	.day-header {
		font-size: calc(var(--square-size) - 0.05rem);
	}

	.calendar .day {
		height: var(--square-size);
		width: var(--square-size);
	}
</style>
