import { getUserActivityByUsername } from "../../api/get-user-activity-by-username.js";
import { activityTypeEnum, type PuzzleDto, type SubmissionDto } from "types";
import type { PageServerLoadEvent } from "./$types";

export async function load({ params }: PageServerLoadEvent) {
	const username = params.username;

	const response = await getUserActivityByUsername(username);
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
