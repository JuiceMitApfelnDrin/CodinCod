<script lang="ts">
	import Card from '$components/Card.svelte';
	import ContributionGraph from '$components/ContributionGraph/ContributionGraph.svelte';
	import type { User } from '$models/user.model';
	import { getLastSegment } from '$utils/getLastSegment';

	const currentDateDing = new Date();
	let userObject: User = {
		// a username preferably like discords or twitters?
		username: 'reeveng',
		// in order to personalize the profile a bit a bio can be added
		bio: 'Doing the thing with the code and the editor.',
		friends: [
			// different users their ids
		],
		links: [
			// links to various websites the user wants to direct attention to
			'https://www.twitch.tv/juicemitapfelndrin'
		],
		// achievements: [
		// 	// predetermined achievements with flags on a certain user if they have reached them or not
		// ],
		// guilds: [
		// 	// a group of friends that you can join to either battle other groups
		// 	// collect an overall better standing
		// 	// collect more achievements
		// 	// ...
		// 	// overall meant to motivate people into coding more
		// ],
		solved_puzzles: [
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(currentDateDing.setDate(currentDateDing.getDate())).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(currentDateDing.setDate(currentDateDing.getDate())).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(currentDateDing.setDate(currentDateDing.getDate())).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(currentDateDing.setDate(currentDateDing.getDate())).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(currentDateDing.setDate(currentDateDing.getDate())).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(currentDateDing.setDate(currentDateDing.getDate())).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(currentDateDing.setDate(currentDateDing.getDate())).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(currentDateDing.setDate(currentDateDing.getDate())).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(currentDateDing.setDate(currentDateDing.getDate())).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(currentDateDing.setDate(currentDateDing.getDate())).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(currentDateDing.setDate(currentDateDing.getDate())).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(
					currentDateDing.setDate(currentDateDing.getDate() - 20)
				).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(
					currentDateDing.setDate(currentDateDing.getDate() - 20)
				).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(
					currentDateDing.setDate(currentDateDing.getDate() - 20)
				).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(
					currentDateDing.setDate(currentDateDing.getDate() - 20)
				).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(
					currentDateDing.setDate(currentDateDing.getDate() - 20)
				).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(
					currentDateDing.setDate(currentDateDing.getDate() - 20)
				).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(
					currentDateDing.setDate(currentDateDing.getDate() - 10)
				).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(
					currentDateDing.setDate(currentDateDing.getDate() - 10)
				).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(
					currentDateDing.setDate(currentDateDing.getDate() - 10)
				).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(currentDateDing.setDate(currentDateDing.getDate() - 1)).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(currentDateDing.setDate(currentDateDing.getDate())).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(currentDateDing.setDate(currentDateDing.getDate())).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(currentDateDing.setDate(currentDateDing.getDate())).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(currentDateDing.setDate(currentDateDing.getDate())).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(currentDateDing.setDate(currentDateDing.getDate())).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(currentDateDing.setDate(currentDateDing.getDate())).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(currentDateDing.setDate(currentDateDing.getDate() - 1)).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(currentDateDing.setDate(currentDateDing.getDate())).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(currentDateDing.setDate(currentDateDing.getDate())).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(currentDateDing.setDate(currentDateDing.getDate())).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(currentDateDing.setDate(currentDateDing.getDate())).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(currentDateDing.setDate(currentDateDing.getDate())).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(currentDateDing.setDate(currentDateDing.getDate())).toISOString()
			},
			{
				_id: 'help me',
				puzzleId: 'bruh some random',
				userId: 'reeveng',
				code: 'let i = 0; console.log(i);',
				submitted_at: new Date(currentDateDing.setDate(currentDateDing.getDate())).toISOString()
			}

			// list of solved puzzles, after each puzzle the users gets the chance to rate the puzzle
			// puzzle can be either a puzzle with others or a puzzle alone
		].sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()),
		contributions: [
			// list of puzzles the user created
		]
	};

	import pfpPlaceholder from '$assets/pfp-placeholder.jpeg';
	import { Avatar } from 'flowbite-svelte';
</script>

<div class="mx-auto container flex flex-row gap-10 pt-10">
	<Card cardClass="flex gap-5">
		<div class="flex w-full justify-center">
			<Avatar size="lg" src={pfpPlaceholder} />
		</div>

		<h1 class="flex w-full justify-center">{userObject.username}</h1>

		<p>{userObject.bio}</p>

		<div>
			<p>Links to various places:</p>
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
