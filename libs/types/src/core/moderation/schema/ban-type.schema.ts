import { z } from "zod";
import { getValues } from "../../../utils/functions/get-values.js";
import { banTypeEnum } from "../enum/ban-type-enum.js";

export const banTypeSchema = z.enum(getValues(banTypeEnum));
export type BanType = z.infer<typeof banTypeSchema>;

export function isBanType(data: any): data is BanType {
	return banTypeSchema.safeParse(data).success;
}
