<script lang="ts">
	import Card from '$components/Card.svelte';
	import ContributionGraph from '$components/CalendarHeatmap.svelte';
	import { getLastSegment } from '$utils/getLastSegment';

	import { userObject } from './mockprofiledata';

	import { Avatar } from 'flowbite-svelte';
</script>

<div
	class="mx-auto container flex flex-col items-center xl:items-start xl:flex-row gap-10 pt-10 px-10"
>
	<Card cardClass="flex gap-5">
		<div class="flex w-full justify-center">
			<Avatar size="lg" src={userObject.avaterUrl} />
		</div>

		<h1 class="flex w-full justify-center">{userObject.username}</h1>

		<p>{userObject.bio}</p>

		<div>
			<ul class="list-none">
				{#each userObject.links as link}
					<li>
						<a class="hover:underline" href={link}>{getLastSegment(link)}</a>
					</li>
				{/each}
			</ul>
		</div>
	</Card>
	<!-- The profile page salutes you! Show a github like overview of when a user solved puzzles! -->

	<ContributionGraph solvedPuzzles={userObject.solved_puzzles} />
</div>
