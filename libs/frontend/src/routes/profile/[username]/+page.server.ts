import { getUserActivityByUsername } from "@/api/get-user-activity-by-username.js";
import { ActivityTypeEnum } from "types";

export async function load({ params }) {
	const username = params.username;

	const response = await getUserActivityByUsername(username);
	if (!response.ok) {
		console.error(response);
	}

	const userActivity = await response.json();

	const { activity, user } = userActivity;
	const { puzzles, submissions } = activity;

	const puzzlesWithType = puzzles.map((puzzle) => ({
		...puzzle,
		type: ActivityTypeEnum.CREATE_PUZZLE
	}));

	const submissionsWithType = submissions.map((submission) => ({
		...submission,
		type: ActivityTypeEnum.ADD_SUBMISSION
	}));

	const userWithType = { ...user, type: ActivityTypeEnum.CREATE_ACCOUNT };

	return {
		puzzles: puzzlesWithType,
		user: userWithType,
		submissions: submissionsWithType
	};
}
