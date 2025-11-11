import { z } from "zod";
import { getValues } from "../../../utils/functions/get-values.js";
import { ProblemTypeEnum } from "../enum/problem-type-enum.js";

export const problemTypeSchema = z.enum(getValues(ProblemTypeEnum));
export type ProblemType = z.infer<typeof problemTypeSchema>;
