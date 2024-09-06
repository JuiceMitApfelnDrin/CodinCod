import { FastifyInstance } from "fastify";
import { LanguageLabel, PistonExecuteRequest, supportedLanguages } from "types";

type ExecuteParams = {
	Body: {
		code: string;
		language: LanguageLabel;
		testInput: string;
	};
};

export default async function executeRoutes(fastify: FastifyInstance) {
	fastify.post<ExecuteParams>("/", async (request, reply) => {
		const { code, language, testInput } = request.body;

		// const PISTON_API = process.env.PISTON_URI;

		// if (!PISTON_API) {
		// 	reply.status(500).send({
		// 		error: "The server is missing the environment variable named PISTON_URI, can't execute code"
		// 	});
		// }

		// const requestObject: PistonExecuteRequest = {
		// 	language: supportedLanguages[language].language,
		// 	version: supportedLanguages[language].version,
		// 	files: [{ content: code }],
		// 	stdin: testInput
		// };

		// const res = await fetch(`${PISTON_API}${pistonUrls.EXECUTE}`, {
		// 	method: POST,
		// 	headers: {
		// 		"Content-Type": "application/json"
		// 	},
		// 	body: JSON.stringify(requestObject)
		// });
		// const executionRes: PistonExecuteResponse = await res.json();

		const requestObject: PistonExecuteRequest = {
			language: supportedLanguages[language].language,
			version: supportedLanguages[language].version,
			files: [{ content: code }],
			stdin: testInput
		};
		const executionRes = await fastify.piston(requestObject);

		const run = executionRes.run;
		const compile = executionRes.compile;

		return reply.status(200).send({
			run,
			compile
		});
	});
}
