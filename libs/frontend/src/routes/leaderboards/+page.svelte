<script lang="ts">
	import {
		gameModeEnum,
		LEADERBOARD_CONFIG,
		PAGINATION_CONFIG,
		testIds,
		type GameMode,
		type LeaderboardAPI
	} from "types";
	import { backendUrls } from "types";
	import * as Card from "@/components/ui/card";
	import * as Table from "@/components/ui/table";
	import { Button } from "@/components/ui/button";
	import { Badge } from "@/components/ui/badge";
	import Container from "@/components/ui/container/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import Loader from "@/components/ui/loader/loader.svelte";
	import * as ButtonGroup from "#/ui/button-group";

	// Reactive state using Svelte 5 runes
	let selectedMode = $state<GameMode>(gameModeEnum.FASTEST);
	let leaderboardData = $state<Exclude<
		LeaderboardAPI.GetLeaderboardResponse,
		{ error: string }
	> | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let currentPage = $state(PAGINATION_CONFIG.DEFAULT_PAGE);
	const pageSize = PAGINATION_CONFIG.DEFAULT_LIMIT_LEADERBOARD;

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

	// Map game modes to their test IDs
	const gameModeTestIds = {
		[gameModeEnum.FASTEST]: testIds.LEADERBOARD_PAGE_BUTTON_MODE_FASTEST,
		[gameModeEnum.SHORTEST]: testIds.LEADERBOARD_PAGE_BUTTON_MODE_SHORTEST,
		[gameModeEnum.BACKWARDS]: testIds.LEADERBOARD_PAGE_BUTTON_MODE_BACKWARDS,
		[gameModeEnum.HARDCORE]: testIds.LEADERBOARD_PAGE_BUTTON_MODE_HARDCORE,
		[gameModeEnum.DEBUG]: testIds.LEADERBOARD_PAGE_BUTTON_MODE_DEBUG,
		[gameModeEnum.TYPERACER]: testIds.LEADERBOARD_PAGE_BUTTON_MODE_TYPERACER,
		[gameModeEnum.EFFICIENCY]: testIds.LEADERBOARD_PAGE_BUTTON_MODE_EFFICIENCY,
		[gameModeEnum.INCREMENTAL]:
			testIds.LEADERBOARD_PAGE_BUTTON_MODE_INCREMENTAL,
		[gameModeEnum.RANDOM]: testIds.LEADERBOARD_PAGE_BUTTON_MODE_RANDOM
	} as const;

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
		if (currentPage > PAGINATION_CONFIG.DEFAULT_PAGE) {
			currentPage--;
		}
	}

	function selectMode(mode: GameMode) {
		selectedMode = mode;
		currentPage = PAGINATION_CONFIG.DEFAULT_PAGE; // Reset to first page when changing modes
	}

	// Format date nicely
	function formatDate(date: string | Date): string {
		const dateObj = typeof date === "string" ? new Date(date) : date;
		return dateObj.toLocaleString();
	}

	// Format rating with color
	function getRatingColor(rating: number): string {
		const { RATING_THRESHOLDS, COLORS } = LEADERBOARD_CONFIG;

		if (rating >= RATING_THRESHOLDS.LEGENDARY) return COLORS.LEGENDARY;
		if (rating >= RATING_THRESHOLDS.MASTER) return COLORS.MASTER;
		if (rating >= RATING_THRESHOLDS.EXPERT) return COLORS.EXPERT;
		if (rating >= RATING_THRESHOLDS.ADVANCED) return COLORS.ADVANCED;
		return COLORS.BEGINNER;
	}

	// Get rank badge
	function getRankBadge(rank: number): string {
		const { MEDALS } = LEADERBOARD_CONFIG;

		if (rank === 1) return MEDALS.FIRST;
		if (rank === 2) return MEDALS.SECOND;
		if (rank === 3) return MEDALS.THIRD;
		return "";
	}
</script>

