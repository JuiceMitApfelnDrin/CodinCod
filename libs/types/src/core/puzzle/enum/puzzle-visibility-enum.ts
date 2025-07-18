/**
 * DRAFT: Puzzle is being worked on and is not yet visible to others.
 * READY: Puzzle is being worked on and is ready to go to in review.
 * REVIEW: Puzzle is under review by moderators or reviewers.
 * REVISE: Puzzle requires changes based on feedback.
 * APPROVED: Puzzle is approved and visible to the public.
 * INACTIVE: Puzzle is not active or usable yet (could be used for puzzles that are temporarily hidden but not archived).
 * ARCHIVED: Puzzle is archived and no longer visible or active.
 */
export const puzzleVisibilityEnum = {
	DRAFT: "draft",
	READY: "ready",
	REVIEW: "review",
	REVISE: "revise",
	APPROVED: "approved",
	INACTIVE: "inactive",
	ARCHIVED: "archived",
} as const;
