import { NotFoundError } from "@/errors/not-found-error.js";
import { UnauthorizedError } from "@/errors/unauthorized-error.js";
import Puzzle from "@/models/puzzle/puzzle.js";
import { CodeExecutionParams, EditPuzzleRequest, isAuthor, ObjectId } from "types";

export class PuzzleService {
	static async updatePuzzle(id: ObjectId, userId: ObjectId, updatedPuzzle: EditPuzzleRequest) {
		const puzzle = await Puzzle.findById(id);

		if (!puzzle) {
			throw new NotFoundError("Puzzle not found");
		}

		const authorId = puzzle.author.toString();
		if (!isAuthor(authorId, userId) || !this.isContributor(userId)) {
			throw new UnauthorizedError("Not authorized to edit this puzzle");
		}

		Object.assign(puzzle, updatedPuzzle);
		return await puzzle.save();
	}

	// TODO: eventually make it so contributors / moderators can adjust puzzles
	// TODO: move this to a user service?
	private static async isContributor(userId: ObjectId) {
		if (userId) {
			return true;
		}

		return true;
	}

	static async executePuzzle(id: ObjectId) {
		const puzzle = await Puzzle.findById(id);

		const pistonRequest: CodeExecutionParams = {
			code: puzzle.solution.code,
			language: puzzle.solution.language
		};

		const executionResult = ExecutionService.executeCode(fastify, pistonRequest);
	}
}
