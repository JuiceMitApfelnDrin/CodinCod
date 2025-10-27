import { faker } from "@faker-js/faker";
import Submission, {
	SubmissionDocument
} from "../../models/submission/submission.js";
import { PuzzleResultEnum } from "types";
import { randomFromArray } from "../utils/seed-helpers.js";
import { Types, ObjectId } from "mongoose";
import ProgrammingLanguage from "../../models/programming-language/language.js";

type PuzzleResultValue =
	(typeof PuzzleResultEnum)[keyof typeof PuzzleResultEnum];

export interface SubmissionFactoryOptions {
	userId: Types.ObjectId;
	puzzleId: Types.ObjectId;
	result?: PuzzleResultValue;
}

/**
 * Generate code submission based on language
 */
function generateCode(language: string): string {
	const codeTemplates: Record<string, string[]> = {
		python: [
			"def solution(n):\n    # TODO: implement solution\n    return n",
			"def solve(arr):\n    result = []\n    for item in arr:\n        result.append(item * 2)\n    return result",
			"def calculate(x, y):\n    return x + y"
		],
		javascript: [
			"function solution(n) {\n    // TODO: implement solution\n    return n;\n}",
			"const solve = (arr) => {\n    return arr.map(x => x * 2);\n}",
			"function calculate(x, y) {\n    return x + y;\n}"
		],
		java: [
			"public int solution(int n) {\n    // TODO: implement solution\n    return n;\n}",
			"public int[] solve(int[] arr) {\n    return Arrays.stream(arr).map(x -> x * 2).toArray();\n}"
		],
		cpp: [
			"int solution(int n) {\n    // TODO: implement solution\n    return n;\n}",
			"vector<int> solve(vector<int> arr) {\n    for (auto& x : arr) x *= 2;\n    return arr;\n}"
		]
	};

	return randomFromArray(codeTemplates[language] || codeTemplates.python);
}

/**
 * Generate result info based on puzzle validators
 */
async function generateResultInfo(
	puzzleId: Types.ObjectId,
	result: PuzzleResultValue
) {
	let successRate: number;
	if (result === PuzzleResultEnum.SUCCESS) {
		successRate = 1.0;
	} else if (result === PuzzleResultEnum.ERROR) {
		successRate = faker.number.float({ min: 0, max: 0.5 });
	} else {
		successRate = faker.number.float({ min: 0, max: 1 });
	}

	return {
		result,
		successRate
	};
}

/**
 * Create a single submission
 */
export async function createSubmission(
	options: SubmissionFactoryOptions
): Promise<Types.ObjectId> {
	// Get a random programming language from database
	const allLanguages = await ProgrammingLanguage.find().lean();
	if (allLanguages.length === 0) {
		throw new Error(
			"No programming languages found in database. Run migrations first!"
		);
	}

	const selectedLanguage = randomFromArray(allLanguages);
	const languageName = selectedLanguage.language;

	// Result distribution: 60% SUCCESS, 30% ERROR, 10% UNKNOWN
	const resultValues = Object.values(PuzzleResultEnum);
	const result =
		options.result ||
		(faker.helpers.weightedArrayElement([
			{ value: resultValues[1], weight: 60 }, // SUCCESS
			{ value: resultValues[0], weight: 30 }, // ERROR
			{ value: resultValues[2], weight: 10 } // UNKNOWN
		]) as PuzzleResultValue);

	const submissionData: Partial<SubmissionDocument> = {
		code: generateCode(languageName),
		puzzle: options.puzzleId as unknown as ObjectId,
		user: options.userId as unknown as ObjectId,
		programmingLanguage: selectedLanguage._id as unknown as ObjectId,
		result: await generateResultInfo(options.puzzleId, result)
	};

	const submission = new Submission(submissionData);
	await submission.save();

	return submission._id as Types.ObjectId;
}

/**
 * Create multiple submissions for puzzles
 */
export async function createSubmissions(
	count: number,
	userIds: Types.ObjectId[],
	puzzleIds: Types.ObjectId[]
): Promise<Types.ObjectId[]> {
	const submissionIds: Types.ObjectId[] = [];

	for (let i = 0; i < count; i++) {
		const userId = randomFromArray(userIds);
		const puzzleId = randomFromArray(puzzleIds);

		submissionIds.push(
			await createSubmission({
				userId,
				puzzleId
			})
		);
	}

	return submissionIds;
}
