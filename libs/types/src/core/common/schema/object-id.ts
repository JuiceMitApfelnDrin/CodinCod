import mongoose from "mongoose";
import { z } from "zod";

export const objectIdSchema = z.string().refine((val) => {
	return mongoose.Types.ObjectId.isValid(val);
});

export type ObjectId = z.infer<typeof objectIdSchema>;
