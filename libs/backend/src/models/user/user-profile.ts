import { Schema } from "mongoose";
import { UserProfile } from "types";

export const profileSchema = new Schema<UserProfile>({
	bio: {
		required: false,
		trim: true,
		type: String,
	},
	location: {
		required: false,
		trim: true,
		type: String,
	},
	picture: {
		required: false,
		trim: true,
		type: String,
	},
	socials: {
		required: false,
		type: [
			{
				trim: true,
				type: String
			}
		]
	}
});
