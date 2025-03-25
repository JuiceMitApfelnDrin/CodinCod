import { z } from "zod";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";
import { objectIdSchema } from "../../common/schema/object-id.js";
import { userDtoSchema } from "../../user/schema/user-dto.schema.js";
import { COMMENT_CONFIG } from "../config/comment-config.js";

export const baseComment = z.object({
	author: objectIdSchema.or(userDtoSchema),
	text: z.string().min(COMMENT_CONFIG.minTextLength).max(COMMENT_CONFIG.maxTextLength),
	upvote: z.number(),
	downvote: z.number(),
	createdAt: acceptedDateSchema.optional(),
	updatedAt: acceptedDateSchema.optional()
});

type BaseCommentEntity = z.infer<typeof baseComment> & {
	comments: BaseCommentEntity[];
};

export const commentEntitySchema: z.ZodType<BaseCommentEntity> = baseComment.extend({
	comments: z.lazy(() => commentEntitySchema.array())
});

export type CommentEntity = z.infer<typeof commentEntitySchema>;
