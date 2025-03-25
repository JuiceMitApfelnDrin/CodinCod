import mongoose from "mongoose";
import { z } from "zod";

export const objectIdSchema = z
	.string()
	.refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Invalid id" });

// commented out because above might be good enough, if no issues arise, can be deleted in a future update :+1:
// export const objectIdSchema = z.preprocess(
// 	(val) => {
// 		if (val instanceof mongoose.Types.ObjectId) {
// 			return val.toString();
// 		}
// 		return val;
// 	},
// 	z.string().refine((val) => {
// 		return mongoose.Types.ObjectId.isValid(val);
// 	})
// );

export type ObjectId = z.infer<typeof objectIdSchema>;
