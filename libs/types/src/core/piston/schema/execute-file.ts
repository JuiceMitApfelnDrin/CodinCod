import { z } from "zod";
import { PistonFileEncodingEnum } from "../enum/piston-file-encoding-enum.js";

const pistonFileEncoding = z.enum([
	PistonFileEncodingEnum.BASE64,
	PistonFileEncodingEnum.HEX,
	PistonFileEncodingEnum.UTF8
]);
export type PistonFileEncoding = z.infer<typeof pistonFileEncoding>;

export const pistonFileSchema = z.object({
	name: z.string().optional(),
	content: z.string(),
	encoding: pistonFileEncoding.optional()
});
export type PistonFile = z.infer<typeof pistonFileSchema>;
