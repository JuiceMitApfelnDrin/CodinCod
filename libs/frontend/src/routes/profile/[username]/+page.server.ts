import { activityTypeEnum } from "$lib/types";
import type { PageServerLoadEvent } from "./$types";
import { codincodApiWebUserControllerActivity } from "@/api/generated/user/user";

export async function load({ params, fetch }: PageServerLoadEvent) {
	const username = params.username;

	const userActivity = await codincodApiWebUserControllerActivity(username, {
		fetch
	} as RequestInit);

	const activity = userActivity.activity ?? { puzzles: [], submissions: [] };
	const user = userActivity.user;
	const { puzzles = [], submissions = [] } = activity;

	// Filter out items without required fields and add type
	const puzzlesWithType = puzzles
		.filter((puzzle) => puzzle.createdAt != null && puzzle._id != null)
		.map((puzzle) => ({
			...puzzle,
			createdAt: puzzle.createdAt!, // Safe because we filtered
			_id: puzzle._id!, // Safe because we filtered
			type: activityTypeEnum.CREATE_PUZZLE
		}));

	const submissionsWithType = submissions
		.filter(
			(submission) => submission.createdAt != null && submission._id != null
		)
		.map((submission) => ({
			...submission,
			createdAt: submission.createdAt!, // Safe because we filtered
			_id: submission._id!, // Safe because we filtered
			type: activityTypeEnum.ADD_SUBMISSION
		}));

	// Ensure user has required fields (fallback values if not present)
	const userWithType = {
		...user,
		createdAt: user?.createdAt ?? new Date().toISOString(),
		_id: user?._id ?? "",
		type: activityTypeEnum.CREATE_ACCOUNT
	};

	return {
		puzzles: puzzlesWithType,
		submissions: submissionsWithType,
		user: userWithType
	};
}
