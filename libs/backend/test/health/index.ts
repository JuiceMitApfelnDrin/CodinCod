import Fastify from "fastify";
import { beforeAll, afterAll, it, expect } from "vitest";
import myApp from "../app"; // Your Fastify app

const fastify = Fastify();
fastify.register(myApp);

beforeAll(async () => await fastify.ready());
afterAll(async () => await fastify.close());

it("POST /user creates a user", async () => {
	const res = await fastify.inject({
		method: "POST",
		url: "/user",
		payload: { name: "John" }
	});

	expect(res.statusCode).toBe(201);
	expect(res.json()).toHaveProperty("id");
});
