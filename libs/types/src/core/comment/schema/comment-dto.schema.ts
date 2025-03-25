import { z } from "zod";
import { objectIdSchema } from "../../common/schema/object-id.js";
import { baseComment, commentEntitySchema } from "./comment.schema.js";

const baseCommentDtoSchema = baseComment.extend({
	_id: objectIdSchema
});

type BaseCommentDto = z.infer<typeof baseCommentDtoSchema> & {
	comments: (BaseCommentDto | string)[];
};

export const commentDtoSchema: z.ZodType<BaseCommentDto> = baseCommentDtoSchema.extend({
	comments: z.array(z.lazy(() => objectIdSchema.or(commentDtoSchema)))
});

export type CommentDto = z.infer<typeof commentDtoSchema>;

export function isCommentDto(data: unknown): data is CommentDto {
	return commentDtoSchema.safeParse(data).success;
}
