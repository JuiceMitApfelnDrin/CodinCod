import { z } from "zod";
import { TagEnum } from "../../enums/tag-enum.js";

export const tagSchema = z.enum([
	TagEnum.ALGORITHMS,
	TagEnum.DATA_STRUCTURES,
	TagEnum.MATHEMATICS,
	TagEnum.STRINGS,
	TagEnum.GRAPH_THEORY,
	TagEnum.DYNAMIC_PROGRAMMING,
	TagEnum.MATH
]);
export type Tag = z.infer<typeof tagSchema>;
