import { FastifyInstance } from "fastify";
import healthRoutes from "./routes/health/index.js";
import puzzleRoutes from "./routes/puzzle/index.js";
import submissionRoutes from "./routes/submission/index.js";
import indexRoutes from "./routes/index.js";
import registerRoutes from "./routes/register/index.js";
import loginRoutes from "./routes/login/index.js";
import userRoutes from "./routes/user/index.js";
import { backendUrls } from "types";
import puzzleByIdRoutes from "./routes/puzzle/[id]/index.js";
import executeRoutes from "./routes/execute/index.js";
import userByUsernameIsAvailableRoutes from "./routes/user/[username]/isAvailable/index.js";
import userByUsernameRoutes from "./routes/user/[username]/index.js";
import userByUsernameActivityRoutes from "./routes/user/[username]/activity/index.js";

export default async function router(fastify: FastifyInstance) {
	fastify.register(indexRoutes, { prefix: backendUrls.ROOT });
	fastify.register(registerRoutes, { prefix: backendUrls.REGISTER });
	fastify.register(loginRoutes, { prefix: backendUrls.LOGIN });
	fastify.register(userRoutes, { prefix: backendUrls.USER });
	fastify.register(userByUsernameRoutes, { prefix: backendUrls.USER_BY_USERNAME });
	fastify.register(userByUsernameActivityRoutes, { prefix: backendUrls.USER_BY_USERNAME_ACTIVITY });
	fastify.register(userByUsernameIsAvailableRoutes, {
		prefix: backendUrls.USER_BY_USERNAME_IS_AVAILABLE
	});
	fastify.register(puzzleRoutes, { prefix: backendUrls.PUZZLE });
	fastify.register(healthRoutes, { prefix: backendUrls.HEALTH });
	fastify.register(executeRoutes, { prefix: backendUrls.EXECUTE });
	fastify.register(submissionRoutes, { prefix: backendUrls.SUBMISSION });
	fastify.register(puzzleByIdRoutes, { prefix: backendUrls.PUZZLE_DETAIL });
}
