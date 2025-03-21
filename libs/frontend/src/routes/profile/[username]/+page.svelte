<script lang="ts">
	import H1 from "@/components/typography/h1.svelte";
	import * as Card from "@/components/ui/card";
	import Container from "@/components/ui/container/container.svelte";
	import ActivityGroup from "@/features/profile/components/activity-feed/activity-group.svelte";
	import CalendarHeatmap from "@/features/profile/components/calendar-heatmap.svelte";
	import dayjs from "dayjs";
	import { isUserDto, type Activity, type GroupedActivitiesByDate } from "types";

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

	export let data;

	const { puzzles, submissions, user } = data;
	const originalActivities: Activity[] = [...submissions, ...puzzles, user];
	const activitiesGroupedByCreatedAtDate = groupByCreatedAtDate(originalActivities);
</script>

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

	<CalendarHeatmap activitiesGroupedByDate={activitiesGroupedByCreatedAtDate} />

	{#each Object.entries(activitiesGroupedByCreatedAtDate).sort((a, b) => {
		const aDate = a[0];
		const bDate = b[0];

		return dayjs(aDate).isBefore(dayjs(bDate)) ? 1 : -1;
	}) as [date, activities]}
		<ActivityGroup {date} {activities}></ActivityGroup>
	{/each}
</Container>
