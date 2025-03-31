import { z } from "zod";
import { authenticatedInfoSchema } from "../../authentication/schema/authenticated-info.schema.js";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";

export const gameUserInfoSchema = z.object({
	userId: authenticatedInfoSchema.shape.userId,
	username: authenticatedInfoSchema.shape.username,
	joinedAt: acceptedDateSchema
});
export type GameUserInfo = z.infer<typeof gameUserInfoSchema>;
