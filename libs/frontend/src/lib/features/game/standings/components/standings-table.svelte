<script lang="ts">
	import dayjs from "dayjs";
	import { isSubmissionDto, isUserDto, type GameDto, type SubmissionDto } from "types";
	import duration from "dayjs/plugin/duration";
	import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";
	import { apiUrls, buildApiUrl } from "@/config/api";
	dayjs.extend(duration);

	export let game: GameDto;
	let submissions: SubmissionDto[] = game.playerSubmissions.filter((subm) => isSubmissionDto(subm));
	let opened: boolean[] = new Array(submissions.length).fill(false);

	async function fetchCode(id: string) {
		let url = buildApiUrl(apiUrls.SUBMISSION_BY_ID, { id });
		return await fetchWithAuthenticationCookie(url).then((res) => res.json());
	}
</script>

<div id="standings" class="flex flex-col gap-4">
	{#each submissions as { user, language, createdAt, result, _id }, idx}
		{#if isUserDto(user)}
			<details
				class="rounded-md border-4"
				on:toggle={() => {
					opened[idx] = true;
				}}
			>
				<summary class="flex cursor-pointer flex-row gap-4 p-2">
					<div>{idx + 1}.</div>
					<div>{user.username}</div>
					<div>{language}</div>
					<div>{dayjs.duration(dayjs(createdAt).diff(game.startTime)).format("HH:mm:ss")}</div>
					<div class={result == "success" ? "text-green-500" : "text-red-500"}>{result}</div>
				</summary>
				{#if opened[idx]}
					{#await fetchCode(_id || "")}
						<span class="p-2">Loading code...</span>
					{:then { code }}
						<code class="m-2 block whitespace-pre border-2 border-solid p-2">{code}</code>
					{:catch}
						<span class="p-2 text-red-500">Encountered an error while fetching submission</span>
					{/await}
				{/if}
			</details>
		{/if}
	{/each}
</div>
