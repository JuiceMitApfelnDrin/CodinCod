import { FastifyInstance } from "fastify";
import { backendUrls } from "types";
import executeRoutes from "./routes/execute/index.ts";
import healthRoutes from "./routes/health/index.ts";
import indexRoutes from "./routes/index.ts";
import loginRoutes from "./routes/login/index.ts";
import puzzleDetailRoutes from "./routes/puzzle/[id]/index.ts";
import puzzleRoutes from "./routes/puzzle/index.ts";
import registerRoutes from "./routes/register/index.ts";
import submissionRoutes from "./routes/submission/index.ts";
import userRoutes from "./routes/user/index.ts";

export default async function router(fastify: FastifyInstance) {
	fastify.register(indexRoutes, { prefix: backendUrls.ROOT });
	fastify.register(registerRoutes, { prefix: backendUrls.REGISTER });
	fastify.register(loginRoutes, { prefix: backendUrls.LOGIN });
	fastify.register(userRoutes, { prefix: backendUrls.USER });
	fastify.register(puzzleRoutes, { prefix: backendUrls.PUZZLE });
	fastify.register(healthRoutes, { prefix: backendUrls.HEALTH });
	fastify.register(executeRoutes, { prefix: backendUrls.EXECUTE });
	fastify.register(submissionRoutes, { prefix: backendUrls.SUBMISSION });
	fastify.register(puzzleDetailRoutes, { prefix: backendUrls.PUZZLE_DETAIL });
}
