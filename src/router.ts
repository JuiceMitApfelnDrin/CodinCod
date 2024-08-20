import { FastifyInstance } from "fastify";
import healthRoutes from "./routes/health/index.js";
import puzzleRoutes from "./routes/puzzle/index.js";
import submissionRoutes from "./routes/submission/index.js";
import validatorRoutes from "./routes/validator/index.js";
import indexRoutes from "./routes/index.js";
import registerRoutes from "./routes/register/index.js";
import loginRoutes from "./routes/login/index.js";
import userRoutes from "./routes/user/index.js";
import { backendUrls } from "types";
import puzzleDetailRoutes from "./routes/puzzle/[id]/index.js";

export default async function router(fastify: FastifyInstance) {
	fastify.register(indexRoutes, { prefix: backendUrls.ROOT });
	fastify.register(registerRoutes, { prefix: backendUrls.REGISTER });
	fastify.register(loginRoutes, { prefix: backendUrls.LOGIN });
	fastify.register(userRoutes, { prefix: backendUrls.USER });
	fastify.register(puzzleRoutes, { prefix: backendUrls.PUZZLE });
	fastify.register(healthRoutes, { prefix: backendUrls.HEALTH });
	fastify.register(validatorRoutes, { prefix: backendUrls.VALIDATOR });
	fastify.register(submissionRoutes, { prefix: backendUrls.SUBMISSION });
	fastify.register(puzzleDetailRoutes, { prefix: backendUrls.PUZZLE_DETAIL });
}
