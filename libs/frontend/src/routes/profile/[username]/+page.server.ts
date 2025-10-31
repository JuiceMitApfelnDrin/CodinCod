import {
	activityTypeEnum,
	backendUrls,
	type PuzzleDto,
	type SubmissionDto
} from "types";
import type { PageServerLoadEvent } from "./$types";
import { buildBackendUrl } from "@/config/backend";
import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";

export async function load({ params }: PageServerLoadEvent) {
	const username = params.username;

	const response = await fetchWithAuthenticationCookie(
		buildBackendUrl(backendUrls.userByUsernameActivity(username))
	);
	if (!response.ok) {
		console.error(response);
	}

	const userActivity = await response.json();

	const { activity, user } = userActivity;
	const { puzzles, submissions } = activity;

	const puzzlesWithType = puzzles.map((puzzle: PuzzleDto) => ({
		...puzzle,
		type: activityTypeEnum.CREATE_PUZZLE
	}));

	const submissionsWithType = submissions.map((submission: SubmissionDto) => ({
		...submission,
		type: activityTypeEnum.ADD_SUBMISSION
	}));

	const userWithType = { ...user, type: activityTypeEnum.CREATE_ACCOUNT };

	return {
		puzzles: puzzlesWithType,
		submissions: submissionsWithType,
		user: userWithType
	};
}
