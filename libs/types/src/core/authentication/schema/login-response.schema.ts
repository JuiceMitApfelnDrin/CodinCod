import { z } from "zod";
import { messageSchema } from "../../common/schema/message.schema.js";
// import { tokenSchema } from "../token.schema.js";
// import { userEntitySchema } from "../user/user-entity.schema.js";

export const loginResponseSchema = z.object({
	message: messageSchema
	// token: tokenSchema,
	// user: userEntitySchema.pick({
	//     createdAt: true,
	//     username: true,
	// }).optional()
});
export type LoginResponse = z.infer<typeof loginResponseSchema>;
