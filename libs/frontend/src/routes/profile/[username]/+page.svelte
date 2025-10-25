<script lang="ts">
	import Button from "#/ui/button/button.svelte";
	import LogicalUnit from "#/ui/logical-unit/logical-unit.svelte";
	import { page } from "$app/state";
	import H1 from "@/components/typography/h1.svelte";
	import * as Card from "@/components/ui/card";
	import Container from "@/components/ui/container/container.svelte";
	import { testIds } from "@/config/test-ids";
	import ActivityGroup from "@/features/profile/components/activity-group.svelte";
	import ActivityHeatmap from "@/features/profile/components/activity-heatmap.svelte";
	import dayjs from "dayjs";
	import {
		frontendUrls,
		isUserDto,
		type Activity,
		type GroupedActivitiesByDate
	} from "types";

	function groupByCreatedAtDate(items: Activity[]) {
		return items.reduce<GroupedActivitiesByDate>((acc, item) => {
			const dateKey = dayjs(item.createdAt).format("YYYY-MM-DD");

			// Initialize the array for this date if it doesn't exist
			if (!acc[dateKey]) {
				acc[dateKey] = [];
			}

			acc[dateKey].push(item);

			return acc;
		}, {});
	}

	let { data } = $props();

	const { puzzles, submissions, user } = data;
	const originalActivities: Activity[] = [...submissions, ...puzzles, user];
	const activitiesGroupedByCreatedAtDate =
		groupByCreatedAtDate(originalActivities);
</script>

<svelte:head>
	<title>Profile of {page.params.username} | CodinCod</title>
	<meta
		name="description"
		content={`Track ${page.params.username}'s puzzle wins, open-source contributions, and ranking. Challenge them to a duel or collaborate!`}
	/>
	<meta name="author" content="CodinCod contributors" />
</svelte:head>

<Container class="gap-8">
	{#if user && isUserDto(user)}
		<Card.Root class="w-full border border-stone-300">
			<Card.Header>
				<H1 class="flex w-full justify-center">{user.username}</H1>
			</Card.Header>

			<Card.Content>
				<p>{user.profile?.bio ?? "This user hasn't set a bio yet."}</p>

				{#if user.profile?.socials}
					<div>
						<ul class="list-none">
							{#each user.profile.socials as link}
								<li class="flex flex-row gap-2">
									<a class="hover:underline" href={link}>
										{link}
									</a>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}

	<ActivityHeatmap activitiesGroupedByDate={activitiesGroupedByCreatedAtDate} />

	<LogicalUnit>
		<Button
			data-testid={testIds.PROFILE_PAGE_BUTTON_USER_PUZZLES}
			href={frontendUrls.userProfileByUsernamePuzzles(
				page.params.username ?? ""
			)}
			variant="outline">Created puzzles</Button
		>
	</LogicalUnit>

	{#each Object.entries(activitiesGroupedByCreatedAtDate).sort((a, b) => {
		const aDate = a[0];
		const bDate = b[0];

		return dayjs(aDate).isBefore(dayjs(bDate)) ? 1 : -1;
	}) as [date, activities]}
		<ActivityGroup {date} {activities}></ActivityGroup>
	{/each}
</Container>
