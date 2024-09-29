<script lang="ts">
	import H1 from "@/components/typography/h1.svelte";
	import * as Card from "@/components/ui/card";
	import Container from "@/components/ui/container/container.svelte";
	import CalendarHeatmap from "@/features/profile/components/calendar-heatmap.svelte";
	import { isUserDto } from "types";
	// import ContributionGraph from "../../lib/features/profile/components/calendar-heatmap.svelte";
	// import { getLastSegment } from '$utils/getLastSegment';

	export let data;
	$: console.log(data);
	const { activity, user } = data.userActivity;
</script>

<Container class="items-center gap-10 px-10 pt-10 xl:flex-row xl:items-start">
	{#if user && isUserDto(user)}
		<Card.Root class="w-full">
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

	<CalendarHeatmap activity={[...activity.submissions, ...activity.puzzles, user]} />
</Container>
