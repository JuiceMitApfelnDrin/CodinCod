import { faker } from "@faker-js/faker";
import { generateUser } from "./generateUser";

/**
 * the account endpoint always returns the current logged in user's their account
 */
export const generateAccount = () => {
	return {
		...generateUser(),
		email: faker.internet.email(),
		token: faker.string.binary(),
		preferences: {
			dark: true
		},
		language: "en-GB",
		friends: []
	};
};
