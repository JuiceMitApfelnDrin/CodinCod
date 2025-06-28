import { z } from 'zod';
import { acceptedDateSchema } from '../../common/schema/accepted-date.js';
import { objectIdSchema } from '../../common/schema/object-id.js';
import { userDtoSchema } from '../../user/schema/user-dto.schema.js';
import { COMMENT_CONFIG } from '../config/comment-config.js';
import { commentTypeSchema } from './comment-type.schema.js';

const authorSchema = z.union([objectIdSchema, userDtoSchema]);

export const commentEntitySchema = z.object({
	author: authorSchema,
	text: z
		.string()
		.min(COMMENT_CONFIG.minTextLength)
		.max(COMMENT_CONFIG.maxTextLength),
	upvote: z.number().int().min(0).default(0),
	downvote: z.number().int().min(0).default(0),
	createdAt: acceptedDateSchema.optional(),
	updatedAt: acceptedDateSchema.optional(),
	commentType: commentTypeSchema,
	comments: z.array(objectIdSchema),
	parentId: objectIdSchema,
});

export type CommentEntity = z.infer<typeof commentEntitySchema>;
