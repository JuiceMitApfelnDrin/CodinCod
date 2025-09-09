import { z } from "zod";
import { objectIdSchema } from "../../common/schema/object-id.js";
import { commentEntitySchema } from "./comment-entity.schema.js";

const commentDtoSchema = commentEntitySchema.extend({
	_id: objectIdSchema,
	comments: z.array(objectIdSchema),
	parentId: objectIdSchema,
});

export type CommentDto = z.infer<typeof commentDtoSchema>;

export function isCommentDto(data: unknown): data is CommentDto {
	return commentDtoSchema.safeParse(data).success;
}
