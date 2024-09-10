import { FastifyInstance } from "fastify";
import {
	LanguageLabel,
	PistonExecuteRequest,
	PistonExecuteResponse,
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

		let run = executionRes.run;
		let compile = executionRes.compile;

		// determine result
		// compare stdin to stdout

		// isMatch:
		// response.run.output.trim() === request.expectedOutput.trim() ||
		// request.expectedOutput.trim() === response.run.stdout.trim()

		run.result = calculateResult(run.output, testOutput);

		// if (compile) {
		// 	compile.result = calculateResult(compile.output, testOutput)
		// }

		console.log({ run, compile, testOutput, testInput });

		return reply.status(200).send({
			run,
			compile
		});
	});
}
