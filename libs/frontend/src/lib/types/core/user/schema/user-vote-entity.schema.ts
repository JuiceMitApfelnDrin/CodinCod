import { z } from "zod";
import { voteTypesSchema } from "../../common/schema/vote-types.schema.js";
import { objectIdSchema } from "../../common/schema/object-id.js";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";
import { userDtoSchema } from "./user-dto.schema.js";

export const userVoteEntitySchema = z.object({
	author: objectIdSchema.or(userDtoSchema),
	type: voteTypesSchema,
	votedOn: objectIdSchema,
	createdAt: acceptedDateSchema.optional(),
});
export type UserVoteEntity = z.infer<typeof userVoteEntitySchema>;
