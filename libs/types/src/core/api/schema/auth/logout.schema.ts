import { z } from "zod";
import { messageSchema } from "../../../common/schema/message.schema.js";

/**
 * POST /logout - User logout
 */
export const logoutResponseSchema = messageSchema;

export type LogoutResponse = z.infer<typeof logoutResponseSchema>;
