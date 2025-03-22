import { InternalServerError } from "@/errors/internal-server-error.js";
import { PistonError } from "@/errors/piston-error.js";
import { ServiceUnavailableError } from "@/errors/service-unavailable-error.js";
import { ValidationError } from "@/errors/validation-error.js";
import { calculateResults } from "@/utils/functions/calculate-result.js";
import { findRuntime } from "@/utils/functions/findRuntimeInfo.js";
import { FastifyInstance } from "fastify";
import {
	arePistonRuntimes,
	CodeExecutionParams,
	isFetchError,
	isPistonExecutionResponseSuccess,
	PistonExecutionRequest,
	PistonExecutionResponse,
	PistonExecutionResponseSuccess
} from "types";

export class ExecutionService {
	static async executeCode(fastify: FastifyInstance, params: CodeExecutionParams) {
		const { code, language, testInput, testOutput } = params;

		const runtimeInfo = await ExecutionService.validateAndFindRuntime(fastify, language);
		const requestObject = ExecutionService.buildExecutionRequest(code, runtimeInfo, testInput);

		const executionRes = await ExecutionService.runPistonExecution(fastify, requestObject, params);

		if (!isPistonExecutionResponseSuccess(executionRes)) {
			throw new PistonError(executionRes.message);
		}

		return ExecutionService.buildExecutionResponse(executionRes, testOutput);
	}

	private static async validateAndFindRuntime(fastify: FastifyInstance, language: string) {
		const runtimes = await fastify.runtimes();
		if (!arePistonRuntimes(runtimes)) {
			throw new ServiceUnavailableError();
		}

		const runtimeInfo = findRuntime(runtimes, language);
		if (!runtimeInfo) {
			throw new ValidationError({ language }, "Unsupported language");
		}

		return runtimeInfo;
	}

	private static buildExecutionRequest(
		code: string,
		runtimeInfo: { language: string; version: string },
		testInput: string
	): PistonExecutionRequest {
		return {
			language: runtimeInfo.language,
			version: runtimeInfo.version,
			files: [{ content: code }],
			stdin: testInput
		};
	}

	private static async runPistonExecution(
		fastify: FastifyInstance,
		requestObject: PistonExecutionRequest,
		params: CodeExecutionParams
	): Promise<PistonExecutionResponse> {
		try {
			return await fastify.piston(requestObject);
		} catch (err: unknown) {
			fastify.log.error({ err, params }, "Error during code execution");
			if (isFetchError(err) && err.cause?.code === "ECONNREFUSED") {
				throw new ServiceUnavailableError();
			}

			throw new InternalServerError();
		}
	}

	private static buildExecutionResponse(
		executionRes: PistonExecutionResponseSuccess,
		testOutput: string
	) {
		const { run, compile } = executionRes;
		
        const puzzleResultInformation = calculateResults([testOutput], [executionRes]);

		return { run, compile, puzzleResultInformation };
	}
}
