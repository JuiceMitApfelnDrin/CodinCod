import { faker } from "@faker-js/faker";
import Report from "../../models/report/report.js";
import User from "../../models/user/user.js";
import { ProblemTypeEnum, ReportEntity, reviewStatusEnum } from "types";
import { randomFromArray } from "../utils/seed-helpers.js";
import { Types } from "mongoose";

type ProblemTypeValue = typeof ProblemTypeEnum[keyof typeof ProblemTypeEnum];
type ReviewStatusValue = typeof reviewStatusEnum[keyof typeof reviewStatusEnum];

export interface ReportFactoryOptions {
	reportedById: Types.ObjectId;
	problematicIdentifier: Types.ObjectId;
	problemType: ProblemTypeValue;
	resolvedById?: Types.ObjectId;
}

/**
 * Generate realistic report explanation
 */
function generateReportExplanation(problemType: ProblemTypeValue): string {
	const explanations: Record<string, string[]> = {
		[ProblemTypeEnum.PUZZLE]: [
			"This puzzle contains inappropriate content",
			"The test cases are incorrect",
			"Puzzle statement is unclear and confusing",
			"Contains offensive language"
		],
		[ProblemTypeEnum.USER]: [
			"User is harassing other members",
			"Spamming comments across multiple puzzles",
			"Using inappropriate username",
			"Cheating in multiplayer games"
		],
		[ProblemTypeEnum.COMMENT]: [
			"Comment contains spam",
			"Offensive or inappropriate language",
			"Personal attack on another user",
			"Off-topic or irrelevant content"
		],
		[ProblemTypeEnum.GAME_CHAT]: [
			"Inappropriate messages in game chat",
			"Harassment of other players",
			"Spam in chat",
			"Offensive language"
		]
	};

	return randomFromArray(explanations[problemType] || explanations[ProblemTypeEnum.COMMENT]);
}

/**
 * Create a report
 */
export async function createReport(
	options: ReportFactoryOptions
): Promise<Types.ObjectId> {
	// Status distribution: 60% PENDING, 30% RESOLVED, 10% REJECTED
	const statusValues = Object.values(reviewStatusEnum);
	const status = faker.helpers.weightedArrayElement([
		{ value: statusValues[0], weight: 60 }, // PENDING
		{ value: statusValues[1], weight: 30 }, // RESOLVED
		{ value: statusValues[2], weight: 10 }  // REJECTED
	]) as ReviewStatusValue;

	const reportData: Partial<ReportEntity> = {
		problematicIdentifier: options.problematicIdentifier.toString(),
		problemType: options.problemType,
		reportedBy: options.reportedById.toString(),
		explanation: generateReportExplanation(options.problemType),
		status,
		...(status !== reviewStatusEnum.PENDING && options.resolvedById
			? { resolvedBy: options.resolvedById.toString() }
			: {}),
		createdAt: faker.date.recent({ days: 30 }),
		...(status !== reviewStatusEnum.PENDING
			? { updatedAt: faker.date.recent({ days: 15 }) }
			: { updatedAt: faker.date.recent({ days: 30 }) })
	};

	const report = new Report(reportData);
	await report.save();

	// Update user reportCount if resolved
	if (status === reviewStatusEnum.RESOLVED && options.problemType === ProblemTypeEnum.USER) {
		await User.findByIdAndUpdate(options.problematicIdentifier, {
			$inc: { reportCount: 1 }
		});
	}

	return report._id as Types.ObjectId;
}

/**
 * Create multiple reports
 */
export async function createReports(
	count: number,
	userIds: Types.ObjectId[],
	puzzleIds: Types.ObjectId[],
	moderatorIds: Types.ObjectId[]
): Promise<Types.ObjectId[]> {
	const reportIds: Types.ObjectId[] = [];

	for (let i = 0; i < count; i++) {
		const reportedById = randomFromArray(userIds);
		const resolvedById = randomFromArray(moderatorIds);

		// Problem type distribution
		const problemTypeValues = Object.values(ProblemTypeEnum);
		const problemType = randomFromArray([
			problemTypeValues[0], // PUZZLE
			problemTypeValues[1], // USER  
			problemTypeValues[2]  // COMMENT
		]) as ProblemTypeValue;

		let problematicIdentifier: Types.ObjectId;
		if (problemType === problemTypeValues[0]) { // PUZZLE
			problematicIdentifier = randomFromArray(puzzleIds);
		} else {
			problematicIdentifier = randomFromArray(userIds);
		}

		reportIds.push(
			await createReport({
				reportedById,
				problematicIdentifier,
				problemType,
				resolvedById
			})
		);
	}

	return reportIds;
}
