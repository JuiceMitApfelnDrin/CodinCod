import { describe, beforeEach, afterEach, it, expect } from "vitest";
import fastify, { FastifyInstance } from "fastify";
import {
	backendUrls,
	healthResponse,
	httpRequestMethod,
	httpResponseCodes
} from "types";
import router from "@/router.js";

describe("Health Check Endpoint", () => {
	let app: FastifyInstance;

	beforeEach(async () => {
		app = fastify();
		await app.register(router);
		await app.ready();
	});

	afterEach(async () => {
		await app.close();
	});

	it(`should return ${httpResponseCodes.SUCCESSFUL.OK} and status ${healthResponse}`, async () => {
		const response = await app.inject({
			method: httpRequestMethod.GET,
			url: backendUrls.HEALTH
		});

		expect(response.statusCode).toBe(httpResponseCodes.SUCCESSFUL.OK);
		expect(response.json()).toEqual({ status: healthResponse });
	});
});
