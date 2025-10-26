import { FastifyInstance } from "fastify";
import {
    httpResponseCodes,
    isAuthenticatedInfo,
    createTemporaryBanSchema,
} from "types";
import moderatorOnly from "../../../../../../plugins/middleware/moderator-only.js";
import { ParamsId } from "../../../../../../types/types.js";
import {
    createTemporaryBan,
} from "../../../../../../utils/moderation/escalation.js";

export default async function moderationUserByIdBanTemporaryRoutes(
    fastify: FastifyInstance
) {
    fastify.post<ParamsId>(
        "/",
        {
            onRequest: moderatorOnly
        },
        async (request, reply) => {
            const { id } = request.params;

            const parseResult = createTemporaryBanSchema.safeParse(request.body);
            if (!parseResult.success) {
                return reply
                    .status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
                    .send({ error: parseResult.error.issues });
            }

            if (!isAuthenticatedInfo(request.user)) {
                return reply
                    .status(httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED)
                    .send({ error: "Invalid credentials" });
            }

            try {
                const ban = await createTemporaryBan(
                    id,
                    request.user.userId,
                    parseResult.data.reason,
                    parseResult.data.durationMs
                );

                return reply.send({
                    message: "User temporarily banned",
                    ban
                });
            } catch (error) {
                fastify.log.error(error, "Failed to ban user");
                return reply
                    .status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
                    .send({ error: "Failed to ban user" });
            }
        }
    );
}
