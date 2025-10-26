import { z } from "zod";
import { ProblemTypeEnum } from "../enum/problem-type-enum.js";
import { getValues } from "../../../utils/functions/get-values.js";

export const problemTypeSchema = z.enum(getValues(ProblemTypeEnum));
export type ProblemType = z.infer<typeof problemTypeSchema>;
