import { FastifyInstance } from "fastify";
import {
	Language,
	LanguageLabel,
	LanguageVersion,
	pistonUrls,
	POST,
	supportedLanguages
} from "types";

type ExecuteParams = {
	Body: {
		code: string;
		language: LanguageLabel;
		testInput: string;
	};
};
type PistonExecuteResponse = {
	language: string;
	version: string;
	run: {
		signal: string | null;
		output: string;
		stderr: string;
		stdout: string;
		code: number | null;
	};
	compile?: {
		signal: string | null;
		output: string;
		stderr: string;
		stdout: string;
		code: number | null;
	};
};
type PistonFile = {
	name?: string;
	content: string;
	encoding?: "base64" | "hex" | "utf8";
};
type PistonExecuteRequest = {
	language: Language;
	version: LanguageVersion;
	files: PistonFile[];
	stdin?: string;
	args?: any;
	run_timeout?: number; // in milliseconds
	compile_timeout?: number; // in milliseconds for the run stage to finish before bailing out.Must be a number, less than or equal to the configured maximum timeout.Defaults to maximum.
	compile_memory_limit?: number; // in bytes
	run_memory_limit?: number; // in bytes
};

export default async function executeRoutes(fastify: FastifyInstance) {
	fastify.post<ExecuteParams>("/", async (request, reply) => {
		const { code, language, testInput } = request.body;

		const PISTON_API = process.env.PISTON_URI;

		if (PISTON_API) {
			const requestObject: PistonExecuteRequest = {
				language: supportedLanguages[language].language,
				version: supportedLanguages[language].version,
				files: [{ content: code }],
				stdin: testInput
			};

			const res = await fetch(`${PISTON_API}${pistonUrls.EXECUTE}`, {
				method: POST,
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(requestObject)
			});
			const executionRes: PistonExecuteResponse = await res.json();

			const run = executionRes.run;
			const compile = executionRes.compile;

			return reply.status(200).send({
				run,
				compile
			});
		}

		reply.status(500).send({
			error: "the server is missing the environment variable named PISTON_URI"
		});
	});
}
