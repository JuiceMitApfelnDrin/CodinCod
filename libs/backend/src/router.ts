import { FastifyInstance } from "fastify";
import healthRoutes from "./routes/health/index.js";
import puzzleRoutes from "./routes/puzzle/index.js";
import submissionRoutes from "./routes/submission/index.js";
import indexRoutes from "./routes/index.js";
import registerRoutes from "./routes/register/index.js";
import loginRoutes from "./routes/login/index.js";
import logoutRoutes from "./routes/logout/index.js";
import userRoutes from "./routes/user/index.js";
import { backendParams, backendUrls, banTypeEnum } from "types";
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
import userMeRoutes from "./routes/user/me/index.js";
import reportRoutes from "./routes/report/index.js";
import moderationReportByIdRoutes from "./routes/moderation/report/[id]/resolve/index.js";
import moderationReviewRoutes from "./routes/moderation/review/index.js";
import moderationPuzzleByIdApproveRoutes from "./routes/moderation/puzzle/[id]/approve/index.js";
import moderationPuzzleByIdReviseRoutes from "./routes/moderation/puzzle/[id]/revise/index.js";
import moderationUserByIdBanUnbanRoutes from "./routes/moderation/user/[id]/unban/index.js";
import moderationUserByIdBanHistoryRoutes from "./routes/moderation/user/[id]/ban/history/index.js";
import moderationUserByIdBanPermanentRoutes from "./routes/moderation/user/[id]/ban/permanent/index.js";
import moderationUserByIdBanTemporaryRoutes from "./routes/moderation/user/[id]/ban/temporary/index.js";
import programmingLanguageRoutes from "./routes/programming-language/index.js";
import programmingLanguageByIdRoutes from "./routes/programming-language/[id]/index.js";

export default async function router(fastify: FastifyInstance) {
	fastify.register(indexRoutes, { prefix: backendUrls.ROOT });
	fastify.register(registerRoutes, { prefix: backendUrls.REGISTER });
	fastify.register(loginRoutes, { prefix: backendUrls.LOGIN });
	fastify.register(logoutRoutes, { prefix: backendUrls.LOGOUT });
	fastify.register(userRoutes, { prefix: backendUrls.USER });
	fastify.register(userMeRoutes, { prefix: backendUrls.USER_ME });
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
	fastify.register(submissionByIdRoutes, {
		prefix: backendUrls.submissionById(backendParams.ID)
	});
	fastify.register(submissionGameRoutes, {
		prefix: backendUrls.SUBMISSION_GAME
	});
	fastify.register(puzzleLanguagesRoutes, {
		prefix: backendUrls.PUZZLE_LANGUAGES
	});
	fastify.register(programmingLanguageRoutes, {
		prefix: backendUrls.PROGRAMMING_LANGUAGE
	});
	fastify.register(programmingLanguageByIdRoutes, {
		prefix: backendUrls.programmingLanguageById(backendParams.ID)
	});
	fastify.register(puzzleByIdRoutes, {
		prefix: backendUrls.puzzleById(backendParams.ID)
	});
	fastify.register(puzzleByIdCommentRoutes, {
		prefix: backendUrls.puzzleByIdComment(backendParams.ID)
	});
	fastify.register(puzzleByIdSolutionRoutes, {
		prefix: backendUrls.puzzleByIdSolution(backendParams.ID)
	});
	fastify.register(commentByIdRoutes, {
		prefix: backendUrls.commentById(backendParams.ID)
	});
	fastify.register(commentByIdCommentRoutes, {
		prefix: backendUrls.commentByIdComment(backendParams.ID)
	});
	fastify.register(commentByIdVoteRoutes, {
		prefix: backendUrls.commentByIdVote(backendParams.ID)
	});
	fastify.register(preferencesRoutes, {
		prefix: backendUrls.ACCOUNT_PREFERENCES
	});
	fastify.register(reportRoutes, { prefix: backendUrls.REPORT });
	fastify.register(moderationReviewRoutes, {
		prefix: backendUrls.MODERATION_REVIEW
	});
	fastify.register(moderationPuzzleByIdApproveRoutes, {
		prefix: backendUrls.moderationPuzzleApprove(backendParams.ID)
	});
	fastify.register(moderationPuzzleByIdReviseRoutes, {
		prefix: backendUrls.moderationPuzzleRevise(backendParams.ID)
	});
	fastify.register(moderationReportByIdRoutes, {
		prefix: backendUrls.moderationReportResolve(backendParams.ID)
	});
	fastify.register(moderationUserByIdBanUnbanRoutes, {
		prefix: backendUrls.moderationUserByIdUnban(backendParams.ID)
	});
	fastify.register(moderationUserByIdBanHistoryRoutes, {
		prefix: backendUrls.moderationUserByIdBanHistory(backendParams.ID)
	});
	fastify.register(moderationUserByIdBanPermanentRoutes, {
		prefix: backendUrls.moderationUserByIdBanByType(
			backendParams.ID,
			banTypeEnum.PERMANENT
		)
	});
	fastify.register(moderationUserByIdBanTemporaryRoutes, {
		prefix: backendUrls.moderationUserByIdBanByType(
			backendParams.ID,
			banTypeEnum.TEMPORARY
		)
	});
}
