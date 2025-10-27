import { FastifyInstance } from "fastify";
import {
	arePistonRuntimes,
	isPistonExecutionResponseSuccess,
	PistonExecutionRequest,
	PuzzleDto,
	isProgrammingLanguageDto
} from "types";
import { findRuntime } from "./findRuntimeInfo.js";
import { calculateResults } from "./calculate-result.js";

export async function checkAllValidators(
	puzzle: PuzzleDto,
	fastify: FastifyInstance
): Promise<boolean> {
	const runtimes = await fastify.runtimes();

	if (!arePistonRuntimes(runtimes)) {
		fastify.log.error("Piston runtimes unavailable");
		return false;
	}

	if (!puzzle.solution) {
		return false;
	}

	// Get the language name from the programming language (could be string ObjectId or populated object)
	const languageName = isProgrammingLanguageDto(puzzle.solution.programmingLanguage)
		? puzzle.solution.programmingLanguage.language
		: undefined;

	if (!languageName) {
		return false;
	}

	const runtimeInfo = findRuntime(runtimes, languageName);

	if (!runtimeInfo) {
		return false;
	}

	if (!puzzle.validators || puzzle.validators.length === 0) {
		return false;
	}

	for (const validator of puzzle.validators) {
		const requestObject: PistonExecutionRequest = {
			language: runtimeInfo.language,
			version: runtimeInfo.version,
			files: [{ content: puzzle.solution.code }],
			stdin: validator.input
		};

		try {
			const executionRes = await fastify.piston(requestObject);

			if (!isPistonExecutionResponseSuccess(executionRes)) {
				return false;
			}

			const item = calculateResults([validator.output], [executionRes]);

			if (item.successRate !== 1) {
				return false;
			}
		} catch (error) {
			fastify.log.error(error, `Validator ${validator} execution failed`);
			return false;
		}
	}

	return true;
}