<Container>
	<H1>Leaderboards</H1>

	<!-- Game Mode Selector -->
	<ButtonGroup.Root>
		{#each Object.values(gameModeEnum) as mode}
			<Button
				variant={"outline"}
				onclick={() => selectMode(mode)}
				data-testid={gameModeTestIds[mode]}
			>
				{gameModeNames[mode]}
			</Button>
		{/each}
	</ButtonGroup.Root>

	<!-- Loading State -->
	{#if loading}
		<div class="flex items-center justify-center py-20">
			<Loader />
		</div>
	{/if}

	<!-- Error State -->
	{#if error}
		<Card.Card class="border-destructive">
			<Card.CardContent class="pt-6">
				<p class="text-destructive">{error}</p>
			</Card.CardContent>
		</Card.Card>
	{/if}

	<!-- Leaderboard Table -->
	{#if leaderboardData && !loading}
		<Card.Card>
			<Card.CardHeader>
				<Card.CardTitle
					>{gameModeNames[selectedMode]} Leaderboard</Card.CardTitle
				>
				<Card.CardDescription>
					Last updated: {formatDate(leaderboardData.lastUpdated)}
				</Card.CardDescription>
			</Card.CardHeader>
			<Card.CardContent>
				<Table.Table>
					<Table.TableHeader>
						<Table.TableRow>
							<Table.TableHead>Rank</Table.TableHead>
							<Table.TableHead>Player</Table.TableHead>
							<Table.TableHead>Rating</Table.TableHead>
							<Table.TableHead>Games</Table.TableHead>
							<Table.TableHead>Win Rate</Table.TableHead>
							<Table.TableHead>Best Score</Table.TableHead>
							<Table.TableHead>Avg Score</Table.TableHead>
						</Table.TableRow>
					</Table.TableHeader>
					<Table.TableBody>
						{#each leaderboardData.entries as entry}
							<Table.TableRow>
								<Table.TableCell>
									<span class="text-2xl">{getRankBadge(entry.rank)}</span>
									<span class="ml-2 font-semibold">#{entry.rank}</span>
								</Table.TableCell>
								<Table.TableCell>
									<a
										href="/user/{entry.username}"
										class="font-medium text-blue-600 hover:underline dark:text-blue-400"
									>
										{entry.username}
									</a>
								</Table.TableCell>
								<Table.TableCell>
									<span
										class="text-lg font-bold {getRatingColor(entry.rating)}"
									>
										{Math.round(entry.rating)}
									</span>
									<span class="text-muted-foreground ml-1 text-xs">
										(±{Math.round(entry.glicko.rd)})
									</span>
								</Table.TableCell>
								<Table.TableCell>
									<div class="flex items-center gap-2">
										<span class="font-medium">{entry.gamesPlayed}</span>
										<Badge variant="success">{entry.gamesWon}W</Badge>
									</div>
								</Table.TableCell>
								<Table.TableCell>
									<div class="flex items-center gap-2">
										<div class="bg-muted h-2 w-20 rounded-full">
											<div
												class="bg-success h-2 rounded-full"
												style="width: {entry.winRate * 100}%"
											></div>
										</div>
										<span class="text-sm font-medium">
											{(entry.winRate * 100).toFixed(1)}%
										</span>
									</div>
								</Table.TableCell>
								<Table.TableCell class="font-medium">
									{Math.round(entry.bestScore).toLocaleString()}
								</Table.TableCell>
								<Table.TableCell>
									{Math.round(entry.averageScore).toLocaleString()}
								</Table.TableCell>
							</Table.TableRow>
						{/each}
					</Table.TableBody>
				</Table.Table>
			</Card.CardContent>
			<Card.CardFooter class="flex items-center justify-between">
				<p class="text-muted-foreground text-sm">
					Showing {(currentPage - 1) * pageSize + 1} to {Math.min(
						currentPage * pageSize,
						leaderboardData.totalEntries
					)} of {leaderboardData.totalEntries} players
				</p>
				<ButtonGroup.Root>
					<Button
						variant="outline"
						onclick={previousPage}
						disabled={currentPage === PAGINATION_CONFIG.DEFAULT_PAGE}
						data-testid={testIds.LEADERBOARD_PAGE_BUTTON_PREVIOUS_PAGE}
					>
						Previous
					</Button>
					<Badge variant="outline">
						Page {currentPage} of {leaderboardData.totalPages}
					</Badge>
					<Button
						variant="outline"
						onclick={nextPage}
						disabled={currentPage >= leaderboardData.totalPages}
						data-testid={testIds.LEADERBOARD_PAGE_BUTTON_NEXT_PAGE}
					>
						Next
					</Button>
				</ButtonGroup.Root>
			</Card.CardFooter>
		</Card.Card>
	{/if}
</Container>
