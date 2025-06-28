import type { z } from 'zod';
import { commentEntitySchema } from './comment-entity.schema.js';
import { objectIdSchema } from '../../common/schema/object-id.js';

export const createCommentSchema = commentEntitySchema
	.extend({
		replyOn: objectIdSchema.optional(),
	})
	.pick({
		replyOn: true,
		text: true,
	});

export type CreateComment = z.infer<typeof createCommentSchema>;
