import { z } from "zod";
import { getValues } from "../../../utils/functions/get-values.js";
import { voteTypeEnum } from "../enum/vote-type-enum.js";

export const voteTypesSchema = z.enum(getValues(voteTypeEnum));

export type VoteType = z.infer<typeof voteTypesSchema>;
