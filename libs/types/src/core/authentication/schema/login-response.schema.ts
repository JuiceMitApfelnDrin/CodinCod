import { z } from "zod";
import { messageSchema } from "../../common/schema/message.schema.js";

export const loginResponseSchema = z.object({
	message: messageSchema,
});
export type LoginResponse = z.infer<typeof loginResponseSchema>;
