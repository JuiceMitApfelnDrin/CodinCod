import { z } from "zod";
import { TagEnum } from "../enum/tag-enum.js";
import { getValues } from "../../../utils/functions/get-values.js";

export const tagSchema = z.enum(getValues(TagEnum));
export type Tag = z.infer<typeof tagSchema>;
