import { faker } from "@faker-js/faker";
import UserVote from "../../models/user/user-vote.js";
import Comment from "../../models/comment/comment.js";
import { UserVoteEntity, voteTypeEnum } from "types";
import { randomFromArray } from "../utils/seed-helpers.js";
import { Types } from "mongoose";

type VoteTypeValue = typeof voteTypeEnum[keyof typeof voteTypeEnum];

export interface UserVoteFactoryOptions {
	authorId: Types.ObjectId;
	votedOnId: Types.ObjectId;
	voteType?: VoteTypeValue;
}

/**
 * Create a single user vote
 */
export async function createUserVote(
	options: UserVoteFactoryOptions
): Promise<Types.ObjectId> {
	const voteType = options.voteType || randomFromArray(Object.values(voteTypeEnum));

	const voteData: Partial<UserVoteEntity> = {
		author: options.authorId.toString(),
		votedOn: options.votedOnId.toString(),
		type: voteType,
		createdAt: faker.date.recent({ days: 30 })
	};

	const vote = new UserVote(voteData);
	await vote.save();

	// Update the voted-on entity's vote count
	// This could be a Comment or other votable entity
	const incrementField = voteType === voteTypeEnum.UPVOTE ? "upvote" : "downvote";
	
	// Try to update as comment first
	await Comment.findByIdAndUpdate(options.votedOnId, {
		$inc: { [incrementField]: 1 }
	});

	// Could also update other votable entities like puzzles if they have vote fields
	// For now, just handling comments

	return vote._id as Types.ObjectId;
}

/**
 * Create votes for comments
 */
export async function createVotesForComments(
	commentIds: Types.ObjectId[],
	userIds: Types.ObjectId[]
): Promise<Types.ObjectId[]> {
	const voteIds: Types.ObjectId[] = [];

	// Each comment gets 0-10 votes
	for (const commentId of commentIds) {
		const voteCount = faker.number.int({ min: 0, max: 10 });

		// Select random voters (no duplicates per comment)
		const voters = randomFromArray(userIds);
		const uniqueVoters = new Set<Types.ObjectId>();

		for (let i = 0; i < voteCount && uniqueVoters.size < userIds.length; i++) {
			const voterId = voters;
			
			if (!uniqueVoters.has(voterId)) {
				uniqueVoters.add(voterId);

				// 70% upvotes, 30% downvotes
				const voteType = faker.datatype.boolean({ probability: 0.7 })
					? voteTypeEnum.UPVOTE
					: voteTypeEnum.DOWNVOTE;

				voteIds.push(
					await createUserVote({
						authorId: voterId,
						votedOnId: commentId,
						voteType
					})
				);
			}
		}
	}

	return voteIds;
}

/**
 * Create votes for various entities
 */
export async function createUserVotes(
	commentIds: Types.ObjectId[],
	userIds: Types.ObjectId[]
): Promise<Types.ObjectId[]> {
	const voteIds: Types.ObjectId[] = [];

	// Create votes for comments
	const commentVotes = await createVotesForComments(commentIds, userIds);
	voteIds.push(...commentVotes);

	return voteIds;
}
