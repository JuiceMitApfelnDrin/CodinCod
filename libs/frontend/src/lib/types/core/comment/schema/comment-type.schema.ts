import { z } from "zod";
import { getValues } from "../../../utils/functions/get-values.js";
import { commentTypeEnum } from "../enum/comment-type-enum.js";

export const commentTypeSchema = z.enum(getValues(commentTypeEnum));

export type CommentType = z.infer<typeof commentTypeSchema>;
