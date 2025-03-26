import mongoose from "mongoose";
import { z } from "zod";

export const objectIdSchema = z.preprocess(
	(val) => {
		if (val instanceof mongoose.Types.ObjectId) {
			return val.toString();
		}
		return val;
	},
	z.string().refine((val) => {
		return mongoose.Types.ObjectId.isValid(val);
	})
);

export type ObjectId = z.infer<typeof objectIdSchema>;
