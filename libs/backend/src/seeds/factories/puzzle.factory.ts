import { faker } from "@faker-js/faker";
import Puzzle from "../../models/puzzle/puzzle.js";
import {
	DifficultyEnum,
	puzzleVisibilityEnum,
	TagEnum,
	PuzzleEntity
} from "types";
import { randomFromArray, randomMultipleFromArray } from "../utils/seed-helpers.js";
import { Types } from "mongoose";

type DifficultyValue = typeof DifficultyEnum[keyof typeof DifficultyEnum];
type VisibilityValue = typeof puzzleVisibilityEnum[keyof typeof puzzleVisibilityEnum];

export interface PuzzleFactoryOptions {
	authorId: Types.ObjectId;
	visibility?: VisibilityValue;
	difficulty?: DifficultyValue;
}

/**
 * Generate realistic test cases for a puzzle
 */
function generateValidators(count: number) {
	const validators = [];

	for (let i = 0; i < count; i++) {
		validators.push({
			input: faker.helpers.arrayElement([
				faker.number.int({ min: 1, max: 100 }).toString(),
				`${faker.number.int({ min: 1, max: 10 })} ${faker.number.int({ min: 1, max: 10 })}`,
				faker.lorem.word(),
				JSON.stringify([faker.number.int(), faker.number.int()])
			]),
			output: faker.helpers.arrayElement([
				faker.number.int({ min: 1, max: 100 }).toString(),
				faker.datatype.boolean().toString(),
				faker.lorem.word()
			]),
			createdAt: new Date(),
			updatedAt: new Date()
		});
	}

	return validators;
}

/**
 * Generate puzzle title based on difficulty and tags
 */
function generatePuzzleTitle(
	difficulty: DifficultyValue,
	tags: string[]
): string {
	const titleTemplates = [
		`${faker.hacker.verb()} the ${faker.hacker.noun()}`,
		`${faker.lorem.words(2)} Challenge`,
		`Find the ${faker.hacker.adjective()} ${faker.hacker.noun()}`,
		`${faker.lorem.word()} Algorithm`,
		`Reverse ${faker.lorem.word()}`,
		`Calculate ${faker.lorem.words(2)}`,
		`Optimize ${faker.hacker.noun()} Processing`
	];

	return faker.helpers.arrayElement(titleTemplates);
}

/**
 * Create a single puzzle with realistic data
 */
export async function createPuzzle(
	options: PuzzleFactoryOptions
): Promise<Types.ObjectId> {
	const difficulty =
		options.difficulty ||
		randomFromArray(Object.values(DifficultyEnum));

	const visibility =
		options.visibility ||
		randomFromArray(Object.values(puzzleVisibilityEnum));

	// Select 1-4 tags
	const tags = randomMultipleFromArray(Object.values(TagEnum), 1, 4);
	const title = generatePuzzleTitle(difficulty, tags);

	// Number of test cases varies by difficulty
	const testCaseCount: Record<DifficultyValue, number> = {
		[DifficultyEnum.BEGINNER]: faker.number.int({ min: 3, max: 5 }),
		[DifficultyEnum.INTERMEDIATE]: faker.number.int({ min: 5, max: 8 }),
		[DifficultyEnum.ADVANCED]: faker.number.int({ min: 8, max: 12 }),
		[DifficultyEnum.EXPERT]: faker.number.int({ min: 10, max: 15 })
	};

	const puzzleData: Partial<PuzzleEntity> = {
		title,
		statement: faker.lorem.paragraphs(faker.number.int({ min: 2, max: 4 })),
		constraints: faker.helpers.maybe(
			() =>
				`- ${faker.lorem.sentence()}\n- ${faker.lorem.sentence()}\n- ${faker.lorem.sentence()}`,
			{ probability: 0.7 }
		),
		author: options.authorId.toString(),
		validators: generateValidators(testCaseCount[difficulty]),
		difficulty,
		visibility,
		tags,
		...(faker.helpers.maybe(
			() => ({
				solution: {
					code: faker.helpers.arrayElement([
						'def solution(n):\n    return n * 2',
						'function solution(arr) {\n    return arr.sort();\n}',
						'public int solution(int x) {\n    return x + 1;\n}'
					]),
					language: randomFromArray(["python", "javascript", "java", "cpp"]),
					languageVersion: randomFromArray(["3.10.0", "18.15.0", "15.0.2", "10.2.0"]),
					explanation: faker.lorem.paragraph()
				}
			}),
			{ probability: visibility === puzzleVisibilityEnum.APPROVED ? 0.9 : 0.3 }
		) || {}),
		...(faker.helpers.maybe(
			() => ({ moderationFeedback: faker.lorem.sentence() }),
			{ probability: visibility === puzzleVisibilityEnum.DRAFT ? 0.4 : 0.1 }
		) || {})
	};

	const puzzle = new Puzzle(puzzleData);
	await puzzle.save();

	return puzzle._id as Types.ObjectId;
}

/**
 * Create multiple puzzles with variety
 */
export async function createPuzzles(
	count: number,
	authorIds: Types.ObjectId[]
): Promise<Types.ObjectId[]> {
	const puzzleIds: Types.ObjectId[] = [];

	for (let i = 0; i < count; i++) {
		const authorId = randomFromArray(authorIds);

		// Distribution: 60% APPROVED, 15% DRAFT, 10% ARCHIVED, 10% REVIEW, 5% others
		const visibilityValues = Object.values(puzzleVisibilityEnum);
		const visibility = faker.helpers.weightedArrayElement([
			{ value: visibilityValues[4], weight: 60 }, // APPROVED
			{ value: visibilityValues[0], weight: 15 }, // DRAFT
			{ value: visibilityValues[6], weight: 10 }, // ARCHIVED
			{ value: visibilityValues[2], weight: 10 }, // REVIEW
			{ value: visibilityValues[1], weight: 3 },  // READY
			{ value: visibilityValues[3], weight: 1 },  // REVISE
			{ value: visibilityValues[5], weight: 1 }   // INACTIVE
		]) as VisibilityValue;

		// Difficulty distribution
		const difficultyValues = Object.values(DifficultyEnum);
		const difficulty = faker.helpers.weightedArrayElement([
			{ value: difficultyValues[0], weight: 30 }, // BEGINNER
			{ value: difficultyValues[1], weight: 40 }, // INTERMEDIATE
			{ value: difficultyValues[2], weight: 20 }, // ADVANCED
			{ value: difficultyValues[3], weight: 10 }  // EXPERT
		]) as DifficultyValue;

		puzzleIds.push(
			await createPuzzle({
				authorId,
				visibility,
				difficulty
			})
		);
	}

	return puzzleIds;
}
