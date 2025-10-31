<script lang="ts">
	import { onMount } from "svelte";
	import { gameModeEnum, type GameMode, type LeaderboardAPI } from "types";
	import { backendUrls } from "types";

	// Reactive state using Svelte 5 runes
	let selectedMode = $state<GameMode>(gameModeEnum.FASTEST);
	let leaderboardData = $state<Exclude<
		LeaderboardAPI.GetLeaderboardResponse,
		{ error: string }
	> | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let currentPage = $state(1);
	const pageSize = 50;

	// Derived game mode display names
	const gameModeNames: Record<GameMode, string> = {
		[gameModeEnum.FASTEST]: "Fastest",
		[gameModeEnum.SHORTEST]: "Shortest Code",
		[gameModeEnum.BACKWARDS]: "Backwards",
		[gameModeEnum.HARDCORE]: "Hardcore",
		[gameModeEnum.DEBUG]: "Debug",
		[gameModeEnum.TYPERACER]: "Type Racer",
		[gameModeEnum.EFFICIENCY]: "Efficiency",
		[gameModeEnum.INCREMENTAL]: "Incremental",
		[gameModeEnum.RANDOM]: "Random"
	};

	// Fetch leaderboard data
	async function fetchLeaderboard(mode: GameMode, page: number) {
		loading = true;
		error = null;

		try {
			const url = `${backendUrls.leaderboardByGameMode(mode)}?page=${page}&pageSize=${pageSize}`;
			const response = await fetch(url, {
				credentials: "include"
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
			}

			const data = await response.json();

			// Type guard to check if response is error
			if ("error" in data) {
				throw new Error(data.error);
			}

			leaderboardData = data;
		} catch (err) {
			error = err instanceof Error ? err.message : "Failed to load leaderboard";
			leaderboardData = null;
		} finally {
			loading = false;
		}
	}

	// Watch for mode changes
	$effect(() => {
		fetchLeaderboard(selectedMode, currentPage);
	});

	// Page navigation
	function nextPage() {
		if (leaderboardData && currentPage < leaderboardData.totalPages) {
			currentPage++;
		}
	}

	function previousPage() {
		if (currentPage > 1) {
			currentPage--;
		}
	}

	function selectMode(mode: GameMode) {
		selectedMode = mode;
		currentPage = 1; // Reset to first page when changing modes
	}

	// Format date nicely
	function formatDate(date: string | Date): string {
		const dateObj = typeof date === "string" ? new Date(date) : date;
		return dateObj.toLocaleString();
	}

	// Format rating with color
	function getRatingColor(rating: number): string {
		if (rating >= 2000) return "text-purple-600 dark:text-purple-400";
		if (rating >= 1800) return "text-blue-600 dark:text-blue-400";
		if (rating >= 1600) return "text-green-600 dark:text-green-400";
		if (rating >= 1400) return "text-yellow-600 dark:text-yellow-400";
		return "text-gray-600 dark:text-gray-400";
	}

	// Get rank badge
	function getRankBadge(rank: number): string {
		if (rank === 1) return "🥇";
		if (rank === 2) return "🥈";
		if (rank === 3) return "🥉";
		return "";
	}
</script>

<div class="leaderboard-container mx-auto max-w-7xl px-4 py-8">
	<h1 class="mb-8 text-center text-4xl font-bold">Leaderboards</h1>

	<!-- Game Mode Selector -->
	<div class="mode-selector mb-8">
		<div class="flex flex-wrap justify-center gap-2">
			{#each Object.values(gameModeEnum) as mode}
				<button
					class="rounded-lg px-4 py-2 transition-colors {selectedMode === mode
						? 'bg-blue-600 text-white'
						: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'}"
					onclick={() => selectMode(mode)}
				>
					{gameModeNames[mode]}
				</button>
			{/each}
		</div>
	</div>

	<!-- Loading State -->
	{#if loading}
		<div class="flex items-center justify-center py-20">
			<div
				class="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"
			></div>
		</div>
	{/if}

	<!-- Error State -->
	{#if error}
		<div
			class="mb-4 rounded-lg bg-red-100 p-4 text-red-800 dark:bg-red-900 dark:text-red-200"
		>
			{error}
		</div>
	{/if}

	<!-- Leaderboard Table -->
	{#if leaderboardData && !loading}
		<div class="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800">
			<!-- Header -->
			<div
				class="border-b border-gray-200 bg-gray-100 px-6 py-4 dark:border-gray-600 dark:bg-gray-700"
			>
				<h2 class="text-2xl font-semibold">
					{gameModeNames[selectedMode]} Leaderboard
				</h2>
				<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
					Last updated: {formatDate(leaderboardData.lastUpdated)}
				</p>
			</div>

			<!-- Table -->
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead
						class="border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700"
					>
						<tr>
							<th
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
							>
								Rank
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
							>
								Player
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
							>
								Rating
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
							>
								Games
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
							>
								Win Rate
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
							>
								Best Score
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
							>
								Avg Score
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
						{#each leaderboardData.entries as entry}
							<tr
								class="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
							>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="text-2xl">{getRankBadge(entry.rank)}</span>
									<span class="ml-2 font-semibold">#{entry.rank}</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<a
										href="/user/{entry.username}"
										class="font-medium text-blue-600 hover:underline dark:text-blue-400"
									>
										{entry.username}
									</a>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span
										class="text-lg font-bold {getRatingColor(entry.rating)}"
									>
										{Math.round(entry.rating)}
									</span>
									<span class="ml-1 text-xs text-gray-500 dark:text-gray-400">
										(±{Math.round(entry.glicko.rd)})
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="font-medium">{entry.gamesPlayed}</span>
									<span class="ml-1 text-sm text-green-600 dark:text-green-400">
										{entry.gamesWon}W
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center">
										<div
											class="mr-2 h-2 w-20 rounded-full bg-gray-200 dark:bg-gray-600"
										>
											<div
												class="h-2 rounded-full bg-green-500"
												style="width: {entry.winRate * 100}%"
											></div>
										</div>
										<span class="text-sm font-medium">
											{(entry.winRate * 100).toFixed(1)}%
										</span>
									</div>
								</td>
								<td class="px-6 py-4 font-medium whitespace-nowrap">
									{Math.round(entry.bestScore).toLocaleString()}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									{Math.round(entry.averageScore).toLocaleString()}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Pagination -->
			<div
				class="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-600 dark:bg-gray-700"
			>
				<div class="text-sm text-gray-600 dark:text-gray-400">
					Showing {(currentPage - 1) * pageSize + 1} to {Math.min(
						currentPage * pageSize,
						leaderboardData.totalEntries
					)} of {leaderboardData.totalEntries} players
				</div>
				<div class="flex gap-2">
					<button
						class="rounded-lg bg-gray-200 px-4 py-2 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-600 dark:hover:bg-gray-500"
						onclick={previousPage}
						disabled={currentPage === 1}
					>
						Previous
					</button>
					<span class="rounded-lg bg-gray-100 px-4 py-2 dark:bg-gray-600">
						Page {currentPage} of {leaderboardData.totalPages}
					</span>
					<button
						class="rounded-lg bg-gray-200 px-4 py-2 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-600 dark:hover:bg-gray-500"
						onclick={nextPage}
						disabled={currentPage >= leaderboardData.totalPages}
					>
						Next
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.leaderboard-container {
		min-height: 100vh;
	}
</style>
