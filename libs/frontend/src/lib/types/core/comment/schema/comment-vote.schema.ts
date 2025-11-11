import { z } from "zod";
import { voteTypesSchema } from "../../common/schema/vote-types.schema.js";

export const commentVoteRequestSchema = z.object({
	type: voteTypesSchema
});

export type CommentVoteRequest = z.infer<typeof commentVoteRequestSchema>;
