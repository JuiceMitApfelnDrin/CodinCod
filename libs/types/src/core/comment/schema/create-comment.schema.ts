import { z } from "zod";
import { baseComment } from "./comment.schema.js";
import { objectIdSchema } from "../../common/schema/object-id.js";

export const createCommentSchema = baseComment
	.extend({
		replyOn: objectIdSchema.optional(),
	})
	.pick({
		replyOn: true,
		text: true,
	});

export type CreateComment = z.infer<typeof createCommentSchema>;
