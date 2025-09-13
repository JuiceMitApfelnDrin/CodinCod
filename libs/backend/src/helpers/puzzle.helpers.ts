import { FastifyReply } from "fastify";
import Puzzle, { PuzzleDocument } from "@/models/puzzle/puzzle.js";
import { sendNotFoundError, handleAndSendError } from "./error.helpers.js";

export async function findPuzzleById(
	puzzleId: string,
	reply: FastifyReply,
	path?: string
): Promise<PuzzleDocument | null> {
	try {
		const puzzle = await Puzzle.findById(puzzleId);

		if (!puzzle) {
			sendNotFoundError(
				reply,
				`Puzzle with id "${puzzleId}" not found`,
				"puzzle",
				path
			);
			return null;
		}

		return puzzle;
	} catch (error) {
		handleAndSendError(reply, error, path);
		return null;
	}
}

export function validatePuzzleForSubmission(
	puzzle: PuzzleDocument,
	reply: FastifyReply,
	path?: string
): boolean {
	if (!puzzle.validators || puzzle.validators.length === 0) {
		sendNotFoundError(
			reply,
			"This puzzle has no test cases configured",
			"validators",
			path
		);
		return false;
	}
	return true;
}
