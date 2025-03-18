import { Schema } from "mongoose";
import { UserProfile } from "types";

export const profileSchema = new Schema<UserProfile>({
	picture: {
		type: String,
		required: false,
		trim: true
	},
	bio: {
		type: String,
		required: false,
		trim: true
	},
	location: {
		type: String,
		required: false,
		trim: true
	},
	socials: {
		required: false,
		type: [
			{
				type: String,
				trim: true
			}
		]
	}
});
