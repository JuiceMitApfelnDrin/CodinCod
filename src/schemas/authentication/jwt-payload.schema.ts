import { z } from "zod";
import { userEntitySchema } from "../user/user-entity.schema.js";

export const jwtPayloadSchema = z.object({
	userId: z.string(),
	username: userEntitySchema.shape.username
});
export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
