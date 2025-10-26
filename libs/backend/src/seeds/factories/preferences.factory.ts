import { faker } from "@faker-js/faker";
import Preferences, { PreferencesDocument } from "../../models/preferences/preferences.js";
import { themeOption } from "types";
import { randomFromArray } from "../utils/seed-helpers.js";
import { Types } from "mongoose";
import { ObjectId } from "mongoose";

export interface PreferencesFactoryOptions {
	ownerId: Types.ObjectId;
}

/**
 * Create user preferences
 */
export async function createPreferences(
	options: PreferencesFactoryOptions
): Promise<Types.ObjectId> {
	const themes = Object.values(themeOption);

	const preferencesData: Partial<PreferencesDocument> = {
		owner: options.ownerId as unknown as ObjectId,
		...(faker.helpers.maybe(() => ({ theme: randomFromArray(themes) }), { probability: 0.7 }) || {}),
		...(faker.helpers.maybe(
			() => ({ preferredLanguage: randomFromArray(["python", "javascript", "java", "cpp"]) }),
			{ probability: 0.6 }
		) || {}),
		blockedUsers: [] // Could add some blocked users if needed
	};

	const preferences = new Preferences(preferencesData);
	await preferences.save();

	return preferences._id as Types.ObjectId;
}

/**
 * Create preferences for multiple users
 */
export async function createMultiplePreferences(
	userIds: Types.ObjectId[]
): Promise<Types.ObjectId[]> {
	const preferencesIds: Types.ObjectId[] = [];

	const userCount = Math.ceil(userIds.length * 0.2);

	for (let i = 0; i < userCount; i++) {
		preferencesIds.push(
			await createPreferences({
				ownerId: userIds[i]
			})
		);
	}

	return preferencesIds;
}
