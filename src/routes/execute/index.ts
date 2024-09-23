import { FastifyInstance } from "fastify";
import {
	isPistonExecuteResponseSuccess,
	LanguageLabel,
	PistonExecuteRequest,
	PistonExecuteResponse,
	pistonExecuteResponseSuccessSchema,
	supportedLanguages
} from "types";
import { calculateResult } from "../../utils/functions/calculate-result.js";

type ExecuteParams = {
	Body: {
		code: string;
		language: LanguageLabel;
		testInput: string;
		testOutput: string;
	};
};

export default async function executeRoutes(fastify: FastifyInstance) {
	fastify.post<ExecuteParams>("/", async (request, reply) => {
		const { code, language, testInput, testOutput } = request.body;

		const requestObject: PistonExecuteRequest = {
			language: supportedLanguages[language].language,
			version: supportedLanguages[language].version,
			files: [{ content: code }],
			stdin: testInput
		};
		const executionRes: PistonExecuteResponse = await fastify.piston(requestObject);

		if (!isPistonExecuteResponseSuccess(executionRes)) {
			return reply.status(500).send({ error: "Error with piston.", message: executionRes.message });
		}

		let run = executionRes.run;
		let compile = executionRes.compile;

		run.result = calculateResult(run.output, testOutput);

		return reply.status(200).send({
			run,
			compile
		});
	});
}
