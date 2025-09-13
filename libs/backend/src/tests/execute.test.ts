import { describe, beforeAll, afterAll, it, expect, vi } from "vitest";
import fastify, { FastifyInstance } from "fastify";
import router from "@/router.js";
import { backendUrls, httpRequestMethod, httpResponseCodes } from "types";

vi.mock("@/plugins/middleware/authenticated.js", () => ({
	default: vi.fn((request, _reply, done) => {
		request.user = {
			userId: "test-user-id",
			username: "test-user"
		};
		done();
	})
}));

describe("Execute Endpoint", () => {
	let app: FastifyInstance;

	beforeAll(async () => {
		app = fastify();
		await app.register(router);
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	const tests = [
		{
			name: 'execute with "unknown" language',
			payload: {
				code: "print('hi')",
				language: "unknown",
				testInput: "",
				testOutput: "hi"
			},
			expectedStatus: httpResponseCodes.CLIENT_ERROR.BAD_REQUEST,
			expectedResponse: {
				error: "UNSUPPORTED_LANGUAGE",
				message: "The specified language is not supported",
				timestamp: expect.any(String),
				url: expect.any(String)
			}
		}
	];

	it.each(tests)(
		"Test: $name",
		async ({ payload, expectedStatus, expectedResponse }) => {
			const response = await app.inject({
				method: httpRequestMethod.POST,
				url: backendUrls.EXECUTE,
				payload
			});

			expect(response.statusCode).toBe(expectedStatus);
			expect(response.json()).toEqual(expectedResponse);
		}
	);
});
