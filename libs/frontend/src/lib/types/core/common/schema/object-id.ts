// import { ObjectId as BsonObjectId } from "bson";
import { z } from "zod";
// import { isString } from "../../../utils/functions/is-string.js";

export const objectIdSchema = z.uuid();
// z.preprocess(
// 	(val: unknown) => {
// 		if (val == null) {
// 			return val;
// 		}

// 		if (isString(val)) {
// 			return val;
// 		}

// 		if (val && typeof val === "object" && typeof val.toString === "function") {
// 			return val.toString();
// 		}

// 		return String(val);
// 	},
// 	z.string().refine((val) => {
// 		return BsonObjectId.isValid(val);
// 	}),
// );

export type ObjectId = z.infer<typeof objectIdSchema>;

export function isObjectId(data: unknown): data is ObjectId {
	return objectIdSchema.safeParse(data).success;
}
