import { FastifyInstance } from "fastify";
import healthRoutes from "./routes/health/index.js";
import puzzleRoutes from "./routes/puzzle/index.js";
import submissionRoutes from "./routes/submission/index.js";
import indexRoutes from "./routes/index.js";
import registerRoutes from "./routes/register/index.js";
import loginRoutes from "./routes/login/index.js";
import userRoutes from "./routes/user/index.js";
import { backendParams, backendUrls } from "types";
import puzzleByIdRoutes from "./routes/puzzle/[id]/index.js";
import executeRoutes from "./routes/execute/index.js";
import userByUsernameIsAvailableRoutes from "./routes/user/[username]/isAvailable/index.js";
import userByUsernameRoutes from "./routes/user/[username]/index.js";
import userByUsernameActivityRoutes from "./routes/user/[username]/activity/index.js";
import submissionGameRoutes from "./routes/submission/game/index.js";
import puzzleLanguagesRoutes from "./routes/puzzle/languages/index.js";
import submissionByIdRoutes from "./routes/submission/[id]/index.js";
import preferencesRoutes from "./routes/account/preferences/index.js";
import puzzleByIdSolutionRoutes from "./routes/puzzle/[id]/solution/index.js";
import puzzleByIdCommentRoutes from "./routes/puzzle/[id]/comment/index.js";
import commentByIdRoutes from "./routes/comment/[id]/index.js";
import commentByIdVoteRoutes from "./routes/comment/[id]/vote/index.js";
import commentByIdCommentRoutes from "./routes/comment/[id]/comment/index.js";
import userByUsernamePuzzleRoutes from "./routes/user/[username]/puzzle/index.js";

export default async function router(fastify: FastifyInstance) {
	fastify.register(indexRoutes, { prefix: backendUrls.ROOT });
	fastify.register(registerRoutes, { prefix: backendUrls.REGISTER });
	fastify.register(loginRoutes, { prefix: backendUrls.LOGIN });
	fastify.register(userRoutes, { prefix: backendUrls.USER });
	fastify.register(userByUsernameRoutes, {
		prefix: backendUrls.userByUsername(backendParams.USERNAME)
	});
	fastify.register(userByUsernameActivityRoutes, {
		prefix: backendUrls.userByUsernameActivity(backendParams.USERNAME)
	});
	fastify.register(userByUsernamePuzzleRoutes, {
		prefix: backendUrls.userByUsernamePuzzle(backendParams.USERNAME)
	});
	fastify.register(userByUsernameIsAvailableRoutes, {
		prefix: backendUrls.userByUsernameIsAvailable(backendParams.USERNAME)
	});
	fastify.register(puzzleRoutes, { prefix: backendUrls.PUZZLE });
	fastify.register(healthRoutes, { prefix: backendUrls.HEALTH });
	fastify.register(executeRoutes, { prefix: backendUrls.EXECUTE });
	fastify.register(submissionRoutes, { prefix: backendUrls.SUBMISSION });
	fastify.register(submissionByIdRoutes, { prefix: backendUrls.submissionById(backendParams.ID) });
	fastify.register(submissionGameRoutes, { prefix: backendUrls.SUBMISSION_GAME });
	fastify.register(puzzleLanguagesRoutes, { prefix: backendUrls.PUZZLE_LANGUAGES });
	fastify.register(puzzleByIdRoutes, { prefix: backendUrls.puzzleById(backendParams.ID) });
	fastify.register(puzzleByIdCommentRoutes, {
		prefix: backendUrls.puzzleByIdComment(backendParams.ID)
	});
	fastify.register(puzzleByIdSolutionRoutes, {
		prefix: backendUrls.puzzleByIdSolution(backendParams.ID)
	});
	fastify.register(commentByIdRoutes, { prefix: backendUrls.commentById(backendParams.ID) });
	fastify.register(commentByIdCommentRoutes, {
		prefix: backendUrls.commentByIdComment(backendParams.ID)
	});
	fastify.register(commentByIdVoteRoutes, {
		prefix: backendUrls.commentByIdVote(backendParams.ID)
	});
	fastify.register(preferencesRoutes, { prefix: backendUrls.ACCOUNT_PREFERENCES });
}
