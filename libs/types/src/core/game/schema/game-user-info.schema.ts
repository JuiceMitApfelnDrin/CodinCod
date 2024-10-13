import { z } from "zod";
import { authenticatedInfoSchema } from "../../authentication/index.js";
import { acceptedDateSchema } from "../../common/index.js";

export const gameUserInfoSchema = z.object({
	userId: authenticatedInfoSchema.shape.userId,
	username: authenticatedInfoSchema.shape.username,
	joinedAt: acceptedDateSchema,
	socket: z.any()
});
export type GameUserInfo = z.infer<typeof gameUserInfoSchema> & { socket: WebSocket };
