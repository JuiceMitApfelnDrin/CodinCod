import { FastifyInstance } from "fastify";
import {
    httpResponseCodes,
    isAuthenticatedInfo,
    createPermanentBanSchema,
} from "types";
import moderatorOnly from "../../../../../../plugins/middleware/moderator-only.js";
import { ParamsId } from "../../../../../../types/types.js";
import {
    createPermanentBan,
} from "../../../../../../utils/moderation/escalation.js";

export default async function moderationUserByIdBanPermanentRoutes(
    fastify: FastifyInstance
) {
    fastify.post<ParamsId>(
        "/",
        {
            onRequest: moderatorOnly
        },
        async (request, reply) => {
            const { id } = request.params;

            const parseResult = createPermanentBanSchema.safeParse(request.body);
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
                const ban = await createPermanentBan(
                    id,
                    request.user.userId,
                    parseResult.data.reason
                );

                return reply.send({
                    message: "User permanently banned",
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
