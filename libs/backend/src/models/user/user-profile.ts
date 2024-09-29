import { Schema } from "mongoose";

export const profileSchema = new Schema({
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
