import { faker } from "@faker-js/faker";
import Comment from "../../models/comment/comment.js";
import Puzzle from "../../models/puzzle/puzzle.js";
import { commentTypeEnum, CommentEntity } from "types";
import { randomFromArray } from "../utils/seed-helpers.js";
import { Types } from "mongoose";

type CommentTypeValue = (typeof commentTypeEnum)[keyof typeof commentTypeEnum];

export interface CommentFactoryOptions {
	authorId: Types.ObjectId;
	parentId: Types.ObjectId;
	commentType: CommentTypeValue;
}

/**
 * Generate realistic comment text
 */
function generateCommentText(): string {
	const commentTemplates = [
		() => `Great puzzle! ${faker.lorem.sentence()}`,
		() => `This was challenging. ${faker.lorem.sentences(2)}`,
		() =>
			`I think there's a bug in test case ${faker.number.int({ min: 1, max: 10 })}.`,
		() => `Here's my approach: ${faker.lorem.paragraph()}`,
		() => `Can someone explain ${faker.lorem.words(3)}?`,
		() => `Nice solution! ${faker.lorem.sentence()}`,
		() => faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
		() =>
			`I solved this using ${randomFromArray(["recursion", "dynamic programming", "greedy algorithm", "BFS", "DFS"])}`,
		() =>
			`The time complexity of my solution is O(${randomFromArray(["n", "n log n", "n²", "1"])})`
	];

	return randomFromArray(commentTemplates)();
}

/**
 * Create a single comment
 */
export async function createComment(
	options: CommentFactoryOptions
): Promise<Types.ObjectId> {
	const commentData: Partial<CommentEntity> = {
		author: options.authorId.toString(),
		text: generateCommentText(),
		upvote: faker.number.int({ min: 0, max: 50 }),
		downvote: faker.number.int({ min: 0, max: 10 }),
		commentType: options.commentType,
		parentId: options.parentId.toString(),
		comments: [] // Nested comments added separately
	};

	const comment = new Comment(commentData);
	await comment.save();

	if (options.commentType === commentTypeEnum.PUZZLE) {
		await Puzzle.findByIdAndUpdate(options.parentId, {
			$push: { comments: comment._id }
		});
	} else if (options.commentType === commentTypeEnum.COMMENT) {
		await Comment.findByIdAndUpdate(options.parentId, {
			$push: { comments: comment._id }
		});
	}

	return comment._id as unknown as Types.ObjectId;
}

/**
 * Create nested comment replies
 */
export async function createNestedComments(
	parentCommentId: Types.ObjectId,
	authorIds: Types.ObjectId[],
	maxDepth = 4,
	currentDepth = 0
): Promise<void> {
	if (currentDepth >= maxDepth) return;

	if (!faker.datatype.boolean(0.5)) return;

	const replyCount = faker.number.int({ min: 1, max: 3 });

	for (let i = 0; i < replyCount; i++) {
		const authorId = randomFromArray(authorIds);
		const replyId = await createComment({
			authorId,
			parentId: parentCommentId,
			commentType: commentTypeEnum.COMMENT
		});

		// Recursively create nested replies
		await createNestedComments(replyId, authorIds, maxDepth, currentDepth + 1);
	}
}

/**
 * Create multiple puzzle comments with nested replies
 */
export async function createPuzzleComments(
	count: number,
	userIds: Types.ObjectId[],
	puzzleIds: Types.ObjectId[]
): Promise<Types.ObjectId[]> {
	const commentIds: Types.ObjectId[] = [];

	for (let i = 0; i < count; i++) {
		const authorId = randomFromArray(userIds);
		const puzzleId = randomFromArray(puzzleIds);

		const commentId = await createComment({
			authorId,
			parentId: puzzleId,
			commentType: commentTypeEnum.PUZZLE
		});

		commentIds.push(commentId);

		if (faker.datatype.boolean(0.5)) {
			await createNestedComments(commentId, userIds, 2);
		}
	}

	return commentIds;
}
