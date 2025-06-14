import { z } from "zod";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";
import { objectIdSchema } from "../../common/schema/object-id.js";
import { userDtoSchema } from "../../user/schema/user-dto.schema.js";
import { COMMENT_CONFIG } from "../config/comment-config.js";
import { commentTypeSchema } from "./comment-type.schema.js";

const authorSchema = z.union([objectIdSchema, userDtoSchema]);

export const baseComment = z.object({
	author: authorSchema,
	text: z
		.string()
		.min(COMMENT_CONFIG.minTextLength)
		.max(COMMENT_CONFIG.maxTextLength),
	upvote: z.number(),
	downvote: z.number(),
	createdAt: acceptedDateSchema.optional(),
	updatedAt: acceptedDateSchema.optional(),
	commentType: commentTypeSchema,
});

type BaseCommentEntity = z.infer<typeof baseComment> & {
	comments: BaseCommentEntity[];
};

export const commentEntitySchema = baseComment.extend({
	comments: z.array(z.lazy(() => commentEntitySchema)),
}) as unknown as z.ZodType<BaseCommentEntity>;

export type CommentEntity = z.infer<typeof commentEntitySchema>;
