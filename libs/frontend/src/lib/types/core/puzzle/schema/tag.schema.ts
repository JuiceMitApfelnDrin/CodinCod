import { z } from "zod";
import { getValues } from "../../../utils/functions/get-values.js";
import { TagEnum } from "../enum/tag-enum.js";

export const tagSchema = z.enum(getValues(TagEnum));
export type Tag = z.infer<typeof tagSchema>;
