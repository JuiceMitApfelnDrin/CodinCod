import { FastifyInstance, FastifyReply } from "fastify";
import {
	arePistonRuntimes,
	PistonExecutionRequest,
	PistonExecutionResponse,
	PistonRuntime
} from "types";
import { findRuntime } from "@/utils/functions/findRuntimeInfo.js";
import {
	sendValidationError,
	sendInternalError,
	handleAndSendError
} from "./error.helpers.js";

export async function validatePistonService(
	fastify: FastifyInstance,
	reply: FastifyReply,
	path?: string
): Promise<PistonRuntime[] | null> {
	const runtimes = await fastify.runtimes();

	if (!arePistonRuntimes(runtimes)) {
		sendInternalError(reply, "Code execution service is unavailable", path);
		return null;
	}

	return runtimes;
}

export function validateLanguageSupport(
	runtimes: PistonRuntime[],
	language: string,
	reply: FastifyReply,
	path?: string
): PistonRuntime | null {
	const runtimeInfo = findRuntime(runtimes, language);

	if (!runtimeInfo) {
		sendValidationError(
			reply,
			"Unsupported language",
			{ language: `Language "${language}" is not supported` },
			path
		);
		return null;
	}

	return runtimeInfo;
}

export async function executePistonRequest(
	fastify: FastifyInstance,
	request: PistonExecutionRequest,
	reply: FastifyReply,
	path?: string
): Promise<PistonExecutionResponse | null> {
	try {
		return await fastify.piston(request);
	} catch (error) {
		handleAndSendError(reply, error, path);
		return null;
	}
}
