import { z } from "zod";
import { messageSchema } from "../message.schema.js";
import { userEntitySchema } from "../user/user-entity.schema.js";

export const registerResponseSchema = z.object({
	message: messageSchema,
	user: userEntitySchema
		.pick({
			createdAt: true,
			username: true,
			email: true
		})
		.optional()
});
export type RegistrationResponse = z.infer<typeof registerResponseSchema>;
