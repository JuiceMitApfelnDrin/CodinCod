import { z } from "zod";
import { PistonFileEncodingEnum } from "../enum/piston-file-encoding-enum.js";
import { getValues } from "../../../utils/functions/get-values.js";

const pistonFileEncoding = z.enum(getValues(PistonFileEncodingEnum));
export type PistonFileEncoding = z.infer<typeof pistonFileEncoding>;

export const pistonFileSchema = z.object({
	name: z.string().optional(),
	content: z.string(),
	encoding: pistonFileEncoding.optional()
});
export type PistonFile = z.infer<typeof pistonFileSchema>;
