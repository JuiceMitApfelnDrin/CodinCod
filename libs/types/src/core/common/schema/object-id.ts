import { ObjectId as BsonObjectId } from "bson";
import { z } from "zod";

export const objectIdSchema = z.preprocess(
	(val: unknown) => {
		if (val == null) {
			return val;
		}

		if (typeof val === "string") {
			return val;
		}

		if (val && typeof val === "object" && typeof val.toString === "function") {
			return val.toString();
		}

		return String(val);
	},
	z.string().refine((val) => {
		return BsonObjectId.isValid(val);
	}),
);

export type ObjectId = z.infer<typeof objectIdSchema>;
