<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import ContributionGraph from "../../lib/features/profile/components/calendar-heatmap.svelte";
	// import { getLastSegment } from '$utils/getLastSegment';

	export let data;
</script>

<Container class="items-center gap-10 px-10 pt-10 xl:flex-row xl:items-start">
	<!-- create a link component? where based on a part of the string, it renders the right component -->

	<!-- <Card>
		<H1 class="flex w-full justify-center">{data.nickname}</H1>

		<p>{data.profile.bio}</p>

		<div>
			<ul class="list-none">

				{#each data.profile.links as link}
					<li class="flex flex-row gap-2">
						<a class="hover:underline" href={link}>
							{getLastSegment(link)}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</Card> -->
	<!-- The profile page salutes you! Show a github like overview of when a user solved puzzles! -->
	hi there!
	<!-- <ContributionGraph solvedPuzzles={data.activity.submissions} /> -->
</Container>
